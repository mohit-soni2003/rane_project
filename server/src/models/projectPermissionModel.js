const mongoose = require("mongoose");

// Canonical list of gate-able sections — used by the model, the
// middleware, the default-permissions config, and the frontend, so
// there is exactly one place that defines "what a section is".
const SECTIONS = [
    "basic",
    "location",
    "advance",
    "bidding",
    "advance_financial",
    "penalty",
    "security_deposit",
    "material",
    "bill",
    "document",
    "task",
    "approvals"
];

const sectionAccessSchema = new mongoose.Schema(
    {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false }
    },
    { _id: false }
);

// Builds { basic: {view,edit}, location: {view,edit}, ... } for all
// SECTIONS, so the schema definition and any "give me an empty matrix"
// helper always stay in sync with the SECTIONS list above.
const buildPermissionsShape = () => {
    const shape = {};
    SECTIONS.forEach((section) => {
        shape[section] = sectionAccessSchema;
    });
    return shape;
};

// ─────────────────────────────────────────────────────────────────────────────
// ProjectPermission — one document per (project, user) pair. This is the
// ONLY source of a user's access on a project — there are no tag-based
// defaults. A user with no document here has no access to any section
// until an admin explicitly grants it (see routes/project.permissions.routes.js).
// ─────────────────────────────────────────────────────────────────────────────
const projectPermissionSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // Denormalized at assignment time, purely for display in the
        // permissions-management UI. The User document's own `tag` field
        // is always the source of truth for defaults/fallback.
        tag: {
            type: String
        },
        permissions: buildPermissionsShape(),
        grantedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

// One permission document per user per project — upserts should target
// this pair.
projectPermissionSchema.index({ project: 1, user: 1 }, { unique: true });

const ProjectPermission = mongoose.model("ProjectPermission", projectPermissionSchema);

// Attaching these as static properties keeps everything permission-shape
// related importable from one place: `require(".../projectPermission.model")`
// gives you the model AND its section list / empty-matrix builder.
ProjectPermission.SECTIONS = SECTIONS;
ProjectPermission.buildEmptyPermissions = () => {
    const empty = {};
    SECTIONS.forEach((section) => {
        empty[section] = { view: false, edit: false };
    });
    return empty;
};

module.exports = ProjectPermission;