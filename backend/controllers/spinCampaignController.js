const SpinCampaign = require("../models/SpinCampaign");
const Coupon = require("../models/Coupon");

// =====================================================
// ALLOWED WHEEL REWARDS
// =====================================================

const ALLOWED_REWARDS = [3, 5, 7, 10];

// =====================================================
// HELPERS
// =====================================================

const normalizeCode = (code) => {
  return String(code || "")
    .trim()
    .toUpperCase();
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// =====================================================
// PREPARE REWARDS
// =====================================================

const prepareRewards = (rewards) => {
  if (!Array.isArray(rewards)) {
    return [];
  }

  return rewards
    .map((reward) => {
      const wheelValue = Number(
        reward.wheelValue ?? reward.discount
      );

      const discount = Number(
        reward.discount ?? reward.wheelValue
      );

      return {
        wheelValue,
        discount,

        code: normalizeCode(
          reward.code
        ),

        name:
          String(
            reward.name || ""
          ).trim() ||
          `Spin & Win ${discount}% OFF`,

        description:
          String(
            reward.description || ""
          ).trim(),

        minOrderAmount:
          toNumber(
            reward.minOrderAmount,
            0
          ),

        maxDiscount:
          toNumber(
            reward.maxDiscount,
            0
          ),

        maxUses:
          Math.max(
            1,
            Math.floor(
              toNumber(
                reward.maxUses,
                1
              )
            )
          ),

        active:
          reward.active !== false,
      };
    })
    .filter((reward) => {
      return (
        ALLOWED_REWARDS.includes(
          reward.wheelValue
        ) &&
        reward.discount >= 0 &&
        reward.discount <= 100 &&
        reward.code
      );
    });
};

// =====================================================
// VALIDATE REWARDS
// =====================================================

const validateRewards = (rewards) => {
  if (!Array.isArray(rewards)) {
    return {
      valid: false,
      message:
        "Rewards must be an array.",
    };
  }

  if (rewards.length === 0) {
    return {
      valid: false,
      message:
        "At least one Spin & Win reward is required.",
    };
  }

  const prepared =
    prepareRewards(rewards);

  if (
    prepared.length !==
    rewards.length
  ) {
    return {
      valid: false,
      message:
        "Each reward must have valid wheel value, discount and coupon code.",
    };
  }

  const values =
    prepared.map(
      (reward) =>
        reward.wheelValue
    );

  const duplicateValues =
    values.filter(
      (value, index) =>
        values.indexOf(value) !==
        index
    );

  if (
    duplicateValues.length > 0
  ) {
    return {
      valid: false,
      message:
        "Each wheel reward can be configured only once.",
    };
  }

  const codes =
    prepared.map(
      (reward) =>
        reward.code
    );

  const duplicateCodes =
    codes.filter(
      (code, index) =>
        codes.indexOf(code) !==
        index
    );

  if (
    duplicateCodes.length > 0
  ) {
    return {
      valid: false,
      message:
        "Coupon codes must be unique.",
    };
  }

  return {
    valid: true,
    rewards: prepared,
  };
};

// =====================================================
// SYNC REWARDS WITH COUPON COLLECTION
// =====================================================

const syncCampaignCoupons = async ({
  rewards,
  startDate,
  expiryDate,
}) => {
  const preparedRewards =
    prepareRewards(rewards);

  const couponIds = [];

  for (const reward of preparedRewards) {
    const couponCode =
      normalizeCode(
        reward.code
      );

    let coupon =
      await Coupon.findOne({
        code: couponCode,
      });

    if (!coupon) {
      coupon =
        await Coupon.create({
          code: couponCode,

          name:
            reward.name,

          discount:
            reward.discount,

          type: "percentage",

          wheelValue:
            reward.wheelValue,

          discountScope:
            "all",

          category:
            null,

          source:
            "Spin & Win",

          description:
            reward.description ||
            `Vraj Creation Spin & Win ${reward.discount}% OFF`,

          minOrderAmount:
            reward.minOrderAmount,

          maxDiscount:
            reward.maxDiscount,

          startDate:
            startDate,

          expiryDate:
            expiryDate,

          maxUses:
            reward.maxUses,

          usedCount:
            0,

          active:
            reward.active,
        });
    } else {
      coupon.name =
        reward.name;

      coupon.discount =
        reward.discount;

      coupon.type =
        "percentage";

      coupon.wheelValue =
        reward.wheelValue;

      coupon.source =
        "Spin & Win";

      coupon.description =
        reward.description ||
        `Vraj Creation Spin & Win ${reward.discount}% OFF`;

      coupon.minOrderAmount =
        reward.minOrderAmount;

      coupon.maxDiscount =
        reward.maxDiscount;

      coupon.startDate =
        startDate;

      coupon.expiryDate =
        expiryDate;

      coupon.maxUses =
        Math.max(
          reward.maxUses,
          coupon.usedCount || 0
        );

      coupon.active =
        reward.active;

      await coupon.save();
    }

    couponIds.push(
      coupon._id
    );
  }

  return couponIds;
};

// =====================================================
// DISABLE ALL OTHER CAMPAIGNS
// =====================================================

const disableOtherCampaigns =
  async (exceptId = null) => {
    const filter = {
      enabled: true,
    };

    if (exceptId) {
      filter._id = {
        $ne: exceptId,
      };
    }

    await SpinCampaign.updateMany(
      filter,
      {
        $set: {
          enabled: false,
        },
      }
    );
  };

// =====================================================
// GET CURRENT SPIN CAMPAIGN
// GET /api/campaign/spin
// =====================================================

const getSpinCampaign = async (
  req,
  res
) => {
  try {
    const campaign =
      await SpinCampaign.findOne()
        .sort({
          createdAt: -1,
        });

    if (!campaign) {
      return res.status(200).json({
        success: true,

        active: false,

        campaign: null,
      });
    }

    const active =
      await campaign.checkExpiry();

    return res.status(200).json({
      success: true,

      active,

      campaign: {
        ...campaign.toObject(),

        isActive: active,
      },
    });
  } catch (error) {
    console.error(
      "GET SPIN CAMPAIGN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get Spin & Win campaign.",
      error: error.message,
    });
  }
};

// =====================================================
// ACTIVATE NEW SPIN CAMPAIGN
// POST /api/campaign/spin/activate
// =====================================================

const activateSpinCampaign =
  async (req, res) => {
    try {
      const {
        name,
        startDate,
        durationDays,
        rewards,
        oneSpinPerMobile,
        sessionMinutes,
      } = req.body;

      // -------------------------------------------------
      // START DATE
      // -------------------------------------------------

      const start =
        startDate
          ? new Date(startDate)
          : new Date();

      if (
        Number.isNaN(
          start.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start date/time.",
        });
      }

      // -------------------------------------------------
      // DURATION
      // -------------------------------------------------

      const duration =
        Math.max(
          1,
          Math.floor(
            toNumber(
              durationDays,
              10
            )
          )
        );

      const expiry =
        new Date(start);

      expiry.setDate(
        expiry.getDate() +
          duration
      );

      // -------------------------------------------------
      // REWARDS
      // -------------------------------------------------

      const rewardValidation =
        validateRewards(
          rewards
        );

      if (
        !rewardValidation.valid
      ) {
        return res.status(400).json({
          success: false,
          message:
            rewardValidation.message,
        });
      }

      const preparedRewards =
        rewardValidation.rewards;

      // -------------------------------------------------
      // SESSION MINUTES
      // -------------------------------------------------

      const campaignSessionMinutes =
        Math.max(
          1,
          Math.floor(
            toNumber(
              sessionMinutes,
              5
            )
          )
        );

      // -------------------------------------------------
      // DISABLE PREVIOUS CAMPAIGNS
      // -------------------------------------------------

      await disableOtherCampaigns();

      // -------------------------------------------------
      // CREATE CAMPAIGN
      // -------------------------------------------------

      const campaign =
        await SpinCampaign.create({
          name:
            String(
              name || ""
            ).trim() ||
            "Vraj Creation Spin & Win",

          enabled: true,

          startDate:
            start,

          expiryDate:
            expiry,

          durationDays:
            duration,

          rewards:
            preparedRewards,

          oneSpinPerMobile:
            oneSpinPerMobile !==
            false,

          sessionMinutes:
            campaignSessionMinutes,
        });

      // -------------------------------------------------
      // CREATE / UPDATE COUPONS
      // -------------------------------------------------

      await syncCampaignCoupons({
        rewards:
          preparedRewards,

        startDate:
          start,

        expiryDate:
          expiry,
      });

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      return res.status(201).json({
        success: true,

        message:
          "Spin & Win campaign activated successfully.",

        campaign,
      });
    } catch (error) {
      console.error(
        "ACTIVATE SPIN CAMPAIGN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to activate Spin & Win campaign.",
        error: error.message,
      });
    }
  };

// =====================================================
// DEACTIVATE CAMPAIGN
// POST /api/campaign/spin/deactivate
// =====================================================

const deactivateSpinCampaign =
  async (req, res) => {
    try {
      const campaign =
        await SpinCampaign.findOne({
          enabled: true,
        }).sort({
          createdAt: -1,
        });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message:
            "No active Spin & Win campaign found.",
        });
      }

      campaign.enabled =
        false;

      await campaign.save();

      // Disable campaign coupons
      await Coupon.updateMany(
        {
          source: "Spin & Win",

          code: {
            $in:
              campaign.rewards.map(
                (reward) =>
                  normalizeCode(
                    reward.code
                  )
              ),
          },
        },
        {
          $set: {
            active: false,
          },
        }
      );

      return res.status(200).json({
        success: true,

        message:
          "Spin & Win campaign deactivated successfully.",

        campaign,
      });
    } catch (error) {
      console.error(
        "DEACTIVATE SPIN CAMPAIGN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to deactivate Spin & Win campaign.",
        error: error.message,
      });
    }
  };

// =====================================================
// UPDATE CAMPAIGN
// PUT /api/campaign/spin/update
// =====================================================

const updateSpinCampaign =
  async (req, res) => {
    try {
      const {
        name,
        rewards,
        oneSpinPerMobile,
        sessionMinutes,
        startDate,
        durationDays,
        enabled,
      } = req.body;

      const campaign =
        await SpinCampaign.findOne()
          .sort({
            createdAt: -1,
          });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message:
            "Spin & Win campaign not found.",
        });
      }

      // -------------------------------------------------
      // NAME
      // -------------------------------------------------

      if (name !== undefined) {
        campaign.name =
          String(name).trim() ||
          "Vraj Creation Spin & Win";
      }

      // -------------------------------------------------
      // REWARDS
      // -------------------------------------------------

      if (
        rewards !== undefined
      ) {
        const validation =
          validateRewards(
            rewards
          );

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message:
              validation.message,
          });
        }

        campaign.rewards =
          validation.rewards;
      }

      // -------------------------------------------------
      // ONE SPIN PER MOBILE
      // -------------------------------------------------

      if (
        oneSpinPerMobile !==
        undefined
      ) {
        campaign.oneSpinPerMobile =
          oneSpinPerMobile !==
          false;
      }

      // -------------------------------------------------
      // SESSION TIME
      // -------------------------------------------------

      if (
        sessionMinutes !==
        undefined
      ) {
        campaign.sessionMinutes =
          Math.max(
            1,
            Math.floor(
              toNumber(
                sessionMinutes,
                5
              )
            )
          );
      }

      // -------------------------------------------------
      // START DATE
      // -------------------------------------------------

      if (
        startDate !== undefined
      ) {
        const newStart =
          new Date(
            startDate
          );

        if (
          Number.isNaN(
            newStart.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid start date/time.",
          });
        }

        campaign.startDate =
          newStart;
      }

      // -------------------------------------------------
      // DURATION
      // -------------------------------------------------

      if (
        durationDays !==
        undefined
      ) {
        campaign.durationDays =
          Math.max(
            1,
            Math.floor(
              toNumber(
                durationDays,
                10
              )
            )
          );
      }

      // -------------------------------------------------
      // RECALCULATE EXPIRY
      // -------------------------------------------------

      const expiry =
        new Date(
          campaign.startDate
        );

      expiry.setDate(
        expiry.getDate() +
          campaign.durationDays
      );

      campaign.expiryDate =
        expiry;

      // -------------------------------------------------
      // ENABLE / DISABLE
      // -------------------------------------------------

      if (
        enabled !== undefined
      ) {
        campaign.enabled =
          Boolean(enabled);
      }

      // -------------------------------------------------
      // IF ENABLED
      // -------------------------------------------------

      if (
        campaign.enabled
      ) {
        await disableOtherCampaigns(
          campaign._id
        );
      }

      // -------------------------------------------------
      // SAVE CAMPAIGN
      // -------------------------------------------------

      await campaign.save();

      // -------------------------------------------------
      // SYNC COUPONS
      // -------------------------------------------------

      await syncCampaignCoupons({
        rewards:
          campaign.rewards,

        startDate:
          campaign.startDate,

        expiryDate:
          campaign.expiryDate,
      });

      // -------------------------------------------------
      // DISABLE COUPONS WHEN CAMPAIGN DISABLED
      // -------------------------------------------------

      if (
        !campaign.enabled
      ) {
        await Coupon.updateMany(
          {
            source:
              "Spin & Win",

            code: {
              $in:
                campaign.rewards.map(
                  (reward) =>
                    normalizeCode(
                      reward.code
                    )
                ),
            },
          },
          {
            $set: {
              active: false,
            },
          }
        );
      }

      return res.status(200).json({
        success: true,

        message:
          "Spin & Win campaign updated successfully.",

        campaign,
      });
    } catch (error) {
      console.error(
        "UPDATE SPIN CAMPAIGN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update Spin & Win campaign.",
        error: error.message,
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getSpinCampaign,
  activateSpinCampaign,
  deactivateSpinCampaign,
  updateSpinCampaign,
};