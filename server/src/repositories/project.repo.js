const Project = require("./../models/projects.model");
const User = require("./../models/usermodel");
const Task = require("./../models/task.model");

/* ============================================================
 *  PROJECT REPOSITORY
 *  All database queries for the Project model live here.
 *  Controllers/services should call these, not Mongoose directly.
 * ============================================================ */

/* ---------------------------------------------------------- */
/*  CREATE                                                     */
/* ---------------------------------------------------------- */

// Create a new project (Admin fills the initial work-allocation details).
async function createProject(data) {
    const project = new Project(data);
    return project.save();
}

/* ---------------------------------------------------------- */
/*  READ                                                       */
/* ---------------------------------------------------------- */

// Get by Mongo _id.
async function getById(id) {
    return Project.findById(id);
}

// Get by the human-readable projectId string.
async function getByProjectId(projectId) {
    return Project.findOne({ projectId });
}

// Get every project, newest first, with all reference fields populated.
async function getAllProjects() {
    return Project.find()
        .sort({ createdAt: -1 })
        // top-level user references
        .populate("createdBy")
        .populate("currentAuthority")
        .populate("projectManager")
        // approval trail -> who acted
        .populate("approvals.actor")
        // teams -> lead, members, creator
        .populate("teams.lead")
        .populate("teams.members")
        .populate("teams.createdBy")
        // documents -> uploader
        .populate("documents.uploadedBy")
        // linked tasks (and the users on each task)
        .populate({
            path: "tasks",
            populate: [
                { path: "allottedTo" },
                { path: "allottedBy" },
                { path: "completion.submittedBy" },
                { path: "verifiedBy" }
            ]
        })
        .lean();
}

// Get a project with its references populated (people, teams, tasks).
async function getByIdPopulated(id) {
    return Project.findById(id)
        .populate("createdBy", "name email role")
        .populate("currentAuthority", "name email role")
        .populate("projectManager", "name email role")
        .populate("teams.lead", "name email")
        .populate("teams.members", "name email")
        .populate("approvals.actor", "name email role")
        .populate("tasks");
}

// Get every task linked to a project (and the project itself).
async function getWithTasks(id) {
    return Project.findById(id).populate({
        path: "tasks",
        populate: { path: "allottedTo allottedBy", select: "name email" }
    });
}

// List projects with optional filters (returns all matches).
// filters: { status, approvalStage, department, projectType, createdBy }
async function list(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.approvalStage) query.approvalStage = filters.approvalStage;
    if (filters.department) query.department = filters.department;
    if (filters.projectType) query.projectType = filters.projectType;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.currentAuthority) query.currentAuthority = filters.currentAuthority;

    return Project.find(query)
        .sort({ createdAt: -1 })
        .populate("currentAuthority", "name email role")
        .populate("createdBy", "name email");
}

// Text search across projectName / projectId / clientName / tenderNo.
async function search(term) {
    const regex = new RegExp(term, "i");
    return Project.find({
        $or: [
            { projectName: regex },
            { projectId: regex },
            { clientName: regex },
            { tenderNo: regex }
        ]
    }).sort({ createdAt: -1 });
}

// Projects waiting on a specific authority to act (their pending queue).
async function getPendingForAuthority(userId) {
    return Project.find({
        currentAuthority: userId,
        // status: { $in: ["pending", "returned"] }
    })
        .sort({ updatedAt: -1 })
        // top-level user references
        .populate("createdBy")
        .populate("currentAuthority")
        .populate("projectManager")
        // approval trail -> who acted
        .populate("approvals.actor")
        // teams -> lead, members, creator
        .populate("teams.lead")
        .populate("teams.members")
        .populate("teams.createdBy")
        // documents -> uploader
        .populate("documents.uploadedBy")
        // linked tasks (and the users on each task)
        .populate({
            path: "tasks",
            populate: [
                { path: "allottedTo" },
                { path: "allottedBy" },
                { path: "completion.submittedBy" },
                { path: "verifiedBy" }
            ]
        })
        .lean();
}

// Projects sitting at a given stage.
async function getByStage(stage) {
    return Project.find({ approvalStage: stage }).sort({ updatedAt: -1 });
}

// Projects created by a given user.
async function getByCreator(userId) {
    return Project.find({ createdBy: userId }).sort({ createdAt: -1 });
}

/* ---------------------------------------------------------- */
/*  UPDATE — general                                           */
/* ---------------------------------------------------------- */

async function updateById(id, update) {
    return Project.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true
    });
}

/* ---------------------------------------------------------- */
/*  APPROVAL WORKFLOW                                          */
/* ---------------------------------------------------------- */

// Stage order for moving the allocation up the chain.
const STAGE_ORDER = ["ADMIN", "COO", "CFO", "CEO", "DIRECTOR", "COMPLETED"];

function nextStage(current) {
    const i = STAGE_ORDER.indexOf(current);
    if (i === -1 || i === STAGE_ORDER.length - 1) return current;
    return STAGE_ORDER[i + 1];
}

// Approve current stage: record the sign-off, advance to the next stage.
// payload: { actor, remark, signatureUrl, signatureHash, nextAuthority }
async function approveStage(id, payload) {
    const project = await Project.findById(id);
    if (!project) return null;

    const stage = project.approvalStage;
    project.approvals.push({
        stage,
        actor: payload.actor,
        action: "approved",
        remark: payload.remark,
        signatureUrl: payload.signatureUrl,
        signatureHash: payload.signatureHash,
        signedAt: payload.signatureUrl ? new Date() : undefined,
        actedAt: new Date()
    });

    const upcoming = nextStage(stage);
    project.approvalStage = upcoming;

    if (upcoming === "COMPLETED") {
        project.status = "completed";
        project.currentAuthority = undefined;
        project.completionDate = new Date();
    } else {
        project.status = "pending";
        project.currentAuthority = payload.nextAuthority || undefined;
    }

    if (payload.remark) project.latestRemark = payload.remark;
    return project.save();
}

// Return the allocation to a previous stage for corrections.
// payload: { actor, remark, returnToStage, returnToAuthority }
async function returnProject(id, payload) {
    const project = await Project.findById(id);
    if (!project) return null;

    project.approvals.push({
        stage: project.approvalStage,
        actor: payload.actor,
        action: "returned",
        remark: payload.remark,
        actedAt: new Date()
    });

    project.approvalStage = payload.returnToStage || "ADMIN";
    project.currentAuthority = payload.returnToAuthority || undefined;
    project.status = "returned";
    if (payload.remark) project.latestRemark = payload.remark;

    return project.save();
}

// Reject the allocation outright.
// payload: { actor, remark }
async function rejectProject(id, payload) {
    const project = await Project.findById(id);
    if (!project) return null;

    project.approvals.push({
        stage: project.approvalStage,
        actor: payload.actor,
        action: "rejected",
        remark: payload.remark,
        actedAt: new Date()
    });

    project.status = "rejected";
    if (payload.remark) project.latestRemark = payload.remark;

    return project.save();
}

/* ---------------------------------------------------------- */
/*  TEAMS                                                      */
/* ---------------------------------------------------------- */

// Add a team under a vertical (COO / CFO / CEO).
async function addTeam(id, team) {
    return Project.findByIdAndUpdate(
        id,
        { $push: { teams: team } },
        { new: true, runValidators: true }
    );
}

// Remove a team by its sub-document _id.
async function removeTeam(id, teamId) {
    return Project.findByIdAndUpdate(
        id,
        { $pull: { teams: { _id: teamId } } },
        { new: true }
    );
}

// Get all teams for a given vertical on a project.
async function getTeamsByVertical(id, vertical) {
    const project = await Project.findById(id).select("teams");
    if (!project) return [];
    return project.teams.filter((t) => t.vertical === vertical);
}

// /* ---------------------------------------------------------- */
// /*  TASKS (link / unlink — keeps the project.tasks array sync) */
// /* ---------------------------------------------------------- */

async function linkTask(id, taskId) {
    return Project.findByIdAndUpdate(
        id,
        { $addToSet: { tasks: taskId } },
        { new: true }
    );
}

async function unlinkTask(id, taskId) {
    return Project.findByIdAndUpdate(
        id,
        { $pull: { tasks: taskId } },
        { new: true }
    );
}

/* ---------------------------------------------------------- */
/*  DOCUMENTS                                                  */
/* ---------------------------------------------------------- */

async function addDocument(id, doc) {
    return Project.findByIdAndUpdate(
        id,
        { $push: { documents: doc } },
        { new: true, runValidators: true }
    );
}

async function removeDocument(id, documentId) {
    return Project.findByIdAndUpdate(
        id,
        { $pull: { documents: { _id: documentId } } },
        { new: true }
    );
}

/* ---------------------------------------------------------- */
/*  FINANCIAL                                                  */
/* ---------------------------------------------------------- */

// Record a payment: increment paidAmount, recompute pendingAmount.
async function recordPayment(id, amount) {
    const project = await Project.findById(id);
    if (!project) return null;
    project.paidAmount = (project.paidAmount || 0) + amount;
    project.pendingAmount = Math.max(
        (project.projectCost || 0) - project.paidAmount,
        0
    );
    return project.save();
}

/* ---------------------------------------------------------- */
/*  DELETE                                                     */
/* ---------------------------------------------------------- */

async function deleteById(id) {
    return Project.findByIdAndDelete(id);
}

/* ---------------------------------------------------------- */
/*  COUNTS / DASHBOARD                                         */
/* ---------------------------------------------------------- */

// Count projects grouped by status (for dashboard cards).
async function countByStatus() {
    return Project.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
}

// Count projects grouped by current approval stage.
async function countByStage() {
    return Project.aggregate([
        { $group: { _id: "$approvalStage", count: { $sum: 1 } } }
    ]);
}

module.exports = {
    createProject,
    getById,
    getByProjectId,
    getAllProjects,
    getByIdPopulated,
    getWithTasks,
    list,
    search,
    getPendingForAuthority,
    getByStage,
    getByCreator,
    updateById,
    approveStage,
    returnProject,
    rejectProject,
    addTeam,
    removeTeam,
    getTeamsByVertical,
    linkTask,
    unlinkTask,
    addDocument,
    removeDocument,
    recordPayment,
    deleteById,
    countByStatus,
    countByStage
};