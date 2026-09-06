const ProjectPermission = require("../models/projectPermissionModel");

// No tag-based defaults anymore — every user needs an explicit grant.
// A tag with no ProjectPermission document for this project gets zero
// access. Fail closed, not open.
const NO_ACCESS = ProjectPermission.buildEmptyPermissions();

// ─────────────────────────────────────────────────────────────────────────────
// Resolves what a specific user can actually do on a specific project.
// Purely user-specific: looks up the (project, user) ProjectPermission
// document and returns it. If none exists, the user has no access to
// any section — an admin must explicitly grant access per user.
// ─────────────────────────────────────────────────────────────────────────────
async function getEffectivePermissions(projectId, userId) {
    const grant = await ProjectPermission.findOne({ project: projectId, user: userId }).lean();
    return grant ? grant.permissions : NO_ACCESS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Strips sections the user has no view access to from a project document
// before it's sent to the client. Used by the "get whole project" route,
// since that route returns every section in one response and can't be
// gated at the route level the way the per-section PATCH routes can.
//
// `project` should be a plain object (call .toObject() / .lean() on the
// Mongoose doc first). Sections without view access are replaced with
// null rather than deleted, so the frontend can still tell "this section
// exists but you can't see it" apart from "this project genuinely has
// no data here" if that distinction ever matters.
// ─────────────────────────────────────────────────────────────────────────────
function filterProjectByPermissions(project, permissions) {
    const filtered = { ...project };

    if (!permissions.basic?.view) {
        filtered.description = null;
        filtered.projectUnder = null;
        filtered.tenderClosingDate = null;
    }
    if (!permissions.location?.view) {
        filtered.location = null;
        filtered.headquarterLocation = null;
    }
    if (!permissions.advance?.view) {
        filtered.projectType = null;
        filtered.tenderType = null;
        filtered.department = null;
        filtered.contractType = null;
        filtered.biddingType = null;
        filtered.expenditureType = null;
        filtered.rankingOrderForBid = null;
        filtered.biddingSystem = null;
        filtered.currentDateOfCompletion = null;
        filtered.zone = null;
        filtered.subDepartment = null;
        filtered.circle = null;
        filtered.division = null;
        filtered.psuName = null;
        filtered.clientName = null;
        filtered.tenderNo = null;
        filtered.loaNo = null;
        filtered.agreementNo = null;
        filtered.loaDate = null;
        filtered.tenderTotalAmount = null;
        filtered.loaAmount = null;
        filtered.contractorName = null;
        filtered.contractorCode = null;
        filtered.tca = null;
        filtered.taa = null;
        filtered.jointVentureMembers = null;
    }
    if (filtered.financials) {
        filtered.financials = { ...filtered.financials };
        if (!permissions.bidding?.view) filtered.financials.bidding = null;
        if (!permissions.advance_financial?.view) filtered.financials.pg = null;
        if (!permissions.penalty?.view) filtered.financials.penaltyDetails = null;
        if (!permissions.security_deposit?.view) filtered.financials.security_deposit = null;
    }
    if (!permissions.document?.view) {
        filtered.documents = null;
    }
    if (!permissions.approvals?.view) {
        filtered.approvals = null;
        filtered.currentAuthority = null;
        filtered.nextAuthority = null;
    }

    // material, bill, and task are served by their OWN endpoints
    // (GET /:projectId/items, GET /projects/bill/v1/:projectId/bill,
    // GET /task/project/:projectId) — those are gated directly with the
    // requireSectionAccess middleware below, not filtered here.

    return filtered;
}

module.exports = { getEffectivePermissions, filterProjectByPermissions };