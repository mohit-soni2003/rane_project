const { GoogleGenAI } = require("@google/genai");
const { GEMINI_TOOLS } = require("./geminiToolDefinitions");
const { buildSchemaReference } = require("./schemaIntrospector");
const dbTools = require("./dbTools.service");
const { GuardRejection } = require("./dbReadOnlyGuard");

// Reads GEMINI_API_KEY from the environment — set this in your .env,
// never hardcode it.
const genai = new GoogleGenAI({ apiKey: "" });

// Current GA Flash model as of writing this — check ai.google.dev for
// whatever's current if this feels out of date by the time you read it,
// Google's lineup moves fast.
const MODEL_NAME = "gemini-3.6-flash";

const MAX_TOOL_ROUNDS = 6; // hard stop so a confused loop can't run forever

function buildSystemInstruction() {
    const schemaText = buildSchemaReference();
    return `You are a read-only database assistant for the admin of an infrastructure/project-management system.

Your job: answer the admin's question about what's in the database, using the query tools available to you. You NEVER modify data — you don't have any write tools, and you should never ask the admin to run a write on your behalf either.

Rules:
- Always use a tool to look up real data before answering a factual question. Never guess or make up numbers, names, or statuses.
- If a question requires joining data across collections (e.g. a client's bills, a project's tasks), use aggregateCollection with $lookup rather than making several separate queryCollection calls when a join is cleaner.
- If a query returns zero results, say so plainly rather than assuming the data doesn't exist for another reason.
- If a result set was truncated (you'll see "truncated": true in the tool result), mention that to the admin rather than presenting it as the complete picture.
- Keep answers concise and factual. Use tables or lists for multi-row results.
- If a question is ambiguous (e.g. "recent" bills — recent by what measure, how many), make a reasonable assumption, state it, and answer.

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
        const response = await genai.models.generateContent({
            model: MODEL_NAME,
            contents,
            config: {
                systemInstruction: buildSystemInstruction(),
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
                    response: result,
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
