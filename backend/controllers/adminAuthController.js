const jwt = require("jsonwebtoken");

// =====================================================
// ADMIN CONFIG
// =====================================================

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

const ADMIN_TOKEN_EXPIRES =
  process.env.ADMIN_TOKEN_EXPIRES || "12h";

// =====================================================
// SECURITY CONFIG VALIDATION
// =====================================================

const validateAdminConfig = () => {
  const missing = [];

  if (!ADMIN_USERNAME) {
    missing.push("ADMIN_USERNAME");
  }

  if (!ADMIN_PASSWORD) {
    missing.push("ADMIN_PASSWORD");
  }

  if (!ADMIN_JWT_SECRET) {
    missing.push("ADMIN_JWT_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required admin environment variables: ${missing.join(
        ", "
      )}`
    );
  }
};

// =====================================================
// ADMIN LOGIN
// POST /api/admin/login
// =====================================================

const adminLogin = (req, res) => {
  try {
    validateAdminConfig();

    const { username, password } = req.body;

    // -------------------------------------------------
    // INPUT VALIDATION
    // -------------------------------------------------

    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // -------------------------------------------------
    // CREDENTIAL CHECK
    // -------------------------------------------------

    const isUsernameCorrect =
      cleanUsername === ADMIN_USERNAME;

    const isPasswordCorrect =
      password === ADMIN_PASSWORD;

    if (
      !isUsernameCorrect ||
      !isPasswordCorrect
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin username or password.",
      });
    }

    // -------------------------------------------------
    // CREATE JWT
    // -------------------------------------------------

    const token = jwt.sign(
      {
        username: ADMIN_USERNAME,
        role: "admin",
      },
      ADMIN_JWT_SECRET,
      {
        expiresIn: ADMIN_TOKEN_EXPIRES,
        issuer: "vraj-creation-admin",
        audience: "vraj-creation-dashboard",
      }
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,

      admin: {
        username: ADMIN_USERNAME,
        role: "admin",
      },

      expiresIn: ADMIN_TOKEN_EXPIRES,
    });
  } catch (error) {
    console.error(
      "Admin Login Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Admin authentication is not configured correctly.",
    });
  }
};

// =====================================================
// VERIFY ADMIN TOKEN
// GET /api/admin/verify
// =====================================================

const verifyAdmin = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      authenticated: true,

      admin: {
        username:
          req.admin?.username || "",
        role:
          req.admin?.role || "admin",
      },
    });
  } catch (error) {
    console.error(
      "Admin Verify Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify admin session.",
    });
  }
};

// =====================================================
// LOGOUT
// =====================================================

const adminLogout = (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Admin logout successful.",
  });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  adminLogin,
  verifyAdmin,
  adminLogout,
};