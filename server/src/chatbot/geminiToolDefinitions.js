// ─────────────────────────────────────────────────────────────────────────────
// GEMINI TOOL DECLARATIONS
// These are the ONLY capabilities the model has. Notice there is no
// updateX / deleteX / insertX declared anywhere — the model literally
// cannot call what doesn't exist here, which is the first of the three
// enforcement layers described in the architecture (declarations →
// dbReadOnlyGuard → read-only DB user).
// ─────────────────────────────────────────────────────────────────────────────

const queryCollectionTool = {
    name: "queryCollection",
    description:
        "Read documents from a MongoDB collection with a filter, optional field projection, sort, and limit. " +
        "Use this for straightforward lookups on a single collection. For questions that need joining data " +
        "across collections (e.g. \"projects created by X and their bills\"), use aggregateCollection instead.",
    parameters: {
        type: "object",
        properties: {
            collection: {
                type: "string",
                description: "Exact model name as listed in the schema reference, e.g. \"Project\", \"Task\", \"User\".",
            },
            filter: {
                type: "object",
                description: "MongoDB filter object, e.g. { \"status\": \"in_progress\" }. Use {} to match all documents.",
            },
            projection: {
                type: "object",
                description: "Optional: which fields to include, e.g. { \"projectName\": 1, \"status\": 1 }. Omit to return all non-sensitive fields.",
            },
            sort: {
                type: "object",
                description: "Optional sort, e.g. { \"createdAt\": -1 } for newest first.",
            },
            limit: {
                type: "number",
                description: "Max documents to return. Defaults to 50, hard-capped at 200.",
            },
        },
        required: ["collection"],
    },
};

const aggregateCollectionTool = {
    name: "aggregateCollection",
    description:
        "Run a MongoDB aggregation pipeline, starting from one collection. Use $lookup to join in data from " +
        "other collections (the target collection of any $lookup must also be a real, recognized collection). " +
        "Use $group for totals/counts/averages, $match for filtering, $sort/$limit for ordering and capping " +
        "results. Write stages ($merge, $out) and code-execution stages ($function, $where, $accumulator) are " +
        "not permitted and will be rejected.",
    parameters: {
        type: "object",
        properties: {
            collection: {
                type: "string",
                description: "The starting collection for the pipeline, e.g. \"ProjectBill\".",
            },
            pipeline: {
                type: "array",
                description: "An array of aggregation stage objects, e.g. [{ \"$match\": {...} }, { \"$group\": {...} }].",
                items: { type: "object" },
            },
        },
        required: ["collection", "pipeline"],
    },
};

const countCollectionTool = {
    name: "countCollection",
    description: "Count how many documents in a collection match a filter. Faster than queryCollection when you only need a number.",
    parameters: {
        type: "object",
        properties: {
            collection: { type: "string", description: "Exact model name, e.g. \"Task\"." },
            filter: { type: "object", description: "MongoDB filter object. Use {} to count all documents." },
        },
        required: ["collection"],
    },
};

const distinctCollectionTool = {
    name: "distinctCollection",
    description: "Get the distinct/unique values of one field across a collection, optionally filtered. Good for \"what are all the...\" questions.",
    parameters: {
        type: "object",
        properties: {
            collection: { type: "string", description: "Exact model name, e.g. \"User\"." },
            field: { type: "string", description: "The field to get distinct values of, e.g. \"tag\"." },
            filter: { type: "object", description: "Optional MongoDB filter to narrow the documents considered first." },
        },
        required: ["collection", "field"],
    },
};

// Passed as the `tools` array in the Gemini API call. See
// geminiChat.orchestrator.js for how these get wired to the actual
// dbTools.service.js functions when Gemini requests one.
const GEMINI_TOOLS = [
    {
        functionDeclarations: [
            queryCollectionTool,
            aggregateCollectionTool,
            countCollectionTool,
            distinctCollectionTool,
        ],
    },
];

module.exports = { GEMINI_TOOLS };
