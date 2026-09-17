const crypto = require("crypto");

const Coupon = require("../models/Coupon");
const SpinSession = require("../models/SpinSession");
const CouponClaim = require("../models/CouponClaim");
const SpinCampaign = require("../models/SpinCampaign");

// =====================================================
// SESSION SETTINGS
// =====================================================

const SESSION_MINUTES = Number(
  process.env.SPIN_SESSION_MINUTES || 5
);

// =====================================================
// WHEEL REWARDS
// =====================================================

const WHEEL_REWARDS = [3, 5, 7, 10];

// =====================================================
// HELPERS
// =====================================================

// Generate secure session ID
const generateSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Normalize mobile
const normalizeMobile = (mobile) => {
  return String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);
};

// Validate Indian mobile
const isValidMobile = (mobile) => {
  return /^[6-9]\d{9}$/.test(mobile);
};

// Normalize coupon code
const normalizeCouponCode = (code) => {
  return String(code || "")
    .trim()
    .toUpperCase();
};

// =====================================================
// GET COUPON WHEEL VALUE
// =====================================================

const getCouponWheelValue = (coupon) => {
  if (
    coupon.wheelValue !== undefined &&
    coupon.wheelValue !== null
  ) {
    return Number(coupon.wheelValue);
  }

  return Number(coupon.discount);
};

// =====================================================
// CHECK COUPON VALIDITY
// =====================================================

const isCouponCurrentlyValid = (coupon) => {
  const now = new Date();

  if (!coupon.active) {
    return false;
  }

  if (
    coupon.startDate &&
    now < coupon.startDate
  ) {
    return false;
  }

  if (
    coupon.expiryDate &&
    now >= coupon.expiryDate
  ) {
    return false;
  }

  if (
    coupon.maxUses !== null &&
    coupon.maxUses !== undefined &&
    coupon.usedCount >= coupon.maxUses
  ) {
    return false;
  }

  return true;
};

// =====================================================
// GET ACTIVE SPIN CAMPAIGN
// =====================================================

const getActiveSpinCampaign = async () => {
  const campaign = await SpinCampaign.findOne({
    enabled: true,
  }).sort({
    createdAt: -1,
  });

  if (!campaign) {
    return null;
  }

  const active = await campaign.checkExpiry();

  if (!active) {
    return null;
  }

  return campaign;
};

// =====================================================
// ADMIN — CREATE COUPON
// POST /api/coupons
// =====================================================

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      discount,
      wheelValue,
      discountScope,
      category,
      description,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      maxUses,
      active,
      source,
    } = req.body;

    if (
      !code ||
      discount === undefined ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Code, discount, start date and expiry date are required.",
      });
    }

    const couponCode =
      normalizeCouponCode(code);

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const existingCoupon =
      await Coupon.findOne({
        code: couponCode,
      });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    const discountNumber =
      Number(discount);

    if (
      !WHEEL_REWARDS.includes(
        discountNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount must be 3, 5, 7 or 10.",
      });
    }

    const wheelNumber =
      wheelValue === undefined ||
      wheelValue === null ||
      wheelValue === ""
        ? discountNumber
        : Number(wheelValue);

    if (
      !WHEEL_REWARDS.includes(
        wheelNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Wheel value must be 3, 5, 7 or 10.",
      });
    }

    const scope =
      discountScope === "category"
        ? "category"
        : "all";

    let selectedCategory = null;

    if (scope === "category") {
      selectedCategory = String(
        category || ""
      ).trim();

      if (!selectedCategory) {
        return res.status(400).json({
          success: false,
          message:
            "Category is required for category discount.",
        });
      }
    }

    const start = new Date(
      startDate
    );

    const expiry = new Date(
      expiryDate
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(expiry.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start or expiry date.",
      });
    }

    if (start >= expiry) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date/time must be after start date/time.",
      });
    }

    const totalUses =
      maxUses === undefined ||
      maxUses === null ||
      maxUses === ""
        ? 1
        : Number(maxUses);

    if (
      !Number.isInteger(totalUses) ||
      totalUses < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Max uses must be at least 1.",
      });
    }

    const minimumOrder =
      minOrderAmount === undefined ||
      minOrderAmount === null ||
      minOrderAmount === ""
        ? 0
        : Number(minOrderAmount);

    if (
      Number.isNaN(minimumOrder) ||
      minimumOrder < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum order amount cannot be negative.",
      });
    }

    let maximumDiscount = null;

    if (
      maxDiscount !== "" &&
      maxDiscount !== null &&
      maxDiscount !== undefined
    ) {
      maximumDiscount =
        Number(maxDiscount);

      if (
        Number.isNaN(
          maximumDiscount
        ) ||
        maximumDiscount < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum discount must be a valid number.",
        });
      }
    }

    const couponSource =
      source === "Admin"
        ? "Admin"
        : "Spin & Win";

    const coupon =
      await Coupon.create({
        code: couponCode,

        name:
          String(name || "").trim() ||
          "Vraj Creation Offer",

        discount:
          discountNumber,

        type: "percentage",

        wheelValue:
          wheelNumber,

        discountScope:
          scope,

        category:
          selectedCategory,

        source:
          couponSource,

        description:
          String(description || "").trim() ||
          `Vraj Creation ${discountNumber}% OFF`,

        minOrderAmount:
          minimumOrder,

        maxDiscount:
          maximumDiscount,

        startDate:
          start,

        expiryDate:
          expiry,

        maxUses:
          totalUses,

        usedCount: 0,

        active:
          active !== false,
      });

    return res.status(201).json({
      success: true,
      message:
        "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    console.error(
      "CREATE COUPON ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Coupon code already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — GET ALL COUPONS
// GET /api/coupons
// =====================================================

const getCoupons = async (req, res) => {
  try {
    const coupons =
      await Coupon.find()
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error(
      "GET COUPONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch coupons.",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — GET SINGLE COUPON
// GET /api/coupons/:id
// =====================================================

const getCouponById = async (
  req,
  res
) => {
  try {
    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found.",
      });
    }

    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error(
      "GET COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// GET COUPON BY CODE
// GET /api/coupons/code/:code
// =====================================================

const getCouponByCode = async (
  req,
  res
) => {
  try {
    const code =
      normalizeCouponCode(
        req.params.code
      );

    const coupon =
      await Coupon.findOne({
        code,
      });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found.",
      });
    }

    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error(
      "GET COUPON BY CODE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — UPDATE COUPON
// PUT /api/coupons/:id
// =====================================================

const updateCoupon = async (
  req,
  res
) => {
  try {
    const {
      code,
      name,
      discount,
      wheelValue,
      discountScope,
      category,
      description,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      maxUses,
      active,
    } = req.body;

    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found.",
      });
    }

    if (code !== undefined) {
      const newCode =
        normalizeCouponCode(code);

      if (!newCode) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon code cannot be empty.",
        });
      }

      const duplicate =
        await Coupon.findOne({
          code: newCode,
          _id: {
            $ne: coupon._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Coupon code already exists.",
        });
      }

      coupon.code =
        newCode;
    }

    if (discount !== undefined) {
      const value =
        Number(discount);

      if (
        !WHEEL_REWARDS.includes(
          value
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount must be 3, 5, 7 or 10.",
        });
      }

      coupon.discount =
        value;

      if (
        coupon.source ===
        "Spin & Win"
      ) {
        coupon.wheelValue =
          value;
      }
    }

    if (wheelValue !== undefined) {
      const value =
        Number(wheelValue);

      if (
        !WHEEL_REWARDS.includes(
          value
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Wheel value must be 3, 5, 7 or 10.",
        });
      }

      coupon.wheelValue =
        value;
    }

    if (name !== undefined) {
      coupon.name =
        String(name).trim();
    }

    if (
      description !== undefined
    ) {
      coupon.description =
        String(description).trim();
    }

    if (
      discountScope !== undefined
    ) {
      const scope =
        discountScope === "category"
          ? "category"
          : "all";

      coupon.discountScope =
        scope;

      if (scope === "all") {
        coupon.category =
          null;
      }
    }

    if (category !== undefined) {
      const cleanCategory =
        String(category || "").trim();

      if (
        coupon.discountScope ===
          "category" &&
        !cleanCategory
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category is required for category discount.",
        });
      }

      coupon.category =
        cleanCategory || null;
    }

    if (
      minOrderAmount !== undefined
    ) {
      const value =
        Number(minOrderAmount);

      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum order amount cannot be negative.",
        });
      }

      coupon.minOrderAmount =
        value;
    }

    if (
      maxDiscount !== undefined
    ) {
      if (
        maxDiscount === null ||
        maxDiscount === ""
      ) {
        coupon.maxDiscount =
          null;
      } else {
        const value =
          Number(maxDiscount);

        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Maximum discount is invalid.",
          });
        }

        coupon.maxDiscount =
          value;
      }
    }

    if (maxUses !== undefined) {
      const value =
        Number(maxUses);

      if (
        !Number.isInteger(value) ||
        value < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Max uses must be at least 1.",
        });
      }

      if (
        value < coupon.usedCount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Max uses cannot be less than used count.",
        });
      }

      coupon.maxUses =
        value;
    }

    if (active !== undefined) {
      coupon.active =
        Boolean(active);
    }

    if (startDate !== undefined) {
      const date =
        new Date(startDate);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start date.",
        });
      }

      coupon.startDate =
        date;
    }

    if (expiryDate !== undefined) {
      const date =
        new Date(expiryDate);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid expiry date.",
        });
      }

      coupon.expiryDate =
        date;
    }

    if (
      coupon.startDate >=
      coupon.expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date/time must be after start date/time.",
      });
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message:
        "Coupon updated successfully.",
      coupon,
    });
  } catch (error) {
    console.error(
      "UPDATE COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN — DELETE COUPON
// DELETE /api/coupons/:id
// =====================================================

const deleteCoupon = async (
  req,
  res
) => {
  try {
    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found.",
      });
    }

    await coupon.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// CUSTOMER — START SPIN SESSION
// POST /api/coupons/spin/start
// =====================================================

const startSpinSession = async (
  req,
  res
) => {
  try {
    const {
      name,
      mobile,
    } = req.body;

    const cleanName =
      String(name || "").trim();

    const cleanMobile =
      normalizeMobile(mobile);

    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message:
          "Name is required.",
      });
    }

    // -------------------------------------------------
    // MOBILE
    // -------------------------------------------------

    if (
      !isValidMobile(
        cleanMobile
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit mobile number.",
      });
    }

    // -------------------------------------------------
    // ACTIVE CAMPAIGN CHECK
    // -------------------------------------------------

    const campaign =
      await getActiveSpinCampaign();

    if (!campaign) {
      return res.status(400).json({
        success: false,
        campaignInactive: true,
        message:
          "Spin & Win is currently inactive.",
      });
    }

    // -------------------------------------------------
    // PERMANENT CLAIM CHECK
    // -------------------------------------------------

    if (
      campaign.oneSpinPerMobile !==
      false
    ) {
      const existingClaim =
        await CouponClaim.findOne({
          mobile: cleanMobile,
        });

      if (existingClaim) {
        return res.status(409).json({
          success: false,
          alreadyUsed: true,
          message:
            "This mobile number has already used the Spin & Win offer.",
        });
      }
    }

    // -------------------------------------------------
    // ACTIVE SESSION CHECK
    // -------------------------------------------------

    const existingSession =
      await SpinSession.findOne({
        mobile: cleanMobile,
        status: "active",
      });

    if (existingSession) {
      // If session is still valid
      if (
        existingSession.expiresAt >
        new Date()
      ) {
        return res.status(409).json({
          success: false,
          alreadyUsed: true,
          message:
            "This mobile number already has a Spin & Win session.",
        });
      }

      // Old session expired
      existingSession.status =
        "expired";

      await existingSession.save();
    }

    // -------------------------------------------------
    // CAMPAIGN REWARDS
    // -------------------------------------------------

    const campaignRewardCodes =
      (campaign.rewards || [])
        .filter(
          (reward) =>
            reward.active !== false
        )
        .map((reward) =>
          normalizeCouponCode(
            reward.code
          )
        )
        .filter(Boolean);

    if (
      !campaignRewardCodes.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No Spin & Win rewards are configured in the active campaign.",
      });
    }

    // -------------------------------------------------
    // CHECK AVAILABLE COUPONS
    // -------------------------------------------------

    const now =
      new Date();

    const availableCoupons =
      await Coupon.find({
        active: true,

        source: "Spin & Win",

        code: {
          $in:
            campaignRewardCodes,
        },

        startDate: {
          $lte: now,
        },

        expiryDate: {
          $gt: now,
        },

        $expr: {
          $lt: [
            "$usedCount",
            "$maxUses",
          ],
        },
      });

    if (
      !availableCoupons.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Spin & Win offer is currently unavailable.",
      });
    }

    // -------------------------------------------------
    // SESSION EXPIRY
    // -------------------------------------------------

    const campaignSessionMinutes =
      Number(
        campaign.sessionMinutes ||
          SESSION_MINUTES
      );

    const expiresAt =
      new Date(
        Date.now() +
          campaignSessionMinutes *
            60 *
            1000
      );

    // -------------------------------------------------
    // CREATE SESSION
    // -------------------------------------------------

    const session =
      await SpinSession.create({
        name: cleanName,

        mobile: cleanMobile,

        sessionId:
          generateSessionId(),

        expiresAt,

        status: "active",

        hasSpun: false,
      });

    return res.status(201).json({
      success: true,
      message:
        "Spin session started.",

      sessionId:
        session.sessionId,

      expiresAt:
        session.expiresAt,

      sessionMinutes:
        campaignSessionMinutes,

      campaignExpiresAt:
        campaign.expiryDate,
    });
  } catch (error) {
    console.error(
      "START SPIN SESSION ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        alreadyUsed: true,
        message:
          "This mobile number has already used or started the Spin & Win offer.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to start spin session.",
      error: error.message,
    });
  }
};

// =====================================================
// CUSTOMER — SPIN
// POST /api/coupons/spin
// =====================================================

const spinCoupon = async (
  req,
  res
) => {
  try {
    const {
      sessionId,
    } = req.body;

    // -------------------------------------------------
    // SESSION ID
    // -------------------------------------------------

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "Session ID is required.",
      });
    }

    // -------------------------------------------------
    // ACTIVE CAMPAIGN CHECK
    // -------------------------------------------------

    const campaign =
      await getActiveSpinCampaign();

    if (!campaign) {
      return res.status(400).json({
        success: false,
        campaignInactive: true,
        message:
          "Spin & Win campaign has expired or is currently inactive.",
      });
    }

    // -------------------------------------------------
    // FIND SESSION
    // -------------------------------------------------

    const session =
      await SpinSession.findOne({
        sessionId,
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        sessionExpired: true,
        message:
          "Spin session expired. Please start again.",
      });
    }

    // -------------------------------------------------
    // SESSION EXPIRY
    // -------------------------------------------------

    if (
      session.status !== "active" ||
      session.expiresAt <=
        new Date()
    ) {
      session.status =
        "expired";

      await session.save();

      return res.status(410).json({
        success: false,
        sessionExpired: true,
        message:
          "Spin session expired. Please start again.",
      });
    }

    // -------------------------------------------------
    // ALREADY SPUN
    // -------------------------------------------------

    if (session.hasSpun) {
      return res.status(409).json({
        success: false,
        message:
          "This session has already been used.",
        reward:
          session.reward,
      });
    }

    // -------------------------------------------------
    // PERMANENT CLAIM CHECK
    // -------------------------------------------------

    if (
      campaign.oneSpinPerMobile !==
      false
    ) {
      const existingClaim =
        await CouponClaim.findOne({
          mobile: session.mobile,
        });

      if (existingClaim) {
        return res.status(409).json({
          success: false,
          alreadyUsed: true,
          message:
            "This mobile number has already used the Spin & Win offer.",
        });
      }
    }

    const now =
      new Date();

    // -------------------------------------------------
    // CAMPAIGN REWARD CODES
    // -------------------------------------------------

    const campaignRewards =
      (campaign.rewards || [])
        .filter(
          (reward) =>
            reward.active !== false
        )
        .map((reward) => ({
          code:
            normalizeCouponCode(
              reward.code
            ),

          wheelValue:
            Number(
              reward.wheelValue
            ),

          discount:
            Number(
              reward.discount
            ),
        }))
        .filter(
          (reward) =>
            reward.code &&
            WHEEL_REWARDS.includes(
              reward.wheelValue
            )
        );

    if (
      !campaignRewards.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid Spin & Win reward is configured.",
      });
    }

    // -------------------------------------------------
    // FIND ELIGIBLE COUPONS
    // -------------------------------------------------

    const campaignRewardCodes =
      campaignRewards.map(
        (reward) =>
          reward.code
      );

    const eligibleCoupons =
      await Coupon.find({
        active: true,

        source: "Spin & Win",

        code: {
          $in:
            campaignRewardCodes,
        },

        startDate: {
          $lte: now,
        },

        expiryDate: {
          $gt: now,
        },

        $expr: {
          $lt: [
            "$usedCount",
            "$maxUses",
          ],
        },
      });

    if (
      !eligibleCoupons.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No active Spin & Win coupon is currently available.",
      });
    }

    // -------------------------------------------------
    // NORMALIZE COUPONS
    // -------------------------------------------------

    const normalizedCoupons =
      eligibleCoupons
        .map((coupon) => {
          const wheelValue =
            getCouponWheelValue(
              coupon
            );

          return {
            coupon,
            wheelValue,
          };
        })
        .filter((item) =>
          WHEEL_REWARDS.includes(
            item.wheelValue
          )
        );

    if (
      !normalizedCoupons.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid Spin & Win reward is currently available.",
      });
    }

    // -------------------------------------------------
    // AVAILABLE REWARDS
    // -------------------------------------------------

    const availableRewards =
      WHEEL_REWARDS.filter(
        (reward) =>
          normalizedCoupons.some(
            (item) =>
              item.wheelValue ===
              reward
          )
      );

    if (
      !availableRewards.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No wheel reward is currently available.",
      });
    }

    // -------------------------------------------------
    // SECURE RANDOM REWARD
    // -------------------------------------------------

    const randomIndex =
      crypto.randomInt(
        0,
        availableRewards.length
      );

    const randomReward =
      availableRewards[
        randomIndex
      ];

    // -------------------------------------------------
    // MATCHING COUPONS
    // -------------------------------------------------

    const matchingCoupons =
      normalizedCoupons.filter(
        (item) =>
          item.wheelValue ===
          randomReward
      );

    if (
      !matchingCoupons.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No coupon found for selected reward.",
      });
    }

    // -------------------------------------------------
    // RANDOM COUPON
    // -------------------------------------------------

    const couponIndex =
      crypto.randomInt(
        0,
        matchingCoupons.length
      );

    const selectedItem =
      matchingCoupons[
        couponIndex
      ];

    const selectedCoupon =
      selectedItem.coupon;

    // -------------------------------------------------
    // RESERVE COUPON USAGE
    // -------------------------------------------------

    const reservedCoupon =
      await Coupon.findOneAndUpdate(
        {
          _id:
            selectedCoupon._id,

          active: true,

          $expr: {
            $lt: [
              "$usedCount",
              "$maxUses",
            ],
          },
        },
        {
          $inc: {
            usedCount: 1,
          },
        },
        {
          new: true,
        }
      );

    if (!reservedCoupon) {
      return res.status(409).json({
        success: false,
        message:
          "This coupon was just claimed by another customer. Please start again.",
      });
    }

    // -------------------------------------------------
    // SAVE SESSION
    // -------------------------------------------------

    session.coupon =
      reservedCoupon._id;

    session.reward =
      randomReward;

    session.discountScope =
      reservedCoupon.discountScope;

    session.category =
      reservedCoupon.category;

    session.hasSpun =
      true;

    session.status =
      "completed";

    session.spunAt =
      new Date();

    await session.save();

    // -------------------------------------------------
    // CREATE PERMANENT CLAIM
    // -------------------------------------------------

    let claim;

    try {
      claim =
        await CouponClaim.create({
          name:
            session.name,

          mobile:
            session.mobile,

          coupon:
            reservedCoupon._id,

          couponCode:
            reservedCoupon.code,

          discount:
            reservedCoupon.discount,

          discountScope:
            reservedCoupon.discountScope,

          category:
            reservedCoupon.category,

          status:
            "claimed",

          claimedAt:
            new Date(),
        });
    } catch (claimError) {
      if (
        claimError.code === 11000
      ) {
        await Coupon.findByIdAndUpdate(
          reservedCoupon._id,
          {
            $inc: {
              usedCount: -1,
            },
          }
        );

        return res.status(409).json({
          success: false,
          alreadyUsed: true,
          message:
            "This mobile number has already used the Spin & Win offer.",
        });
      }

      throw claimError;
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Congratulations! You won a coupon.",

      reward:
        randomReward,

      wheelValue:
        randomReward,

      couponCode:
        reservedCoupon.code,

      couponId:
        reservedCoupon._id,

      discount:
        reservedCoupon.discount,

      discountScope:
        reservedCoupon.discountScope,

      category:
        reservedCoupon.category,

      minOrderAmount:
        reservedCoupon.minOrderAmount,

      maxDiscount:
        reservedCoupon.maxDiscount,

      expiresAt:
        reservedCoupon.expiryDate,

      sessionExpiresAt:
        session.expiresAt,

      campaignExpiresAt:
        campaign.expiryDate,

      claimId:
        claim._id,
    });
  } catch (error) {
    console.error(
      "SPIN COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Spin failed.",
      error: error.message,
    });
  }
};

// =====================================================
// VALIDATE COUPON
// POST /api/coupons/validate
// =====================================================

const validateCoupon = async (
  req,
  res
) => {
  try {
    const {
      code,
      mobile,
      category,
      orderAmount,
    } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          "Coupon code is required.",
      });
    }

    const couponCode =
      normalizeCouponCode(code);

    const coupon =
      await Coupon.findOne({
        code: couponCode,
      });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message:
          "Invalid coupon code.",
      });
    }

    const now =
      new Date();

    if (!coupon.active) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          "Coupon is inactive.",
      });
    }

    if (
      coupon.startDate &&
      now < coupon.startDate
    ) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          "Coupon is not active yet.",
      });
    }

    if (
      coupon.expiryDate &&
      now >= coupon.expiryDate
    ) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          "Coupon has expired.",
      });
    }

    if (
      coupon.maxUses !== null &&
      coupon.maxUses !== undefined &&
      coupon.usedCount >=
        coupon.maxUses
    ) {
      return res.status(400).json({
        success: false,
        valid: false,
        message:
          "Coupon usage limit reached.",
      });
    }

    // -------------------------------------------------
    // MOBILE
    // -------------------------------------------------

    if (mobile) {
      const cleanMobile =
        normalizeMobile(mobile);

      if (
        !isValidMobile(
          cleanMobile
        )
      ) {
        return res.status(400).json({
          success: false,
          valid: false,
          message:
            "Invalid mobile number.",
        });
      }

      const claim =
        await CouponClaim.findOne({
          mobile:
            cleanMobile,
          coupon:
            coupon._id,
        });

      if (claim) {
        return res.status(409).json({
          success: false,
          valid: false,
          alreadyUsed: true,
          message:
            "This coupon has already been claimed by this mobile number.",
        });
      }
    }

    // -------------------------------------------------
    // CATEGORY CHECK
    // -------------------------------------------------

    if (
      coupon.discountScope ===
      "category"
    ) {
      if (!category) {
        return res.status(400).json({
          success: false,
          valid: false,
          categoryRequired: true,
          message:
            `This coupon is valid only for ${coupon.category}.`,
        });
      }

      if (
        String(category).trim() !==
        String(
          coupon.category
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          valid: false,
          categoryMismatch: true,
          message:
            `This coupon is valid only for ${coupon.category}.`,
        });
      }
    }

    // -------------------------------------------------
    // ORDER AMOUNT
    // -------------------------------------------------

    let discountAmount = null;

    if (
      orderAmount !== undefined &&
      orderAmount !== null &&
      orderAmount !== ""
    ) {
      const amount =
        Number(orderAmount);

      if (
        Number.isNaN(amount) ||
        amount < 0
      ) {
        return res.status(400).json({
          success: false,
          valid: false,
          message:
            "Invalid order amount.",
        });
      }

      if (
        amount <
        Number(
          coupon.minOrderAmount || 0
        )
      ) {
        return res.status(400).json({
          success: false,
          valid: false,
          message:
            `Minimum order amount is ₹${coupon.minOrderAmount}.`,
        });
      }

      discountAmount =
        (amount *
          coupon.discount) /
        100;

      if (
        coupon.maxDiscount !==
          null &&
        coupon.maxDiscount !==
          undefined
      ) {
        discountAmount =
          Math.min(
            discountAmount,
            coupon.maxDiscount
          );
      }
    }

    return res.status(200).json({
      success: true,

      valid: true,

      message:
        "Coupon is valid.",

      coupon: {
        code:
          coupon.code,

        discount:
          coupon.discount,

        type:
          coupon.type,

        discountScope:
          coupon.discountScope,

        category:
          coupon.category,

        minOrderAmount:
          coupon.minOrderAmount,

        maxDiscount:
          coupon.maxDiscount,

        discountAmount,

        expiryDate:
          coupon.expiryDate,
      },
    });
  } catch (error) {
    console.error(
      "VALIDATE COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to validate coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// USE / REDEEM COUPON
// POST /api/coupons/use
// =====================================================

const useCoupon = async (
  req,
  res
) => {
  try {
    const {
      code,
      mobile,
    } = req.body;

    if (!code || !mobile) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code and mobile number are required.",
      });
    }

    const couponCode =
      normalizeCouponCode(code);

    const cleanMobile =
      normalizeMobile(mobile);

    if (
      !isValidMobile(
        cleanMobile
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mobile number.",
      });
    }

    const coupon =
      await Coupon.findOne({
        code: couponCode,
      });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found.",
      });
    }

    const claim =
      await CouponClaim.findOne({
        mobile:
          cleanMobile,
        coupon:
          coupon._id,
      });

    if (!claim) {
      return res.status(403).json({
        success: false,
        message:
          "This coupon was not claimed by this mobile number.",
      });
    }

    if (
      claim.status === "used"
    ) {
      return res.status(409).json({
        success: false,
        alreadyUsed: true,
        message:
          "This coupon has already been used.",
      });
    }

    const now =
      new Date();

    if (!coupon.active) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon is inactive.",
      });
    }

    if (
      coupon.startDate &&
      now < coupon.startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon is not active yet.",
      });
    }

    if (
      coupon.expiryDate &&
      now >= coupon.expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon has expired.",
      });
    }

    claim.status =
      "used";

    claim.usedAt =
      new Date();

    await claim.save();

    return res.status(200).json({
      success: true,

      message:
        "Coupon used successfully.",

      couponCode:
        coupon.code,

      discount:
        coupon.discount,

      discountScope:
        coupon.discountScope,

      category:
        coupon.category,
    });
  } catch (error) {
    console.error(
      "USE COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to use coupon.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
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
};