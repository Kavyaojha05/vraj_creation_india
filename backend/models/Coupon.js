const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "Vraj Creation Special Discount",
      trim: true,
    },

    discount: {
      type: Number,
      required: true,
      enum: [3, 5, 7, 10],
    },

    type: {
      type: String,
      enum: ["percentage"],
      default: "percentage",
    },

    discountScope: {
      type: String,
      enum: ["all", "category"],
      default: "all",
    },

    category: {
      type: String,
      trim: true,
      default: null,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      enum: ["Spin & Win", "Admin"],
      default: "Admin",
    },

    wheelValue: {
      type: Number,
      enum: [3, 5, 7, 10],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// CUSTOM VALIDATION
// =====================================================

couponSchema.pre("validate", function () {
  // -----------------------------------------------
  // DATE VALIDATION
  // -----------------------------------------------
  if (
    this.startDate &&
    this.expiryDate &&
    this.startDate >= this.expiryDate
  ) {
    throw new Error(
      "Expiry date must be greater than start date."
    );
  }

  // -----------------------------------------------
  // USED COUNT VALIDATION
  // -----------------------------------------------
  if (this.usedCount > this.maxUses) {
    throw new Error(
      "Used count cannot be greater than maximum uses."
    );
  }

  // -----------------------------------------------
  // CATEGORY VALIDATION
  // -----------------------------------------------
  if (
    this.discountScope === "category" &&
    (!this.category || this.category.trim() === "")
  ) {
    throw new Error(
      "Category is required when discount scope is category."
    );
  }

  // -----------------------------------------------
  // ALL PRODUCTS
  // -----------------------------------------------
  if (this.discountScope === "all") {
    this.category = null;
  }

  // -----------------------------------------------
  // SPIN & WIN VALIDATION
  // -----------------------------------------------
  if (
    this.source === "Spin & Win" &&
    !this.wheelValue
  ) {
    throw new Error(
      "Wheel value is required for Spin & Win coupon."
    );
  }
});

module.exports = mongoose.model("Coupon", couponSchema);