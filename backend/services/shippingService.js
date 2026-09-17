
// =====================================================
// VRAJ CREATION - SHIPPING SERVICE
// Customer Friendly Approximate Shipping
// Weight + Size + Volumetric Weight Support
//
// IMPORTANT:
// - Subtotal >= ₹999       => FREE SHIPPING
// - Wall Décor < ₹999      => FIXED ₹150
// - Other products         => Weight + Size + Zone
// - GST is NOT calculated here
// - GST is calculated separately in orderController
// =====================================================

const FREE_SHIPPING_THRESHOLD = 999;

// =====================================================
// SHIPPING CONFIG
// =====================================================

const SHIPPING_CONFIG = {
  // ---------------------------------------------------
  // Default product weight
  // ---------------------------------------------------
  defaultProductWeightGrams: 500,

  // ---------------------------------------------------
  // Default package dimensions
  // ---------------------------------------------------
  defaultDimensions: {
    lengthCm: 20,
    widthCm: 20,
    heightCm: 15,
  },

  // ---------------------------------------------------
  // Category-wise default profiles
  // ---------------------------------------------------
  categoryProfiles: {
    // =================================================
    // WALL DECOR
    // =================================================

    "wall decor": {
      weightGrams: 1200,
      lengthCm: 60,
      widthCm: 40,
      heightCm: 10,

      shippingMode: "fixed",

      shippingCharge: 150,
    },

    "wall décor": {
      weightGrams: 1200,
      lengthCm: 60,
      widthCm: 40,
      heightCm: 10,

      shippingMode: "fixed",

      shippingCharge: 150,
    },

    // =================================================
    // HOME DECOR
    // =================================================

    "home decor": {
      weightGrams: 800,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 20,
    },

    "home décor": {
      weightGrams: 800,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 20,
    },

    // =================================================
    // TABLE DECOR
    // =================================================

    "table decor": {
      weightGrams: 700,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 20,
    },

    "table décor": {
      weightGrams: 700,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 20,
    },

    // =================================================
    // RESIN ART
    // =================================================

    "resin art": {
      weightGrams: 700,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 10,
    },

    // =================================================
    // ETHNIC HOME FURNISHING
    // =================================================

    "ethnic home furnishing": {
      weightGrams: 1000,
      lengthCm: 40,
      widthCm: 30,
      heightCm: 20,
    },

    // =================================================
    // DESK ACCESSORIES
    // =================================================

    "desk accessories": {
      weightGrams: 500,
      lengthCm: 25,
      widthCm: 20,
      heightCm: 15,
    },
  },

  // ===================================================
  // WEIGHT SHIPPING SLABS
  // ===================================================

  weightSlabs: [
    {
      maxWeight: 500,
      charge: 60,
    },
    {
      maxWeight: 1000,
      charge: 80,
    },
    {
      maxWeight: 1500,
      charge: 100,
    },
    {
      maxWeight: 2000,
      charge: 120,
    },
    {
      maxWeight: 3000,
      charge: 150,
    },
    {
      maxWeight: 5000,
      charge: 190,
    },
    {
      maxWeight: 7500,
      charge: 230,
    },
    {
      maxWeight: 10000,
      charge: 270,
    },
  ],

  // ===================================================
  // PINCODE ZONE CHARGES
  // ===================================================

  zones: {
    local: 0,
    nearby: 20,
    rest: 40,
  },

  // ===================================================
  // VOLUMETRIC DIVISOR
  // ===================================================

  volumetricDivisor: 5000,

  // ===================================================
  // EXTRA SIZE CHARGES
  // ===================================================

  sizeCharges: [
    {
      maxVolumeCm3: 10000,
      charge: 0,
    },
    {
      maxVolumeCm3: 20000,
      charge: 20,
    },
    {
      maxVolumeCm3: 40000,
      charge: 40,
    },
    {
      maxVolumeCm3: 70000,
      charge: 70,
    },
    {
      maxVolumeCm3: 100000,
      charge: 100,
    },
  ],

  // ===================================================
  // VERY LARGE PACKAGE EXTRA CHARGE
  // ===================================================

  oversizedCharge: 100,

  // ===================================================
  // WALL DECOR SHIPPING
  // ===================================================
  //
  // FIXED:
  // Wall Décor = ₹150
  //
  // No weight charge.
  // No size charge.
  // No zone charge.
  //
  // Free shipping threshold still applies first.
  // ===================================================

  wallDecor: {
    shippingMode: "fixed",
    shippingCharge: 150,

    minShippingCharge: 150,
    maxShippingCharge: 150,
  },
};

// =====================================================
// HELPERS
// =====================================================

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizePincode = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "");

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;

  return (
    Math.round(
      Number(value || 0) * factor
    ) / factor
  );
};

// =====================================================
// CHECK WALL DECOR
// =====================================================

const isWallDecor = (item) => {
  const category = normalizeText(
    item?.category
  );

  if (!category) {
    return false;
  }

  return (
    category === "wall decor" ||
    category === "wall décor" ||
    (
      category.includes("wall") &&
      category.includes("decor")
    )
  );
};

// =====================================================
// PINCODE VALIDATION
// =====================================================

const isValidPincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(
    normalizePincode(pincode)
  );
};

// =====================================================
// SHIPPING ZONE
// =====================================================

const getShippingZone = (pincode) => {
  const normalized =
    normalizePincode(pincode);

  if (!isValidPincode(normalized)) {
    return "rest";
  }

  // =================================================
  // RAJASTHAN
  // =================================================

  if (
    normalized.startsWith("30") ||
    normalized.startsWith("31") ||
    normalized.startsWith("32") ||
    normalized.startsWith("33") ||
    normalized.startsWith("34")
  ) {
    return "local";
  }

  // =================================================
  // NEARBY NORTH INDIA
  // =================================================

  if (
    normalized.startsWith("11") ||
    normalized.startsWith("12") ||
    normalized.startsWith("13") ||
    normalized.startsWith("14") ||
    normalized.startsWith("15") ||
    normalized.startsWith("16") ||
    normalized.startsWith("17") ||
    normalized.startsWith("18") ||
    normalized.startsWith("19") ||
    normalized.startsWith("20") ||
    normalized.startsWith("21") ||
    normalized.startsWith("22") ||
    normalized.startsWith("23") ||
    normalized.startsWith("24") ||
    normalized.startsWith("25") ||
    normalized.startsWith("26") ||
    normalized.startsWith("27") ||
    normalized.startsWith("28")
  ) {
    return "nearby";
  }

  return "rest";
};

// =====================================================
// CATEGORY PROFILE
// =====================================================

const getCategoryProfile = (category) => {
  const normalizedCategory =
    normalizeText(category);

  if (
    SHIPPING_CONFIG.categoryProfiles[
      normalizedCategory
    ]
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      normalizedCategory
    ];
  }

  // ---------------------------------------------------
  // Wall Decor
  // ---------------------------------------------------

  if (
    normalizedCategory.includes("wall") &&
    normalizedCategory.includes("decor")
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      "wall decor"
    ];
  }

  // ---------------------------------------------------
  // Home Decor
  // ---------------------------------------------------

  if (
    normalizedCategory.includes("home") &&
    normalizedCategory.includes("decor")
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      "home decor"
    ];
  }

  // ---------------------------------------------------
  // Table Decor
  // ---------------------------------------------------

  if (
    normalizedCategory.includes("table") &&
    normalizedCategory.includes("decor")
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      "table decor"
    ];
  }

  // ---------------------------------------------------
  // Resin
  // ---------------------------------------------------

  if (
    normalizedCategory.includes("resin")
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      "resin art"
    ];
  }

  // ---------------------------------------------------
  // Furnishing
  // ---------------------------------------------------

  if (
    normalizedCategory.includes("furnishing")
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      "ethnic home furnishing"
    ];
  }

  // ---------------------------------------------------
  // Desk
  // ---------------------------------------------------

  if (
    normalizedCategory.includes("desk")
  ) {
    return SHIPPING_CONFIG.categoryProfiles[
      "desk accessories"
    ];
  }

  return null;
};

// =====================================================
// PRODUCT WEIGHT
// =====================================================

const getProductWeight = (item) => {
  if (!item) {
    return (
      SHIPPING_CONFIG
        .defaultProductWeightGrams
    );
  }

  const possibleWeights = [
    item.weightGrams,
    item.shippingWeightGrams,
    item.weight,
    item.shippingWeight,
  ];

  for (const value of possibleWeights) {
    const weight = toNumber(
      value,
      0
    );

    if (weight > 0) {
      return weight;
    }
  }

  const profile =
    getCategoryProfile(
      item.category
    );

  if (
    profile &&
    profile.weightGrams
  ) {
    return profile.weightGrams;
  }

  return (
    SHIPPING_CONFIG
      .defaultProductWeightGrams
  );
};

// =====================================================
// PRODUCT DIMENSIONS
// =====================================================

const getProductDimensions = (item) => {
  if (!item) {
    return {
      lengthCm:
        SHIPPING_CONFIG
          .defaultDimensions.lengthCm,

      widthCm:
        SHIPPING_CONFIG
          .defaultDimensions.widthCm,

      heightCm:
        SHIPPING_CONFIG
          .defaultDimensions.heightCm,
    };
  }

  const profile =
    getCategoryProfile(
      item.category
    );

  const length =
    toNumber(
      item.lengthCm ??
        item.length ??
        item.packageLength ??
        item.shippingLength ??
        item.dimensions?.length ??
        item.dimensions?.lengthCm,
      0
    );

  const width =
    toNumber(
      item.widthCm ??
        item.width ??
        item.packageWidth ??
        item.shippingWidth ??
        item.dimensions?.width ??
        item.dimensions?.widthCm,
      0
    );

  const height =
    toNumber(
      item.heightCm ??
        item.height ??
        item.packageHeight ??
        item.shippingHeight ??
        item.dimensions?.height ??
        item.dimensions?.heightCm,
      0
    );

  return {
    lengthCm:
      length > 0
        ? length
        : profile?.lengthCm ||
          SHIPPING_CONFIG
            .defaultDimensions.lengthCm,

    widthCm:
      width > 0
        ? width
        : profile?.widthCm ||
          SHIPPING_CONFIG
            .defaultDimensions.widthCm,

    heightCm:
      height > 0
        ? height
        : profile?.heightCm ||
          SHIPPING_CONFIG
            .defaultDimensions.heightCm,
  };
};

// =====================================================
// VOLUMETRIC WEIGHT
// =====================================================

const getVolumetricWeightGrams = (
  item
) => {
  const dimensions =
    getProductDimensions(item);

  const volume =
    dimensions.lengthCm *
    dimensions.widthCm *
    dimensions.heightCm;

  if (volume <= 0) {
    return 0;
  }

  const volumetricWeightKg =
    volume /
    SHIPPING_CONFIG
      .volumetricDivisor;

  return (
    volumetricWeightKg * 1000
  );
};

// =====================================================
// BILLABLE WEIGHT
// =====================================================

const getBillableWeight = (
  item
) => {
  const actualWeight =
    getProductWeight(item);

  const volumetricWeight =
    getVolumetricWeightGrams(item);

  return Math.max(
    actualWeight,
    volumetricWeight
  );
};

// =====================================================
// PRODUCT SHIPPING PROFILE
// =====================================================

const getProductShippingProfile = (
  item
) => {
  const dimensions =
    getProductDimensions(item);

  const actualWeight =
    getProductWeight(item);

  const volumetricWeight =
    getVolumetricWeightGrams(item);

  const billableWeight =
    getBillableWeight(item);

  const volume =
    dimensions.lengthCm *
    dimensions.widthCm *
    dimensions.heightCm;

  return {
    category:
      item?.category || "",

    isWallDecor:
      isWallDecor(item),

    actualWeightGrams:
      round(actualWeight),

    volumetricWeightGrams:
      round(volumetricWeight),

    billableWeightGrams:
      round(billableWeight),

    lengthCm:
      dimensions.lengthCm,

    widthCm:
      dimensions.widthCm,

    heightCm:
      dimensions.heightCm,

    volumeCm3:
      round(volume),
  };
};

// =====================================================
// TOTAL ACTUAL WEIGHT
// =====================================================

const calculateActualWeight = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) => {
      const quantity =
        Math.max(
          1,
          Math.floor(
            toNumber(
              item?.quantity,
              1
            )
          )
        );

      return (
        total +
        getProductWeight(item) *
          quantity
      );
    },
    0
  );
};

// =====================================================
// TOTAL VOLUMETRIC WEIGHT
// =====================================================

const calculateVolumetricWeight = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) => {
      const quantity =
        Math.max(
          1,
          Math.floor(
            toNumber(
              item?.quantity,
              1
            )
          )
        );

      return (
        total +
        getVolumetricWeightGrams(
          item
        ) *
          quantity
      );
    },
    0
  );
};

// =====================================================
// TOTAL BILLABLE WEIGHT
// =====================================================

const calculateTotalWeight = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) => {
      const quantity =
        Math.max(
          1,
          Math.floor(
            toNumber(
              item?.quantity,
              1
            )
          )
        );

      return (
        total +
        getBillableWeight(item) *
          quantity
      );
    },
    0
  );
};

// =====================================================
// TOTAL PACKAGE VOLUME
// =====================================================

const calculateTotalVolume = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) => {
      const quantity =
        Math.max(
          1,
          Math.floor(
            toNumber(
              item?.quantity,
              1
            )
          )
        );

      const dimensions =
        getProductDimensions(item);

      const volume =
        dimensions.lengthCm *
        dimensions.widthCm *
        dimensions.heightCm;

      return (
        total +
        volume * quantity
      );
    },
    0
  );
};

// =====================================================
// WEIGHT CHARGE
// =====================================================

const getWeightCharge = (
  weightGrams
) => {
  const weight =
    Math.max(
      0,
      toNumber(
        weightGrams,
        0
      )
    );

  if (weight <= 0) {
    return 0;
  }

  const slab =
    SHIPPING_CONFIG
      .weightSlabs
      .find(
        (item) =>
          weight <=
          item.maxWeight
      );

  if (slab) {
    return slab.charge;
  }

  // ---------------------------------------------------
  // Above maximum configured slab
  // ---------------------------------------------------

  const lastSlab =
    SHIPPING_CONFIG
      .weightSlabs[
        SHIPPING_CONFIG
          .weightSlabs.length - 1
      ];

  const extraWeight =
    Math.max(
      0,
      weight -
        lastSlab.maxWeight
    );

  const extraKg =
    Math.ceil(
      extraWeight / 1000
    );

  return (
    lastSlab.charge +
    extraKg * 40
  );
};

// =====================================================
// SIZE CHARGE
// =====================================================

const getSizeCharge = (
  totalVolumeCm3
) => {
  const volume =
    Math.max(
      0,
      toNumber(
        totalVolumeCm3,
        0
      )
    );

  if (volume <= 0) {
    return 0;
  }

  const slab =
    SHIPPING_CONFIG
      .sizeCharges
      .find(
        (item) =>
          volume <=
          item.maxVolumeCm3
      );

  if (slab) {
    return slab.charge;
  }

  const lastSizeSlab =
    SHIPPING_CONFIG
      .sizeCharges[
        SHIPPING_CONFIG
          .sizeCharges.length - 1
      ];

  return (
    lastSizeSlab.charge +
    SHIPPING_CONFIG
      .oversizedCharge
  );
};

// =====================================================
// CART HAS WALL DECOR
// =====================================================

const cartHasWallDecor = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return false;
  }

  return items.some(
    (item) =>
      isWallDecor(item)
  );
};

// =====================================================
// WALL DECOR SHIPPING
// =====================================================
//
// IMPORTANT:
//
// Wall Décor shipping is FIXED ₹150.
//
// If subtotal < ₹999:
//     Shipping = ₹150
//
// If subtotal >= ₹999:
//     Shipping = ₹0
//
// Weight, size and zone charges are NOT added.
//
// =====================================================

const getWallDecorShippingCharge = (
  items = []
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  const wallItems =
    items.filter(
      (item) =>
        isWallDecor(item)
    );

  if (
    wallItems.length === 0
  ) {
    return null;
  }

  return round(
    SHIPPING_CONFIG
      .wallDecor
      .shippingCharge
  );
};

// =====================================================
// CALCULATE SHIPPING
// =====================================================

const calculateShipping = ({
  pincode,
  subtotal,
  items = [],
}) => {
  const normalizedPincode =
    normalizePincode(pincode);

  const safeSubtotal =
    Math.max(
      0,
      toNumber(
        subtotal,
        0
      )
    );

  // =================================================
  // PINCODE VALIDATION
  // =================================================

  if (
    !isValidPincode(
      normalizedPincode
    )
  ) {
    return {
      success: false,

      isFree: false,

      charge: 0,

      subtotal:
        safeSubtotal,

      actualWeightGrams: 0,

      volumetricWeightGrams: 0,

      weightGrams: 0,

      billableWeightGrams: 0,

      totalVolumeCm3: 0,

      zone: null,

      weightCharge: 0,

      sizeCharge: 0,

      zoneCharge: 0,

      isApproximate: false,

      shippingMode: null,

      message:
        "Please enter a valid 6-digit pincode.",
    };
  }

  // =================================================
  // ITEMS VALIDATION
  // =================================================

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return {
      success: false,

      isFree: false,

      charge: 0,

      subtotal:
        safeSubtotal,

      actualWeightGrams: 0,

      volumetricWeightGrams: 0,

      weightGrams: 0,

      billableWeightGrams: 0,

      totalVolumeCm3: 0,

      zone:
        getShippingZone(
          normalizedPincode
        ),

      weightCharge: 0,

      sizeCharge: 0,

      zoneCharge: 0,

      isApproximate: false,

      shippingMode: null,

      message:
        "Cart items are required for shipping calculation.",
    };
  }

  // =================================================
  // PACKAGE CALCULATIONS
  // =================================================

  const actualWeightGrams =
    calculateActualWeight(
      items
    );

  const volumetricWeightGrams =
    calculateVolumetricWeight(
      items
    );

  const billableWeightGrams =
    calculateTotalWeight(
      items
    );

  const totalVolumeCm3 =
    calculateTotalVolume(
      items
    );

  const zone =
    getShippingZone(
      normalizedPincode
    );

  const hasWallDecor =
    cartHasWallDecor(
      items
    );

  // =================================================
  // FREE SHIPPING
  // =================================================
  //
  // This check comes BEFORE Wall Décor.
  //
  // Therefore:
  //
  // Wall Décor ₹1200 subtotal
  // => ₹0 shipping
  //
  // Wall Décor ₹800 subtotal
  // => ₹150 shipping
  //
  // =================================================

  if (
    safeSubtotal >=
    FREE_SHIPPING_THRESHOLD
  ) {
    return {
      success: true,

      isFree: true,

      charge: 0,

      subtotal:
        safeSubtotal,

      actualWeightGrams:
        round(
          actualWeightGrams
        ),

      volumetricWeightGrams:
        round(
          volumetricWeightGrams
        ),

      weightGrams:
        round(
          billableWeightGrams
        ),

      billableWeightGrams:
        round(
          billableWeightGrams
        ),

      totalVolumeCm3:
        round(
          totalVolumeCm3
        ),

      zone,

      weightCharge: 0,

      sizeCharge: 0,

      zoneCharge: 0,

      isApproximate:
        hasWallDecor,

      shippingMode:
        "free",

      message:
        "Free shipping applied.",
    };
  }

  // =================================================
  // WALL DECOR SHIPPING
  // =================================================
  //
  // FIXED ₹150
  //
  // No:
  // - Weight charge
  // - Size charge
  // - Zone charge
  //
  // =================================================

  if (hasWallDecor) {
    const wallShipping =
      getWallDecorShippingCharge(
        items
      );

    return {
      success: true,

      isFree: false,

      charge:
        round(
          wallShipping
        ),

      subtotal:
        safeSubtotal,

      actualWeightGrams:
        round(
          actualWeightGrams
        ),

      volumetricWeightGrams:
        round(
          volumetricWeightGrams
        ),

      weightGrams:
        round(
          billableWeightGrams
        ),

      billableWeightGrams:
        round(
          billableWeightGrams
        ),

      totalVolumeCm3:
        round(
          totalVolumeCm3
        ),

      zone,

      // Informational only.
      // NOT added to Wall Décor shipping.
      weightCharge:
        round(
          getWeightCharge(
            actualWeightGrams
          )
        ),

      sizeCharge: 0,

      zoneCharge: 0,

      isApproximate: true,

      shippingMode:
        "wall-fixed",

      message:
        `Fixed Wall Décor shipping ₹${round(
          wallShipping
        )}`,
    };
  }

  // =================================================
  // NORMAL SHIPPING
  // =================================================
  //
  // Normal products use ACTUAL WEIGHT.
  //
  // Volumetric weight is retained for
  // information/debugging only.
  //
  // Shipping =
  // Actual Weight Charge
  // + Size Charge
  // + Zone Charge
  //
  // =================================================

  const weightCharge =
    getWeightCharge(
      actualWeightGrams
    );

  const sizeCharge =
    getSizeCharge(
      totalVolumeCm3
    );

  const zoneCharge =
    SHIPPING_CONFIG
      .zones[zone] ??
    SHIPPING_CONFIG
      .zones.rest;

  const shippingCharge =
    weightCharge +
    sizeCharge +
    zoneCharge;

  // =================================================
  // NORMAL SHIPPING RESPONSE
  // =================================================

  return {
    success: true,

    isFree: false,

    charge:
      round(
        shippingCharge
      ),

    subtotal:
      safeSubtotal,

    actualWeightGrams:
      round(
        actualWeightGrams
      ),

    volumetricWeightGrams:
      round(
        volumetricWeightGrams
      ),

    // Billable weight available
    // for information/debugging.
    weightGrams:
      round(
        billableWeightGrams
      ),

    billableWeightGrams:
      round(
        billableWeightGrams
      ),

    totalVolumeCm3:
      round(
        totalVolumeCm3
      ),

    zone,

    weightCharge:
      round(
        weightCharge
      ),

    sizeCharge:
      round(
        sizeCharge
      ),

    zoneCharge:
      round(
        zoneCharge
      ),

    isApproximate: true,

    shippingMode:
      "normal",

    message:
      `Approximate shipping charge ₹${round(
        shippingCharge
      )}`,
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  FREE_SHIPPING_THRESHOLD,

  SHIPPING_CONFIG,

  isValidPincode,

  getShippingZone,

  getCategoryProfile,

  getProductWeight,

  getProductDimensions,

  getVolumetricWeightGrams,

  getBillableWeight,

  getProductShippingProfile,

  calculateActualWeight,

  calculateVolumetricWeight,

  calculateTotalWeight,

  calculateTotalVolume,

  getWeightCharge,

  getSizeCharge,

  cartHasWallDecor,

  getWallDecorShippingCharge,

  calculateShipping,
};