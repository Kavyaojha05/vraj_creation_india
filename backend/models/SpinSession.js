const mongoose = require("mongoose");

// =====================================================
// SPIN SESSION SCHEMA
// =====================================================

const spinSessionSchema = new mongoose.Schema(
  {
    // -------------------------------------------------
    // CUSTOMER DETAILS
    // -------------------------------------------------
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // -------------------------------------------------
    // UNIQUE SESSION
    // -------------------------------------------------
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // -------------------------------------------------
    // SELECTED COUPON
    // -------------------------------------------------
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    // -------------------------------------------------
    // SPIN REWARD
    // -------------------------------------------------
    reward: {
      type: Number,
      enum: [3, 5, 7, 10],
      default: null,
    },

    // -------------------------------------------------
    // DISCOUNT SCOPE
    // -------------------------------------------------
    discountScope: {
      type: String,
      enum: ["all", "category"],
      default: null,
    },

    // -------------------------------------------------
    // DISCOUNT CATEGORY
    // -------------------------------------------------
    category: {
      type: String,
      trim: true,
      default: null,
    },

    // -------------------------------------------------
    // SESSION STATUS
    // -------------------------------------------------
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },

    // -------------------------------------------------
    // SPIN STATUS
    // -------------------------------------------------
    hasSpun: {
      type: Boolean,
      default: false,
    },

    // -------------------------------------------------
    // SESSION EXPIRY
    // -------------------------------------------------
    expiresAt: {
      type: Date,
      required: true,
    },

    // -------------------------------------------------
    // SPIN TIME
    // -------------------------------------------------
    spunAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// TTL INDEX
// =====================================================
//
// MongoDB automatically deletes the session when
// expiresAt is reached.
//
// IMPORTANT:
// This index is intentionally defined only here.
// Do NOT add index: true to expiresAt above.
//

spinSessionSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

// =====================================================
// ONE MOBILE = ONE SPIN SESSION
// =====================================================
//
// One mobile number can have only one SpinSession.
//
// IMPORTANT:
// This unique index is intentionally defined only here.
// Do NOT add index: true to mobile above.
//

spinSessionSchema.index(
  { mobile: 1 },
  {
    unique: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "SpinSession",
  spinSessionSchema
);