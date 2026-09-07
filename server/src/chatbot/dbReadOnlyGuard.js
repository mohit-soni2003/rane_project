const { getAllowedModelNames, GLOBALLY_HIDDEN_FIELDS } = require("./schemaIntrospector");

// ─────────────────────────────────────────────────────────────────────────────
// DB READ-ONLY GUARD
// Every single tool call the chatbot makes passes through here BEFORE it
// touches the database. This is the actual security boundary — not the
// system prompt, not the tool descriptions. Even if Gemini were somehow
// convinced to try something it shouldn't, this layer rejects it.
//
// Three independent checks, all of which must pass:
//   1. Collection allowlist       — only real, registered models
//   2. Aggregation stage/operator allowlist — no $merge, $out, $function,
//      $where, $accumulator with custom JS, etc.
//   3. Field-level redaction      — strip sensitive fields from every
//      result regardless of what projection was requested
//
// Also enforces sane limits (result size, query complexity) so a single
// chat question can't return your entire database or hang the server.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RESULT_DOCS = 200;
const MAX_AGGREGATION_STAGES = 12;
const QUERY_TIMEOUT_MS = 8000;

// Aggregation stages that can write, execute arbitrary code, or reach
// outside the current collection in ways we don't want a chatbot doing.
const FORBIDDEN_AGGREGATION_STAGES = new Set([
    "$merge", "$out",           // write stages
    "$function", "$accumulator", "$where",  // arbitrary JS execution
    "$currentOp", "$listSessions", "$listLocalSessions", // server introspection
    "$planCacheStats", "$indexStats",
    "$collStats",
]);

// $lookup is allowed (it's how the model joins collections for you) but
// its target collection still has to be on the allowlist, checked below.

class GuardRejection extends Error {
    constructor(message) {
        super(message);
        this.name = "GuardRejection";
        this.statusCode = 400;
    }
}

function assertAllowedCollection(collectionOrModelName) {
    const allowed = getAllowedModelNames();
    if (!allowed.includes(collectionOrModelName)) {
        throw new GuardRejection(
            `"${collectionOrModelName}" is not a recognized collection. Available: ${allowed.join(", ")}`
        );
    }
}

// Recursively walks a filter/pipeline object looking for anything on the
// forbidden list, at any nesting depth — a stage could be buried inside
// a $facet or $lookup sub-pipeline.
function assertNoForbiddenOperators(value) {
    if (Array.isArray(value)) {
        value.forEach(assertNoForbiddenOperators);
        return;
    }
    if (value && typeof value === "object") {
        for (const key of Object.keys(value)) {
            if (FORBIDDEN_AGGREGATION_STAGES.has(key)) {
                throw new GuardRejection(`The "${key}" stage/operator is not permitted for this chatbot.`);
            }
            // $lookup's target collection must also be allowed.
            if (key === "$lookup" && value[key]?.from) {
                assertAllowedCollection(value[key].from);
            }
            assertNoForbiddenOperators(value[key]);
        }
    }
}

function assertReasonablePipeline(pipeline) {
    if (!Array.isArray(pipeline)) {
        throw new GuardRejection("Aggregation pipeline must be an array of stages.");
    }
    if (pipeline.length > MAX_AGGREGATION_STAGES) {
        throw new GuardRejection(`Pipeline has too many stages (max ${MAX_AGGREGATION_STAGES}).`);
    }
    assertNoForbiddenOperators(pipeline);
}

// Strips globally-hidden fields (passwords, tokens, etc.) from every
// returned document, regardless of what projection the tool call asked
// for. This runs on the OUTPUT, so a `projection: { password: 1 }`
// request simply never gets a password back.
function redactSensitiveFields(doc) {
    if (Array.isArray(doc)) return doc.map(redactSensitiveFields);
    if (doc && typeof doc === "object") {
        const clean = { ...doc };
        GLOBALLY_HIDDEN_FIELDS.forEach((field) => { delete clean[field]; });
        return clean;
    }
    return doc;
}

function capResultSize(results) {
    if (Array.isArray(results) && results.length > MAX_RESULT_DOCS) {
        return {
            truncated: true,
            totalMatched: results.length,
            results: results.slice(0, MAX_RESULT_DOCS),
        };
    }
    return { truncated: false, results };
}

module.exports = {
    GuardRejection,
    assertAllowedCollection,
    assertReasonablePipeline,
    redactSensitiveFields,
    capResultSize,
    MAX_RESULT_DOCS,
    QUERY_TIMEOUT_MS,
};
