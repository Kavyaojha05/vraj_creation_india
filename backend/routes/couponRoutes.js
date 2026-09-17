const express = require("express");

const {
  createCoupon,
  getCoupons,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  startSpinSession,
  spinCoupon,
  validateCoupon,
  useCoupon,
} = require("../controllers/couponController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// =====================================================
// ADMIN — COUPON CRUD
// =====================================================

// Create coupon
router.post(
  "/",
  adminAuth,
  createCoupon
);

// Get all coupons
router.get(
  "/",
  adminAuth,
  getCoupons
);

// Get coupon by code
router.get(
  "/code/:code",
  adminAuth,
  getCouponByCode
);

// Get coupon by ID
router.get(
  "/:id",
  adminAuth,
  getCouponById
);

// Update coupon
router.put(
  "/:id",
  adminAuth,
  updateCoupon
);

// Delete coupon
router.delete(
  "/:id",
  adminAuth,
  deleteCoupon
);

// =====================================================
// CUSTOMER — SPIN & WIN
// =====================================================

// Start 5-minute spin session
router.post(
  "/spin/start",
  startSpinSession
);

// Perform spin
router.post(
  "/spin",
  spinCoupon
);

// =====================================================
// COUPON VALIDATION
// =====================================================

router.post(
  "/validate",
  validateCoupon
);

// =====================================================
// COUPON REDEMPTION
// =====================================================

router.post(
  "/use",
  useCoupon
);

module.exports = router;