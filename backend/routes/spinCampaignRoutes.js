const express = require("express");

const {
  getSpinCampaign,
  activateSpinCampaign,
  deactivateSpinCampaign,
  updateSpinCampaign,
} = require("../controllers/spinCampaignController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// =====================================================
// GET CURRENT CAMPAIGN
// PUBLIC
// GET /api/campaign/spin
// =====================================================
//
// Customer website को active campaign पढ़ने की जरूरत है।
// इसलिए इस route पर admin login जरूरी नहीं है.
//

router.get("/", getSpinCampaign);

// =====================================================
// ACTIVATE / CREATE CAMPAIGN
// ADMIN ONLY
// POST /api/campaign/spin/activate
// =====================================================

router.post(
  "/activate",
  adminAuth,
  activateSpinCampaign
);

// =====================================================
// DEACTIVATE CAMPAIGN
// ADMIN ONLY
// POST /api/campaign/spin/deactivate
// =====================================================

router.post(
  "/deactivate",
  adminAuth,
  deactivateSpinCampaign
);

// =====================================================
// UPDATE CAMPAIGN
// ADMIN ONLY
// PUT /api/campaign/spin/update
// =====================================================

router.put(
  "/update",
  adminAuth,
  updateSpinCampaign
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;