const Task = require("./Task.model");

/* ============================================================
 *  TASK REPOSITORY
 *  All database queries for the Task model live here.
 * ============================================================ */

/* ---------------------------------------------------------- */
/*  CREATE                                                     */
/* ---------------------------------------------------------- */

// Create a task under a project, allotted to user(s) with a deadline.
async function createTask(data) {
    const task = new Task(data);
    return task.save();
}

/* ---------------------------------------------------------- */
/*  READ                                                       */
/* ---------------------------------------------------------- */

async function getById(id) {
    return Task.findById(id);
}

async function getByIdPopulated(id) {
    return Task.findById(id)
        .populate("project", "projectId projectName")
        .populate("allottedTo", "name email")
        .populate("allottedBy", "name email")
        .populate("completion.submittedBy", "name email")
        .populate("verifiedBy", "name email");
}

// List tasks with optional filters (returns all matches).
// filters: { project, status, priority, allottedTo, allottedBy, vertical }
async function list(filters = {}) {
    const query = {};
    if (filters.project) query.project = filters.project;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.allottedTo) query.allottedTo = filters.allottedTo;
    if (filters.allottedBy) query.allottedBy = filters.allottedBy;
    if (filters.vertical) query.vertical = filters.vertical;

    return Task.find(query)
        .sort({ deadline: 1 })
        .populate("allottedTo", "name email")
        .populate("allottedBy", "name email");
}

// All tasks for a project.
async function getByProject(projectId) {
    return Task.find({ project: projectId }).sort({ deadline: 1 });
}

// Tasks assigned to a user (their work queue).
async function getByAssignee(userId) {
    return Task.find({ allottedTo: userId })
        .sort({ deadline: 1 })
        .populate("project", "projectId projectName");
}

// Tasks a user has assigned to others.
async function getByAssigner(userId) {
    return Task.find({ allottedBy: userId }).sort({ createdAt: -1 });
}

// Overdue: deadline passed and not yet completed/rejected.
async function getOverdue() {
    return Task.find({
        deadline: { $lt: new Date() },
        status: { $nin: ["completed", "rejected"] }
    }).sort({ deadline: 1 });
}

// Overdue tasks for one user.
async function getOverdueForUser(userId) {
    return Task.find({
        allottedTo: userId,
        deadline: { $lt: new Date() },
        status: { $nin: ["completed", "rejected"] }
    }).sort({ deadline: 1 });
}

// Upcoming: due within the next `days` days and still open.
async function getUpcoming(days = 7) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    return Task.find({
        deadline: { $gte: new Date(), $lte: until },
        status: { $nin: ["completed", "rejected"] }
    }).sort({ deadline: 1 });
}

/* ---------------------------------------------------------- */
/*  UPDATE — general                                           */
/* ---------------------------------------------------------- */

async function updateById(id, update) {
    return Task.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true
    });
}

/* ---------------------------------------------------------- */
/*  STATUS TRANSITIONS                                         */
/* ---------------------------------------------------------- */

// Mark a task as started.
async function startTask(id) {
    return Task.findByIdAndUpdate(
        id,
        { status: "in_progress" },
        { new: true }
    );
}

// User submits completed work with images + details.
// payload: { submittedBy, remark, images: [{ name, url }] }
async function submitTask(id, payload) {
    const task = await Task.findById(id);
    if (!task) return null;

    task.completion.remark = payload.remark;
    task.completion.submittedBy = payload.submittedBy;
    task.completion.submittedAt = new Date();
    if (Array.isArray(payload.images)) {
        payload.images.forEach((img) => {
            task.completion.images.push({
                name: img.name,
                url: img.url,
                uploadedAt: new Date()
            });
        });
    }
    task.status = "submitted";
    if (payload.remark) task.latestRemark = payload.remark;

    return task.save();
}

// Append more completion images without changing status.
// images: [{ name, url }]
async function addCompletionImages(id, images = []) {
    const docs = images.map((img) => ({
        name: img.name,
        url: img.url,
        uploadedAt: new Date()
    }));
    return Task.findByIdAndUpdate(
        id,
        { $push: { "completion.images": { $each: docs } } },
        { new: true }
    );
}

// Verifier approves submitted work -> completed.
// payload: { verifiedBy, remark }
async function verifyTask(id, payload) {
    const update = {
        status: "completed",
        verifiedBy: payload.verifiedBy,
        verifiedAt: new Date(),
        completedAt: new Date()
    };
    if (payload.remark) update.latestRemark = payload.remark;
    return Task.findByIdAndUpdate(id, update, { new: true });
}

// Verifier rejects submitted work -> rejected.
// payload: { verifiedBy, remark }
async function rejectTask(id, payload) {
    const update = {
        status: "rejected",
        verifiedBy: payload.verifiedBy,
        verifiedAt: new Date()
    };
    if (payload.remark) update.latestRemark = payload.remark;
    return Task.findByIdAndUpdate(id, update, { new: true });
}

// Flag overdue tasks in bulk (run from a scheduled job).
// Returns the number of tasks updated.
async function markOverdue() {
    const result = await Task.updateMany(
        {
            deadline: { $lt: new Date() },
            status: { $in: ["pending", "in_progress"] }
        },
        { status: "overdue" }
    );
    return result.modifiedCount;
}

/* ---------------------------------------------------------- */
/*  ASSIGNMENT                                                 */
/* ---------------------------------------------------------- */

async function addAssignee(id, userId) {
    return Task.findByIdAndUpdate(
        id,
        { $addToSet: { allottedTo: userId } },
        { new: true }
    );
}

async function removeAssignee(id, userId) {
    return Task.findByIdAndUpdate(
        id,
        { $pull: { allottedTo: userId } },
        { new: true }
    );
}

// Replace the whole assignee list.
async function reassign(id, userIds = []) {
    return Task.findByIdAndUpdate(
        id,
        { allottedTo: userIds },
        { new: true, runValidators: true }
    );
}

/* ---------------------------------------------------------- */
/*  DELETE                                                     */
/* ---------------------------------------------------------- */

async function deleteById(id) {
    return Task.findByIdAndDelete(id);
}

// Delete every task under a project (e.g. when the project is removed).
async function deleteByProject(projectId) {
    const result = await Task.deleteMany({ project: projectId });
    return result.deletedCount;
}

/* ---------------------------------------------------------- */
/*  COUNTS / DASHBOARD                                         */
/* ---------------------------------------------------------- */

// Count tasks grouped by status (optionally for one project).
async function countByStatus(projectId) {
    const match = projectId ? [{ $match: { project: projectId } }] : [];
    return Task.aggregate([
        ...match,
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
}

module.exports = {
    createTask,
    getById,
    getByIdPopulated,
    list,
    getByProject,
    getByAssignee,
    getByAssigner,
    getOverdue,
    getOverdueForUser,
    getUpcoming,
    updateById,
    startTask,
    submitTask,
    addCompletionImages,
    verifyTask,
    rejectTask,
    markOverdue,
    addAssignee,
    removeAssignee,
    reassign,
    deleteById,
    deleteByProject,
    countByStatus
};