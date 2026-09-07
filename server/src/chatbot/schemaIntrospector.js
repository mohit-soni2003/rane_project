const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA INTROSPECTOR
// Builds a compact, human-readable description of every Mongoose model
// currently registered on this connection — field names, types, and
// which fields are refs to other collections. This is generated from
// your ACTUAL live schemas, not hand-written, so it can never drift out
// of sync with reality the way a manually maintained doc would.
//
// Requires that every model file has already been `require()`d somewhere
// before this runs (usual Mongoose setup — same as your existing app).
// ─────────────────────────────────────────────────────────────────────────────

// Mongoose internal instance types we don't need to describe in detail.
const SIMPLE_TYPE_MAP = {
    String: "string",
    Number: "number",
    Date: "date",
    Boolean: "boolean",
    ObjectId: "id",
    Array: "array",
    Mixed: "mixed",
};

function describeSchemaType(schemaType) {
    const instance = schemaType.instance || "Mixed";
    const base = SIMPLE_TYPE_MAP[instance] || instance.toLowerCase();

    // A ref field (e.g. `project: { type: ObjectId, ref: "Project" }`)
    // is the single most important thing to surface — it's what lets
    // the model know it can join across collections.
    const ref = schemaType.options && schemaType.options.ref;
    if (ref) return `id -> ${ref}`;

    // Arrays of subdocuments (e.g. project.documents, project.approvals)
    // get their nested field names listed too, one level deep — enough
    // for the model to know an embedded array isn't just an opaque blob.
    if (instance === "Array" && schemaType.schema) {
        const nested = Object.keys(schemaType.schema.paths)
            .filter((p) => p !== "_id")
            .map((p) => `${p}:${describeSchemaType(schemaType.schema.paths[p])}`)
            .join(", ");
        return `array<{ ${nested} }>`;
    }
    if (instance === "Array" && schemaType.caster) {
        const casterRef = schemaType.caster.options && schemaType.caster.options.ref;
        if (casterRef) return `array<id -> ${casterRef}>`;
        return `array<${SIMPLE_TYPE_MAP[schemaType.caster.instance] || "mixed"}>`;
    }

    return base;
}

// Fields that should never be described to the model (let alone
// returned in a query result) even though they technically exist on
// the schema — auth secrets, tokens, anything like that.
// Extend this per model as you find more sensitive fields — see
// dbReadOnlyGuard.js, which enforces this list at query time too, not
// just here for documentation purposes.
const GLOBALLY_HIDDEN_FIELDS = new Set([
    "password", "passwordHash",
    "resetPasswordToken", "resetPasswordExpiresAt",
    "verificationToken", "verificationTokenExpiresAt",
    "__v",
]);

function describeModel(modelName) {
    const model = mongoose.model(modelName);
    const paths = model.schema.paths;

    const fields = Object.keys(paths)
        .filter((p) => p !== "_id" && !GLOBALLY_HIDDEN_FIELDS.has(p))
        .map((p) => `  - ${p}: ${describeSchemaType(paths[p])}`)
        .join("\n");

    return `### ${modelName} (collection: ${model.collection.collectionName})\n${fields}`;
}

// Builds the full schema reference text injected into the chatbot's
// system prompt. Cached in memory after first build — call
// invalidateSchemaCache() if you add a model at runtime (rare; usually
// only relevant right after a deploy that adds a new model file).
let cachedSchemaText = null;

function buildSchemaReference() {
    if (cachedSchemaText) return cachedSchemaText;

    const modelNames = mongoose.modelNames().sort();
    cachedSchemaText = modelNames.map(describeModel).join("\n\n");
    return cachedSchemaText;
}

function invalidateSchemaCache() {
    cachedSchemaText = null;
}

// The allowlist of collections the chatbot is permitted to query is
// derived from the exact same registered-models list — there is no
// separate list to keep in sync.
function getAllowedModelNames() {
    return mongoose.modelNames();
}

module.exports = {
    buildSchemaReference,
    invalidateSchemaCache,
    getAllowedModelNames,
    GLOBALLY_HIDDEN_FIELDS,
};
