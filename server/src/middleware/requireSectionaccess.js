const User = require("../models/usermodel");
const { getEffectivePermissions } = require("../utils/permission.utils");

// ─────────────────────────────────────────────────────────────────────────────
// requireSectionAccess(section, action)
// Drop this in alongside verifyToken on any project route that reads or
// writes ONE section. `section` must be one of ProjectPermission.SECTIONS.
// `action` is "view" or "edit".
//
// Usage:
//   router.patch(
//     "/v1/basic-details/:projectId",
//     verifyToken,
//     requireSectionAccess("basic", "edit"),
//     handler
//   );
//
// Expects verifyToken to have already set req.userId, and the route to
// have :projectId in its params (rename the lookup below if a given
// route uses a different param name, e.g. :id).
// ─────────────────────────────────────────────────────────────────────────────
const requireSectionAccess = (section, action) => {
    return async (req, res, next) => {
        try {
            const projectId = req.params.projectId || req.params.id;
            const userId = req.userId;

            const user = await User.findById(userId).select("tag");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. User not found."
                });
            }

            // admin always has full access — this is a safety valve, not a
            // tag-based default: it exists purely so whoever manages
            // permissions can't lock themselves out. Every other tag gets
            // ONLY what's explicitly granted to that exact user on this
            // exact project.
            if (user.tag === "admin") {
                return next();
            }

            const permissions = await getEffectivePermissions(projectId, userId);

            if (!permissions?.[section]?.[action]) {
                return res.status(403).json({
                    success: false,
                    message: `You don't have ${action} access to the "${section}" section of this project.`
                });
            }

            // Stashed for handlers that want to avoid a second DB round
            // trip (e.g. the single-project GET route uses this to
            // filter its response — see permissions.util.js).
            req.projectPermissions = permissions;
            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
};

module.exports = requireSectionAccess;