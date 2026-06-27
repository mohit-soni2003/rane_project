const projectRepo = require("../repositories/project.repo");

/* ============================================================
 *  PROJECT SERVICE
 *  Admin authentication / role-checking is handled by route
 *  middleware. The service applies any business rules and
 *  delegates database work to the repository.
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

// Get every project, newest first, with all reference fields populated.
async function getAllProjects() {
    return projectRepo.getAllProjects();
}

// Get the projects waiting on a given authority to act (their pending queue).
// authorityId: usually the authenticated user's id (req.userId).
async function getPendingForAuthority(authorityId) {
    if (!authorityId) {
        throw new Error("Authority id is required");
    }
    return projectRepo.getPendingForAuthority(authorityId);
}

module.exports = {
    createProject,
    getAllProjects,
    getPendingForAuthority
};