const projectRepo = require("../repositories/project.repo");

/* ============================================================
 *  PROJECT SERVICE
 *  Admin authentication / role-checking is handled by route
 *  middleware. This service just saves the project.
 * ============================================================ */

// Create a project. projectId comes from the body.
// Any model field present in `payload` is saved as-is.
// adminUserId: the ID of the authenticated admin (from req.userId) -> stored as createdBy.
async function createProject(adminUserId, payload = {}) {
    const data = { ...payload };

    // Stamp ownership from the authenticated admin.
    if (adminUserId) {
        data.createdBy = adminUserId;
    }

    return projectRepo.createProject(data);
}

module.exports = {
    createProject
};