const mongoose = require("mongoose");

const spinRewardSchema = new mongoose.Schema(
  {
    wheelValue: {
      type: Number,
      required: true,
      enum: [3, 5, 7, 10],
    },

    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      default: "Spin & Win Reward",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxUses: {
      type: Number,
      default: 0,
      min: 0,
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
  },
  {
    _id: true,
  }
);

const spinCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Vraj Creation Spin & Win",
      trim: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    durationDays: {
      type: Number,
      default: 10,
      min: 1,
    },

    rewards: {
      type: [spinRewardSchema],
      default: [],
    },

    oneSpinPerMobile: {
      type: Boolean,
      default: true,
    },

    sessionMinutes: {
      type: Number,
      default: 5,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// CHECK IF CAMPAIGN IS ACTIVE
// =====================================================
spinCampaignSchema.virtual("isActive").get(function () {
  const now = new Date();

  return (
    this.enabled === true &&
    now >= new Date(this.startDate) &&
    now < new Date(this.expiryDate)
  );
});

// =====================================================
// AUTOMATIC EXPIRY CHECK
// =====================================================
spinCampaignSchema.methods.checkExpiry = async function () {
  const now = new Date();

  // Campaign expired
  if (
    this.enabled === true &&
    this.expiryDate &&
    now >= new Date(this.expiryDate)
  ) {
    this.enabled = false;

    await this.save();

    return false;
  }

  // Campaign has not started yet
  if (
    this.enabled === true &&
    now < new Date(this.startDate)
  ) {
    return false;
  }

  // Campaign active
  return (
    this.enabled === true &&
    now >= new Date(this.startDate) &&
    now < new Date(this.expiryDate)
  );
};

// =====================================================
// MODEL
// =====================================================
const SpinCampaign = mongoose.model(
  "SpinCampaign",
  spinCampaignSchema
);

module.exports = SpinCampaign;