const { GoogleGenAI } = require("@google/genai");
const { GEMINI_TOOLS } = require("./geminiToolDefinitions");
const { buildSchemaReference } = require("./schemaIntrospector");
const dbTools = require("./dbTools.service");
const { GuardRejection } = require("./dbReadOnlyGuard");

// The Gemini API key lives in server/keys.js (GEMINI_API_KEY), like the other secrets.
const { GEMINI_API_KEY } = require("../../keys");

if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is empty — add it to server/keys.js to enable the AI assistant.");
}

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Models are tried in this order. The first is the fastest and cheapest; if it is
// overloaded (503) or rate-limited (429) we retry briefly, then fall back to the next.
// Checked against this API key: the Gemini 2.5 models are retired for new keys, and
// each 3.x model accepts a different "thinking" setting, so it is set per model.
const MODEL_CHAIN = [
    { name: "gemini-3.5-flash-lite" },                                  // fastest + cheapest — primary (no thinking tokens by default)
    { name: "gemini-3.1-flash-lite" },                                  // fallback, also lite
    { name: "gemini-3.5-flash", thinkingConfig: { thinkingBudget: 0 } }, // last resort: smarter; thinking switched off to save tokens
];

const MAX_TOOL_ROUNDS = 4;       // hard stop so a confused loop can't run forever
const MAX_OUTPUT_TOKENS = 800;   // answers are short, plain text — keeps replies fast and cheap
const MAX_TOOL_RESULT_CHARS = 6000; // cap on how much DB data is sent back to the model
const RETRIES_PER_MODEL = 2;     // extra attempts on the same model before falling back

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Errors that are worth retrying / falling back on (overload, rate limit, transient server errors)
function isTransientError(err) {
    const status = Number(err?.status || err?.code || err?.error?.code);
    if ([429, 500, 502, 503, 504].includes(status)) return true;
    const text = String(err?.message || "");
    return /UNAVAILABLE|overloaded|high demand|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED/i.test(text);
}

// Calls Gemini with retry + model fallback. Returns the response, or throws a
// friendly error (status 503) when every model is busy.
async function generateWithFallback(request) {
    let lastError;
    for (const { name: model, thinkingConfig } of MODEL_CHAIN) {
        for (let attempt = 0; attempt <= RETRIES_PER_MODEL; attempt++) {
            try {
                return await genai.models.generateContent({
                    model,
                    ...request,
                    config: {
                        ...request.config,
                        maxOutputTokens: MAX_OUTPUT_TOKENS,
                        temperature: 0.3,
                        ...(thinkingConfig ? { thinkingConfig } : {}),
                    },
                });
            } catch (err) {
                lastError = err;
                if (!isTransientError(err)) throw err;
                console.warn(`Gemini ${model} busy (attempt ${attempt + 1}): ${err.message?.slice(0, 120)}`);
                if (attempt < RETRIES_PER_MODEL) await sleep(600 * (attempt + 1)); // 0.6s, 1.2s
            }
        }
    }
    const busy = new Error("The AI assistant is very busy right now. Please try again in a few seconds.");
    busy.status = 503;
    busy.cause = lastError;
    throw busy;
}

// Keeps tool results small so every follow-up call stays cheap.
function trimToolResult(result) {
    try {
        if (JSON.stringify(result).length <= MAX_TOOL_RESULT_CHARS) return result;
        if (result && Array.isArray(result.results)) {
            const trimmed = { ...result, results: [...result.results], truncated: true };
            while (trimmed.results.length > 1 && JSON.stringify(trimmed).length > MAX_TOOL_RESULT_CHARS) {
                trimmed.results.length = Math.ceil(trimmed.results.length / 2);
            }
            return trimmed;
        }
    } catch (e) { /* fall through */ }
    return result;
}

// The system instruction is the same every call (the schema is cached), so build it once.
let cachedSystemInstruction = null;
function getSystemInstruction() {
    if (!cachedSystemInstruction) cachedSystemInstruction = buildSystemInstruction();
    return cachedSystemInstruction;
}

function buildSystemInstruction() {
    const schemaText = buildSchemaReference();
    return `You are a read-only database assistant for the admin of an infrastructure/project-management system.

Your job: answer the admin's question about what's in the database, using the query tools available to you. You NEVER modify data — you don't have any write tools, and you should never ask the admin to run a write on your behalf either.

Rules:
- Always use a tool to look up real data before answering a factual question. Never guess or make up numbers, names, or statuses.
- If a question requires joining data across collections (e.g. a client's bills, a project's tasks), use aggregateCollection with $lookup rather than making several separate queryCollection calls when a join is cleaner.
- If a query returns zero results, say so plainly rather than assuming the data doesn't exist for another reason.
- If a result set was truncated (you'll see "truncated": true in the tool result), mention that to the admin rather than presenting it as the complete picture.
- If a question is ambiguous (e.g. "recent" bills — recent by what measure, how many), make a reasonable assumption, state it briefly in plain words, and answer.

How to write your answers — this matters as much as the data:
- Sound like a helpful colleague giving a clear update, not like an AI or a report generator. Start with the answer itself (for example "There are 12 unpaid bills, totalling ₹4,85,000."), then add a few supporting details only if they help.
- Use plain text only. Do NOT use markdown: no asterisks for bold or italics, no # headings, no backticks, no tables or pipe characters, no horizontal lines, no emojis.
- For several items, write a short intro line and then one item per line, each starting with "• " (or "1." for a ranked or ordered list). Keep each line short, with the key facts separated by " – " or commas, e.g. "• Sharma Constructions – ₹1,20,000 – Pending".
- Keep it brief. Usually 2 to 8 lines. For long result sets show the top few, then say how many more there are and offer to show them.
- Write for a business admin: say "client" not "user document", "bill" not "billmodel". Never mention collections, fields, ObjectIds, queries, pipelines, tools, "I ran a query" or "based on the database". Never show raw IDs. Use client names, firm names, titles and invoice or bill numbers instead.
- Format money in Indian style with the ₹ sign (₹1,25,000), dates like 12 Oct 2026, and statuses in normal words (Pending, Paid, Rejected).
- If something is missing or zero, say it simply ("No bills have been submitted yet."). If you cannot answer, say so in one sentence and suggest what to ask instead.

Here is the current database schema (collection names, fields, and types — "id -> X" means a reference to another collection):

${schemaText}`;
}

// Executes a single tool call Gemini requested, routing to the matching
// dbTools function. This is the ONLY place function names get mapped to
// actual DB calls — the mapping is a plain switch, nothing dynamic/eval'd.
async function executeTool(name, args) {
    try {
        switch (name) {
            case "queryCollection":
                return await dbTools.runFind(args.collection, {
                    filter: args.filter || {},
                    projection: args.projection || {},
                    sort: args.sort || {},
                    limit: args.limit,
                });
            case "aggregateCollection":
                return await dbTools.runAggregate(args.collection, args.pipeline || []);
            case "countCollection":
                return await dbTools.runCount(args.collection, args.filter || {});
            case "distinctCollection":
                return await dbTools.runDistinct(args.collection, args.field, args.filter || {});
            default:
                return { error: `Unknown tool "${name}".` };
        }
    } catch (err) {
        if (err instanceof GuardRejection) {
            return { error: err.message };
        }
        return { error: `Query failed: ${err.message}` };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// runAdminChat(message, history)
// `history` is an array of prior turns in Gemini's content format:
//   [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [...] }, ...]
// Pass [] for a fresh conversation. Returns { answer, toolCallLog }.
// toolCallLog is for audit logging — see adminChat.routes.js.
// ─────────────────────────────────────────────────────────────────────────────
async function runAdminChat(message, history = []) {
    const contents = [...history, { role: "user", parts: [{ text: message }] }];
    const toolCallLog = [];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await generateWithFallback({
            contents,
            config: {
                systemInstruction: getSystemInstruction(),
                tools: GEMINI_TOOLS,
            },
        });

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);

        if (functionCalls.length === 0) {
            // No more tool calls — this is the final natural-language answer.
            const answer = parts.map((p) => p.text || "").join("").trim();
            return { answer: answer || "I couldn't find an answer to that.", toolCallLog };
        }

        // Model's turn (including the function call requests) goes into history...
        contents.push({ role: "model", parts });

        // ...then execute every requested call and feed results back as a
        // single function-response turn, matching Gemini's required
        // call-immediately-followed-by-response sequencing.
        const responseParts = [];
        for (const call of functionCalls) {
            const result = await executeTool(call.name, call.args || {});
            toolCallLog.push({ tool: call.name, args: call.args, resultSummary: summarizeForLog(result) });
            responseParts.push({
                functionResponse: {
                    name: call.name,
                    response: trimToolResult(result),
                },
            });
        }
        contents.push({ role: "user", parts: responseParts });
    }

    return {
        answer: "I wasn't able to finish answering that within the allowed number of steps — try breaking the question into smaller parts.",
        toolCallLog,
    };
}

// Keeps the audit log readable — full result payloads can be large.
function summarizeForLog(result) {
    if (result && Array.isArray(result.results)) {
        return { count: result.results.length, truncated: !!result.truncated };
    }
    if (result && typeof result.count === "number") return { count: result.count };
    if (result && result.error) return { error: result.error };
    return {};
}

module.exports = { runAdminChat };
