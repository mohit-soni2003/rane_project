const mongoose = require("mongoose");
const {
    GuardRejection,
    assertAllowedCollection,
    assertReasonablePipeline,
    redactSensitiveFields,
    capResultSize,
    QUERY_TIMEOUT_MS,
} = require("./dbReadOnlyGuard");

// ─────────────────────────────────────────────────────────────────────────────
// DB TOOLS SERVICE
// The only place in this whole feature that actually talks to MongoDB.
// Every function here is READ-ONLY by construction — there is no
// updateOne/deleteOne/insertOne exposed anywhere in this file, so even a
// bug in the guard layer couldn't cause a write through this path.
//
// IMPORTANT — for true defense in depth, point `mongoose` here at a
// connection authenticated as a Mongo user with ONLY the `read` role on
// this database (not readWrite). That way even a bug in this code, or a
// future edit that accidentally adds a write call, is blocked at the
// database layer too. See the setup note at the bottom of this file.
// ─────────────────────────────────────────────────────────────────────────────

function getModel(name) {
    assertAllowedCollection(name);
    return mongoose.model(name);
}

// ── find ─────────────────────────────────────────────────────────────────
async function runFind(collection, { filter = {}, projection = {}, sort = {}, limit = 50 } = {}) {
    const Model = getModel(collection);
    const cappedLimit = Math.min(Number(limit) || 50, 200);

    const docs = await Model.find(filter, projection)
        .sort(sort)
        .limit(cappedLimit)
        .maxTimeMS(QUERY_TIMEOUT_MS)
        .lean();

    return capResultSize(redactSensitiveFields(docs));
}

// ── aggregate ────────────────────────────────────────────────────────────
async function runAggregate(collection, pipeline = []) {
    assertReasonablePipeline(pipeline);
    const Model = getModel(collection);

    const results = await Model.aggregate(pipeline)
        .option({ maxTimeMS: QUERY_TIMEOUT_MS })
        .exec();

    return capResultSize(redactSensitiveFields(results));
}

// ── count ────────────────────────────────────────────────────────────────
async function runCount(collection, filter = {}) {
    const Model = getModel(collection);
    const count = await Model.countDocuments(filter).maxTimeMS(QUERY_TIMEOUT_MS);
    return { count };
}

// ── distinct ─────────────────────────────────────────────────────────────
async function runDistinct(collection, field, filter = {}) {
    const Model = getModel(collection);
    if (typeof field !== "string" || !field) {
        throw new GuardRejection("distinct requires a field name.");
    }
    const values = await Model.distinct(field, filter).maxTimeMS(QUERY_TIMEOUT_MS);
    return { field, values: values.slice(0, 200) };
}

module.exports = { runFind, runAggregate, runCount, runDistinct };

/*
 ─────────────────────────────────────────────────────────────────────────
 SETUP NOTE — read-only DB user (do this once, outside the app):

 In mongosh, connected as an admin:

   use admin
   db.createUser({
     user: "chatbot_readonly",
     pwd: "<a strong generated password>",
     roles: [{ role: "read", db: "<your_database_name>" }]
   })

 Then give this file's Mongoose connection a SEPARATE connection string
 using that user instead of your app's normal read-write credentials:

   const chatbotConnection = mongoose.createConnection(
     "mongodb+srv://chatbot_readonly:<password>@<cluster>/<db>"
   );

 And register your models on THAT connection specifically for this
 feature (or use `chatbotConnection.model(name, schema)` mirroring your
 existing schemas) rather than the default `mongoose` connection your
 main app writes through. This means even a bug in this file, or a
 future edit that accidentally calls .updateOne(), gets rejected by
 MongoDB itself with an authorization error — the database enforces the
 boundary, not just this code.
 ─────────────────────────────────────────────────────────────────────────
*/
