const mongoose = require("mongoose");

const couponClaimSchema = new mongoose.Schema(
  {
    // Customer name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Customer mobile
    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // Coupon received by customer
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    // Coupon code snapshot
    couponCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // Discount received
    discount: {
      type: Number,
      required: true,
      enum: [3, 5, 7, 10],
    },

    // Discount applies where?
    discountScope: {
      type: String,
      enum: ["all", "category"],
      required: true,
    },

    // Category if category based
    category: {
      type: String,
      trim: true,
      default: null,
    },

    // Claim status
    status: {
      type: String,
      enum: ["claimed", "used", "cancelled"],
      default: "claimed",
    },

    // When customer received the coupon
    claimedAt: {
      type: Date,
      default: Date.now,
    },

    // When coupon was actually used
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ONE MOBILE = ONE SPIN / ONE CLAIM
// =====================================================

couponClaimSchema.index(
  { mobile: 1 },
  {
    unique: true,
  }
);

// =====================================================
// COUPON CODE INDEX
// =====================================================

couponClaimSchema.index({
  couponCode: 1,
});

module.exports = mongoose.model(
  "CouponClaim",
  couponClaimSchema
);