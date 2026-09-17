const express = require("express");

const {
  adminLogin,
  verifyAdmin,
  adminLogout,
} = require("../controllers/adminAuthController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// =====================================================
// ADMIN LOGIN
// POST /api/admin/login
// =====================================================

router.post("/login", adminLogin);

// =====================================================
// VERIFY ADMIN
// GET /api/admin/verify
// =====================================================

router.get("/verify", adminAuth, verifyAdmin);

// =====================================================
// ADMIN LOGOUT
// POST /api/admin/logout
// =====================================================

router.post("/logout", adminAuth, adminLogout);

module.exports = router;