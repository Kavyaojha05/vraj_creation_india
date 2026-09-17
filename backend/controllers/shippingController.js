const {
  calculateShipping,
} = require("../services/shippingService");

// ============================================================
// CALCULATE SHIPPING
// POST /api/shipping/calculate
// ============================================================

const calculateShippingController = (req, res) => {
  try {
    const {
      pincode,
      subtotal,
      items = [],
    } = req.body;

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required.",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array.",
      });
    }

    // --------------------------------------------------------
    // CALCULATE SHIPPING
    // --------------------------------------------------------

    const result = calculateShipping({
      pincode,
      subtotal,
      items,
    });

    // --------------------------------------------------------
    // INVALID PINCODE
    // --------------------------------------------------------

    if (!result.success) {
      return res.status(400).json(result);
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      shipping: {
        charge: result.charge,
        isFree: result.isFree,
        weightGrams: result.weightGrams,
        zone: result.zone,
        weightCharge:
          result.weightCharge || 0,
        zoneCharge:
          result.zoneCharge || 0,
        message: result.message,
      },

      subtotal: result.subtotal,

      freeShippingThreshold: 999,
    });
  } catch (error) {
    console.error(
      "Shipping Calculation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate shipping.",
    });
  }
};

module.exports = {
  calculateShippingController,
};