const User = require("../models/usermodel");

// ─── factory function: pass allowed roles as arguments ───────────────────────
// usage:  verifyRole("admin")
//         verifyRole("admin", "staff")
//         verifyRole("admin", "staff", "client", "user")

const verifyRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // req.userId is set by your existing verifyToken middleware
      const user = await User.findById(req.userId).select("role");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. User not found.",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`,
        });
      }

      // attach user role to req for use in routes if needed
      req.userRole = user.role;
      next();

    } catch (error) {
      console.log("Error in verifyRole:", error);
      return res.status(500).json({
        success: false,
        message: "Server error.",
      });
    }
  };
};

module.exports = verifyRole;