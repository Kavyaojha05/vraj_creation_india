const jwt = require("jsonwebtoken");

// =====================================================
// ADMIN JWT CONFIG
// =====================================================

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET;

const JWT_ISSUER =
  "vraj-creation-admin";

const JWT_AUDIENCE =
  "vraj-creation-dashboard";

// =====================================================
// CONFIG VALIDATION
// =====================================================

const validateJwtConfig = () => {
  if (!ADMIN_JWT_SECRET) {
    throw new Error(
      "ADMIN_JWT_SECRET is missing from environment variables."
    );
  }
};

// =====================================================
// ADMIN AUTH MIDDLEWARE
// =====================================================

const adminAuth = (req, res, next) => {
  try {
    // -------------------------------------------------
    // CHECK JWT SECRET
    // -------------------------------------------------

    validateJwtConfig();

    // -------------------------------------------------
    // GET AUTHORIZATION HEADER
    // -------------------------------------------------

    const authHeader =
      req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication required.",
      });
    }

    // -------------------------------------------------
    // EXTRACT TOKEN
    // -------------------------------------------------

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Admin token missing.",
      });
    }

    // -------------------------------------------------
    // VERIFY JWT
    // -------------------------------------------------

    const decoded = jwt.verify(
      token,
      ADMIN_JWT_SECRET,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    );

    // -------------------------------------------------
    // BASIC PAYLOAD VALIDATION
    // -------------------------------------------------

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin token.",
      });
    }

    // -------------------------------------------------
    // ROLE CHECK
    // -------------------------------------------------

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access denied.",
      });
    }

    // -------------------------------------------------
    // USERNAME CHECK
    // -------------------------------------------------

    if (
      typeof decoded.username !== "string" ||
      !decoded.username.trim()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid admin identity.",
      });
    }

    // -------------------------------------------------
    // ATTACH ADMIN TO REQUEST
    // -------------------------------------------------

    req.admin = {
      username: decoded.username,
      role: decoded.role,
    };

    // -------------------------------------------------
    // CONTINUE
    // -------------------------------------------------

    next();
  } catch (error) {
    console.error(
      "Admin Auth Error:",
      error.message
    );

    // -------------------------------------------------
    // EXPIRED TOKEN
    // -------------------------------------------------

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Admin session expired. Please login again.",
      });
    }

    // -------------------------------------------------
    // JWT CONFIG ERROR
    // -------------------------------------------------

    if (
      error.message.includes(
        "ADMIN_JWT_SECRET"
      )
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Admin authentication is not configured correctly.",
      });
    }

    // -------------------------------------------------
    // INVALID JWT
    // -------------------------------------------------

    return res.status(401).json({
      success: false,
      message:
        "Invalid admin token.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = adminAuth;