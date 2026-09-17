// =====================================================
// VRAJ CREATION - ORDER CONTROLLER
// FINAL SECURE + IDEMPOTENT VERSION
//
// Flow:
//
// Frontend
//   ↓
// Trusted Product Data
//   ↓
// HSN Code from Product Master
//   ↓
// Coupon Validation
//   ↓
// Shipping Calculation
//   ↓
// GST 5% ON TOP
//   ↓
// Dashboard Stock Decrease (Idempotent)
//   ↓
// Create Order
//   ↓
// Email + GST Invoice
//
// Admin:
//
// GET    /api/orders
// GET    /api/orders/:id
// GET    /api/orders/:id/invoice
// PATCH  /api/orders/:id/status
// =====================================================

const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const CouponClaim = require("../models/CouponClaim");

const {
  getProductForOrder,
} = require("../services/productService");

const {
  calculateShipping,
} = require("../services/shippingService");

const {
  sendOrderEmails,
} = require("../services/emailService");

const {
  generateGSTInvoicePDF,
} = require("../services/gstInvoiceService");

require("dotenv").config();

// =====================================================
// CONFIG
// =====================================================

const DASHBOARD_BACKEND_URL =
  process.env.DASHBOARD_BACKEND_URL ||
  "http://localhost:5000";

const INTERNAL_STOCK_SECRET =
  process.env.INTERNAL_STOCK_SECRET;

const BUSINESS_NAME =
  "Vraj Creation";

const BUSINESS_STATE =
  "Rajasthan";

const BUSINESS_STATE_CODE =
  "08";

const GST_RATE =
  5;

const CGST_RATE =
  2.5;

const SGST_RATE =
  2.5;

const ORDER_TIMEOUT_MS =
  Number(
    process.env.ORDER_REQUEST_TIMEOUT_MS ||
    15000
  );

// =====================================================
// HELPERS
// =====================================================

const round2 = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Number(
    number.toFixed(2)
  );
};

const normalizeText = (value = "") => {
  return String(value ?? "").trim();
};

const normalizeCouponCode = (
  value = ""
) => {
  return String(value ?? "")
    .trim()
    .toUpperCase();
};

const normalizeMobile = (
  value = ""
) => {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(-10);
};

const isValidMobile = (
  value
) => {
  return /^\d{10}$/.test(
    normalizeMobile(value)
  );
};

const isValidPincode = (
  value
) => {
  return /^\d{6}$/.test(
    String(value ?? "").trim()
  );
};

const isValidEmail = (
  value
) => {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value).trim()
  );
};

// =====================================================
// HSN CODE
// =====================================================
//
// IMPORTANT:
//
// HSN is NEVER taken from frontend.
//
// HSN must come from the trusted product source.
//
// Valid HSN:
// 4 digits
// 6 digits
// 8 digits
//
// No category-based HSN fallback is used.
// =====================================================

const getProductHSN = (
  product = {}
) => {
  const rawHSN =
    product.hsnCode ??
    product.hsn ??
    product.HSNCode ??
    product.hsn_code ??
    "";

  const hsn =
    normalizeText(rawHSN);

  if (!hsn) {
    return "";
  }

  if (
    !/^(?:\d{4}|\d{6}|\d{8})$/.test(
      hsn
    )
  ) {
    console.warn(
      "Invalid HSN received from trusted product source:",
      {
        productId:
          product.productId ||
          product._id ||
          product.id ||
          "",

        sku:
          product.sku ||
          "",

        name:
          product.name ||
          "",

        hsnCode:
          hsn,
      }
    );

    return "";
  }

  return hsn;
};

// =====================================================
// STATE HELPERS
// =====================================================

const normalizeState = (
  value = ""
) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
};

const isRajasthanState = (
  state = "",
  stateCode = ""
) => {
  const normalizedState =
    normalizeState(state);

  const normalizedCode =
    String(stateCode ?? "")
      .trim()
      .replace(/^0+/, "");

  return (
    normalizedCode === "8" ||
    normalizedState === "rajasthan" ||
    normalizedState === "raj"
  );
};

// =====================================================
// GST
// GST IS ADDED ON TOP
// =====================================================

const calculateOrderGST = ({
  taxableValue,
  customerState,
  customerStateCode,
}) => {
  const base =
    round2(taxableValue);

  const intraState =
    isRajasthanState(
      customerState,
      customerStateCode
    );

  // ---------------------------------------------------
  // INTRA STATE
  // CGST 2.5% + SGST 2.5%
  // ---------------------------------------------------

  if (intraState) {
    const cgst =
      round2(
        (base * CGST_RATE) / 100
      );

    const sgst =
      round2(
        (base * SGST_RATE) / 100
      );

    const totalGST =
      round2(
        cgst + sgst
      );

    return {
      taxableValue: base,

      gstRate:
        GST_RATE,

      cgst,
      sgst,
      igst: 0,

      cgstRate:
        CGST_RATE,

      sgstRate:
        SGST_RATE,

      igstRate:
        0,

      totalGST,

      isInterState:
        false,

      customerState:
        customerState || "",

      customerStateCode:
        customerStateCode || "",
    };
  }

  // ---------------------------------------------------
  // INTER STATE
  // IGST 5%
  // ---------------------------------------------------

  const igst =
    round2(
      (base * GST_RATE) / 100
    );

  return {
    taxableValue: base,

    gstRate:
      GST_RATE,

    cgst: 0,
    sgst: 0,

    igst,

    cgstRate: 0,
    sgstRate: 0,

    igstRate:
      GST_RATE,

    totalGST:
      igst,

    isInterState:
      true,

    customerState:
      customerState || "",

    customerStateCode:
      customerStateCode || "",
  };
};

// =====================================================
// ORDER NUMBER
// =====================================================

const generateOrderNumber = () => {
  const timestamp =
    Date.now();

  const random =
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

  return `VRAJ-${timestamp}-${random}`;
};

// =====================================================
// PRODUCT ID / SKU
// =====================================================

const getItemProductId = (
  item = {}
) => {
  return (
    item.productId ||
    item._id ||
    item.id ||
    item.product?._id ||
    item.product?.id ||
    item.sku ||
    ""
  );
};

// =====================================================
// QUANTITY
// =====================================================

const getItemQuantity = (
  item = {}
) => {
  const quantity =
    Number(
      item.quantity ??
      item.qty ??
      item.count ??
      1
    );

  return (
    Number.isInteger(quantity) &&
    quantity > 0
  )
    ? quantity
    : 0;
};

// =====================================================
// NORMALIZE ORDER ITEMS
//
// IMPORTANT:
//
// Frontend sends ONLY:
// productId
// quantity
//
// All price/name/stock/category/HSN data
// comes from trusted backend product source.
// =====================================================

const normalizeOrderItems = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized = [];

  for (const item of items) {
    const productId =
      normalizeText(
        getItemProductId(item)
      );

    const quantity =
      getItemQuantity(item);

    if (!productId) {
      continue;
    }

    if (
      !quantity ||
      quantity > 100
    ) {
      continue;
    }

    normalized.push({
      productId,
      quantity,
    });
  }

  return normalized;
};

// =====================================================
// CATEGORY NORMALIZATION
// =====================================================

const normalizeCategory = (
  value = ""
) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
};

const itemMatchesCouponCategory = (
  item,
  couponCategory
) => {
  const itemCategory =
    normalizeCategory(
      item.category
    );

  const targetCategory =
    normalizeCategory(
      couponCategory
    );

  return (
    itemCategory &&
    targetCategory &&
    itemCategory ===
      targetCategory
  );
};

// =====================================================
// COUPON VALIDITY
// =====================================================

const isCouponCurrentlyValid = (
  coupon
) => {
  if (!coupon) {
    return false;
  }

  const now =
    new Date();

  if (!coupon.active) {
    return false;
  }

  if (
    coupon.startDate &&
    now <
      new Date(
        coupon.startDate
      )
  ) {
    return false;
  }

  if (
    coupon.expiryDate &&
    now >
      new Date(
        coupon.expiryDate
      )
  ) {
    return false;
  }

  const maxUses =
    Number(
      coupon.maxUses
    );

  const usedCount =
    Number(
      coupon.usedCount
    );

  if (
    Number.isFinite(maxUses) &&
    maxUses > 0 &&
    usedCount >= maxUses
  ) {
    return false;
  }

  return true;
};

// =====================================================
// SECURE COUPON CALCULATION
// =====================================================

const validateAndCalculateCoupon =
  async ({
    code,
    mobile,
    sellingSubtotal,
    trustedItems,
  }) => {
    const couponCode =
      normalizeCouponCode(code);

    // -------------------------------------------------
    // NO COUPON
    // -------------------------------------------------

    if (!couponCode) {
      return {
        applied: false,

        discount: 0,

        eligibleSubtotal:
          round2(
            sellingSubtotal
          ),

        coupon: null,

        couponDocument: null,

        claim: null,
      };
    }

    // -------------------------------------------------
    // FIND COUPON
    // -------------------------------------------------

    const coupon =
      await Coupon.findOne({
        code: couponCode,
      });

    if (!coupon) {
      throw new Error(
        "Invalid coupon code."
      );
    }

    // -------------------------------------------------
    // VALIDITY
    // -------------------------------------------------

    if (
      !isCouponCurrentlyValid(
        coupon
      )
    ) {
      throw new Error(
        "This coupon is expired, inactive, or has reached its usage limit."
      );
    }

    // -------------------------------------------------
    // MINIMUM ORDER
    // -------------------------------------------------

    const orderAmount =
      round2(
        sellingSubtotal
      );

    const minOrderAmount =
      Number(
        coupon.minOrderAmount ||
        0
      );

    if (
      orderAmount <
      minOrderAmount
    ) {
      throw new Error(
        `Minimum order amount for this coupon is ₹${minOrderAmount}.`
      );
    }

    // -------------------------------------------------
    // SPIN & WIN CLAIM
    // -------------------------------------------------

    let claim = null;

    if (
      coupon.source ===
      "Spin & Win"
    ) {
      const normalizedMobile =
        normalizeMobile(mobile);

      if (
        !isValidMobile(
          normalizedMobile
        )
      ) {
        throw new Error(
          "Valid mobile number is required for Spin & Win coupon."
        );
      }

      claim =
        await CouponClaim.findOne({
          mobile:
            normalizedMobile,

          coupon:
            coupon._id,

          couponCode:
            coupon.code,

          status:
            "claimed",
        });

      if (!claim) {
        throw new Error(
          "This Spin & Win coupon is not available for this mobile number."
        );
      }

      if (
        Number(
          claim.discount
        ) !==
        Number(
          coupon.discount
        )
      ) {
        throw new Error(
          "Coupon validation failed."
        );
      }
    }

    // -------------------------------------------------
    // ELIGIBLE SUBTOTAL
    // -------------------------------------------------

    let eligibleSubtotal =
      orderAmount;

    if (
      coupon.discountScope ===
      "category"
    ) {
      eligibleSubtotal =
        round2(
          trustedItems
            .filter(
              (item) =>
                itemMatchesCouponCategory(
                  item,
                  coupon.category
                )
            )
            .reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item.price || 0
                ) *
                  Number(
                    item.quantity ||
                      0
                  ),
              0
            )
        );

      if (
        eligibleSubtotal <= 0
      ) {
        throw new Error(
          "This coupon is not applicable to the selected products."
        );
      }
    }

    // -------------------------------------------------
    // DISCOUNT
    // -------------------------------------------------

    const discountPercent =
      Number(
        coupon.discount || 0
      );

    let discount =
      round2(
        (eligibleSubtotal *
          discountPercent) /
          100
      );

    const maxDiscount =
      Number(
        coupon.maxDiscount
      );

    if (
      Number.isFinite(
        maxDiscount
      ) &&
      maxDiscount > 0
    ) {
      discount =
        Math.min(
          discount,
          maxDiscount
        );
    }

    discount =
      Math.min(
        discount,
        eligibleSubtotal
      );

    return {
      applied: true,

      discount:
        round2(
          discount
        ),

      eligibleSubtotal:
        round2(
          eligibleSubtotal
        ),

      coupon: {
        code:
          coupon.code,

        name:
          coupon.name,

        discount:
          discountPercent,

        discountScope:
          coupon.discountScope,

        category:
          coupon.category ||
          null,

        minOrderAmount:
          Number(
            coupon.minOrderAmount ||
            0
          ),

        maxDiscount:
          Number.isFinite(
            maxDiscount
          )
            ? maxDiscount
            : null,

        source:
          coupon.source,

        wheelValue:
          coupon.wheelValue ||
          null,
      },

      couponDocument:
        coupon,

      claim,
    };
  };

// =====================================================
// MARK COUPON CLAIM USED
// =====================================================

const markCouponClaimUsed =
  async (claim) => {
    if (!claim) {
      return null;
    }

    const updated =
      await CouponClaim.findOneAndUpdate(
        {
          _id:
            claim._id,

          status:
            "claimed",
        },

        {
          $set: {
            status:
              "used",

            usedAt:
              new Date(),
          },
        },

        {
          new: true,
        }
      );

    if (!updated) {
      throw new Error(
        "Coupon has already been used."
      );
    }

    return updated;
  };

// =====================================================
// RESTORE COUPON CLAIM
// =====================================================

const restoreCouponClaim =
  async (claimId) => {
    if (!claimId) {
      return;
    }

    try {
      await CouponClaim.findOneAndUpdate(
        {
          _id:
            claimId,

          status:
            "used",
        },

        {
          $set: {
            status:
              "claimed",
          },

          $unset: {
            usedAt: 1,
          },
        }
      );
    } catch (error) {
      console.error(
        "Coupon claim restore failed:",
        error.message
      );
    }
  };

// =====================================================
// DASHBOARD STOCK DECREASE
//
// Backend generates operationId.
// Frontend never controls it.
// =====================================================

const syncDashboardStock =
  async (items) => {
    if (
      !INTERNAL_STOCK_SECRET
    ) {
      throw new Error(
        "INTERNAL_STOCK_SECRET is not configured."
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error(
        "Stock operation requires at least one item."
      );
    }

    const operationId =
      crypto.randomUUID();

    try {
      const response =
        await axios.post(
          `${DASHBOARD_BACKEND_URL}/api/internal/stock/decrease`,

          {
            operationId,

            items,
          },

          {
            headers: {
              "Content-Type":
                "application/json",

              "x-internal-secret":
                INTERNAL_STOCK_SECRET,
            },

            timeout:
              ORDER_TIMEOUT_MS,
          }
        );

      if (
        !response.data ||
        response.data.success ===
          false
      ) {
        throw new Error(
          response.data?.message ||
          "Dashboard stock decrease failed."
        );
      }

      return {
        success: true,

        operationId,

        alreadyProcessed:
          Boolean(
            response.data
              .alreadyProcessed
          ),

        data:
          response.data,
      };
    } catch (error) {
      // -----------------------------------------------
      // DASHBOARD RESPONSE ERROR
      // -----------------------------------------------

      if (
        error.response
      ) {
        const message =
          error.response
            .data?.message ||
          error.response
            .data?.error ||
          "Dashboard stock service rejected the request.";

        const stockError =
          new Error(
            message
          );

        stockError.status =
          error.response.status;

        stockError.dashboardResponse =
          error.response.data;

        throw stockError;
      }

      // -----------------------------------------------
      // TIMEOUT
      // -----------------------------------------------

      if (
        error.code ===
        "ECONNABORTED"
      ) {
        throw new Error(
          "Dashboard stock service request timed out."
        );
      }

      // -----------------------------------------------
      // CONNECTION
      // -----------------------------------------------

      if (
        error.code ===
          "ECONNREFUSED" ||
        error.code ===
          "ENOTFOUND"
      ) {
        throw new Error(
          "Dashboard stock service is unavailable. Please make sure Dashboard Backend is running on port 5000."
        );
      }

      throw error;
    }
  };

// =====================================================
// DASHBOARD STOCK ROLLBACK
// =====================================================

const rollbackDashboardStock =
  async (
    operationId
  ) => {
    if (!operationId) {
      return {
        success: false,

        skipped: true,
      };
    }

    if (
      !INTERNAL_STOCK_SECRET
    ) {
      console.error(
        "Cannot rollback stock: INTERNAL_STOCK_SECRET missing."
      );

      return {
        success: false,

        skipped: false,
      };
    }

    try {
      const response =
        await axios.post(
          `${DASHBOARD_BACKEND_URL}/api/internal/stock/increase`,

          {
            operationId,
          },

          {
            headers: {
              "Content-Type":
                "application/json",

              "x-internal-secret":
                INTERNAL_STOCK_SECRET,
            },

            timeout:
              ORDER_TIMEOUT_MS,
          }
        );

      if (
        !response.data ||
        response.data.success ===
          false
      ) {
        throw new Error(
          response.data?.message ||
          "Dashboard stock rollback failed."
        );
      }

      return {
        success: true,

        alreadyProcessed:
          Boolean(
            response.data
              .alreadyProcessed
          ),

        data:
          response.data,
      };
    } catch (error) {
      console.error(
        "STOCK ROLLBACK ERROR:",
        error.message
      );

      return {
        success: false,

        error:
          error.message,
      };
    }
  };

// =====================================================
// CREATE ORDER
// =====================================================

const createOrder =
  async (
    req,
    res
  ) => {
    let stockOperationId =
      null;

    let stockDecreased =
      false;

    let couponClaimId =
      null;

    let couponClaimUsed =
      false;

    try {
      const body =
        req.body || {};

      const {
        customer = {},
        items = [],
        couponCode,
        payment = {},
      } = body;

      // =================================================
      // CUSTOMER
      // =================================================

      const fullName =
        normalizeText(
          customer.fullName
        );

      const mobile =
        normalizeMobile(
          customer.mobile
        );

      const email =
        normalizeText(
          customer.email
        ).toLowerCase();

      const address =
        normalizeText(
          customer.address
        );

      const city =
        normalizeText(
          customer.city
        );

      const state =
        normalizeText(
          customer.state
        );

      const stateCode =
        normalizeText(
          customer.stateCode
        );

      const pincode =
        normalizeText(
          customer.pincode
        );

      if (!fullName) {
        return res.status(400).json({
          success: false,

          message:
            "Full name is required.",
        });
      }

      if (
        !isValidMobile(mobile)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Valid 10-digit mobile number is required.",
        });
      }

      if (
        email &&
        !isValidEmail(email)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid email address.",
        });
      }

      if (!address) {
        return res.status(400).json({
          success: false,

          message:
            "Address is required.",
        });
      }

      if (!city) {
        return res.status(400).json({
          success: false,

          message:
            "City is required.",
        });
      }

      if (!state) {
        return res.status(400).json({
          success: false,

          message:
            "State is required.",
        });
      }

      if (
        !isValidPincode(
          pincode
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Valid 6-digit pincode is required.",
        });
      }

      // =================================================
      // ITEMS
      // =================================================

      const requestedItems =
        normalizeOrderItems(
          items
        );

      if (
        requestedItems.length === 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "At least one valid product is required.",
        });
      }

      // =================================================
      // TRUSTED PRODUCT DATA
      // =================================================

      const trustedItems = [];

      for (
        const requestedItem
        of requestedItems
      ) {
        let product;

        try {
          product =
            await getProductForOrder({
              productId:
                requestedItem.productId,
            });
        } catch (error) {
          console.error(
            "PRODUCT VERIFICATION ERROR:",
            {
              requestedItem,

              message:
                error.message,

              stack:
                error.stack,
            }
          );

          throw new Error(
            `Unable to verify product ${requestedItem.productId}.`
          );
        }

        if (!product) {
          throw new Error(
            `Product ${requestedItem.productId} was not found.`
          );
        }

        // -------------------------------------------------
        // TRUSTED PRODUCT DATA
        // -------------------------------------------------

        const productId =
          String(
            product.productId ||
            product._id ||
            product.id ||
            requestedItem.productId
          );

        const sku =
          normalizeText(
            product.sku ||
            product.SKU ||
            ""
          );

        const productName =
          normalizeText(
            product.name ||
            product.productName ||
            product.title ||
            "Handcrafted Product"
          );

        // -------------------------------------------------
        // HSN CODE
        //
        // IMPORTANT:
        // HSN comes ONLY from trusted product data.
        // Frontend cannot override it.
        // -------------------------------------------------

        const hsnCode =
          getProductHSN(
            product
          );

        const category =
          normalizeText(
            product.category ||
            ""
          );

        const subcategory =
          normalizeText(
            product.subcategory ||
            product.subCategory ||
            ""
          );

        const description =
          normalizeText(
            product.description ||
            ""
          );

        const image =
          product.image ||
          product.productImage ||
          "";

        const size =
          normalizeText(
            product.size ||
            ""
          );

        const sellingPrice =
          Number(
            product.sellingPrice ??
            product.price ??
            0
          );

        const originalPrice =
          Number(
            product.originalPrice ??
            product.mrp ??
            sellingPrice
          );

        const stock =
          Number(
            product.stock ??
            0
          );

        const quantity =
          requestedItem.quantity;

        // -------------------------------------------------
        // PRICE
        // -------------------------------------------------

        if (
          !Number.isFinite(
            sellingPrice
          ) ||
          sellingPrice < 0
        ) {
          throw new Error(
            `Invalid price for ${productName}.`
          );
        }

        // -------------------------------------------------
        // STOCK
        // -------------------------------------------------

        if (
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          throw new Error(
            `Invalid stock information for ${productName}.`
          );
        }

        if (
          stock < quantity
        ) {
          throw new Error(
            `${productName} has only ${stock} item(s) available.`
          );
        }

        // -------------------------------------------------
        // TRUSTED ITEM
        // -------------------------------------------------

        trustedItems.push({
          productId,

          sku,

          name:
            productName,

          hsnCode,

          category,

          subcategory,

          image,

          description,

          size,

          quantity,

          originalPrice:
            round2(
              originalPrice
            ),

          discountPercent:
            Number(
              product.discountPercent ||
              product.discount ||
              0
            ),

          price:
            round2(
              sellingPrice
            ),

          subtotal:
            round2(
              sellingPrice *
                quantity
            ),

          stock,
        });
      }

      // =================================================
      // DEBUG HSN
      // =================================================

      console.log(
        "ORDER HSN SNAPSHOT:",
        trustedItems.map(
          (item) => ({
            productId:
              item.productId,

            sku:
              item.sku,

            name:
              item.name,

            hsnCode:
              item.hsnCode,
          })
        )
      );

      // =================================================
      // SELLING SUBTOTAL
      // =================================================

      const sellingSubtotal =
        round2(
          trustedItems.reduce(
            (
              sum,
              item
            ) =>
              sum +
              Number(
                item.price || 0
              ) *
                Number(
                  item.quantity || 0
                ),
            0
          )
        );

      if (
        sellingSubtotal <= 0
      ) {
        throw new Error(
          "Order amount must be greater than zero."
        );
      }

      // =================================================
      // COUPON
      // =================================================

      let couponResult = {
        applied: false,

        discount: 0,

        eligibleSubtotal:
          sellingSubtotal,

        coupon: null,

        couponDocument:
          null,

        claim:
          null,
      };

      if (
        couponCode &&
        normalizeCouponCode(
          couponCode
        )
      ) {
        couponResult =
          await validateAndCalculateCoupon({
            code:
              couponCode,

            mobile,

            sellingSubtotal,

            trustedItems,
          });
      }

      const couponDiscount =
        round2(
          couponResult.discount
        );

      const productAfterDiscount =
        round2(
          Math.max(
            0,

            sellingSubtotal -
              couponDiscount
          )
        );

      // =================================================
      // SHIPPING
      // =================================================

      const shippingItems =
        trustedItems.map(
          (item) => ({
            productId:
              item.productId,

            sku:
              item.sku,

            name:
              item.name,

            category:
              item.category,

            subcategory:
              item.subcategory,

            quantity:
              item.quantity,

            price:
              item.price,

            weightGrams:
              Number(
                item.weightGrams ||
                500
              ),

            weight:
              Number(
                item.weightGrams ||
                item.weight ||
                500
              ),

            dimensions:
              item.dimensions ||
              undefined,
          })
        );

      const shipping =
        await calculateShipping({
          pincode,

          subtotal:
            sellingSubtotal,

          items:
            shippingItems,
        });

      if (
        !shipping ||
        shipping.success ===
          false
      ) {
        throw new Error(
          shipping?.message ||
          "Unable to calculate shipping."
        );
      }

      const shippingCharge =
        round2(
          shipping.charge || 0
        );

      // =================================================
      // GST
      //
      // TAXABLE VALUE =
      // PRODUCT AFTER DISCOUNT + SHIPPING
      // =================================================

      const taxableValue =
        round2(
          productAfterDiscount +
            shippingCharge
        );

      const gst =
        calculateOrderGST({
          taxableValue,

          customerState:
            state,

          customerStateCode:
            stateCode,
        });

      const totalAmountBeforeTax =
        taxableValue;

      const finalTotal =
        round2(
          totalAmountBeforeTax +
            gst.totalGST
        );

      if (
        finalTotal <= 0
      ) {
        throw new Error(
          "Final order amount must be greater than zero."
        );
      }

      // =================================================
      // PAYMENT
      // =================================================

      const requestedPaymentMethod =
        normalizeText(
          payment.method
        ).toLowerCase();

      const requestedPaymentType =
        normalizeText(
          payment.type
        ).toLowerCase();

      let paymentMethod =
        requestedPaymentMethod;

      // -------------------------------------------------
      // FRONTEND "PREPAID" -> DATABASE "UPI"
      // -------------------------------------------------

      if (
        paymentMethod ===
        "prepaid"
      ) {
        paymentMethod =
          "upi";
      }

      if (
        ![
          "cod",
          "upi",
        ].includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment method must be COD or prepaid UPI.",
        });
      }

      let paymentType =
        null;

      let upiId =
        "";

      if (
        paymentMethod ===
        "upi"
      ) {
        if (
          ![
            "upi_id",
            "qr",
          ].includes(
            requestedPaymentType
          )
        ) {
          return res.status(400).json({
            success: false,

            message:
              "For prepaid payment, select UPI ID or QR.",
          });
        }

        paymentType =
          requestedPaymentType;

        upiId =
          normalizeText(
            payment.upiId
          );

        if (
          paymentType ===
            "upi_id" &&
          !upiId
        ) {
          return res.status(400).json({
            success: false,

            message:
              "UPI ID is required.",
          });
        }
      }

      // =================================================
      // MARK SPIN CLAIM USED
      // =================================================

      if (
        couponResult.claim
      ) {
        await markCouponClaimUsed(
          couponResult.claim
        );

        couponClaimId =
          couponResult.claim._id;

        couponClaimUsed =
          true;
      }

      // =================================================
      // STOCK DECREASE
      // =================================================

      const stockItems =
        trustedItems.map(
          (item) => ({
            productId:
              item.productId,

            quantity:
              item.quantity,
          })
        );

      let stockResult;

      try {
        stockResult =
          await syncDashboardStock(
            stockItems
          );

        stockOperationId =
          stockResult.operationId;

        stockDecreased =
          true;
      } catch (stockError) {
        // -----------------------------------------------
        // RESTORE COUPON IF STOCK FAILED
        // -----------------------------------------------

        if (
          couponClaimUsed
        ) {
          await restoreCouponClaim(
            couponClaimId
          );

          couponClaimUsed =
            false;
        }

        throw stockError;
      }

      // =================================================
      // ORDER NUMBER
      // =================================================

      const orderNumber =
        generateOrderNumber();

      // =================================================
      // ORDER ITEMS
      //
      // HSN IS STORED HERE AS SNAPSHOT.
      //
      // This protects the invoice from future product
      // master changes.
      // =================================================

      const orderItems =
        trustedItems.map(
          (item) => ({
            productId:
              item.productId,

            sku:
              item.sku,

            name:
              item.name,

            // -------------------------------------------
            // HSN CODE
            // -------------------------------------------

            hsnCode:
              item.hsnCode,

            category:
              item.category,

            subcategory:
              item.subcategory,

            image:
              item.image,

            description:
              item.description,

            size:
              item.size,

            quantity:
              item.quantity,

            originalPrice:
              item.originalPrice,

            discountPercent:
              item.discountPercent,

            discountAmount:
              round2(
                (
                  item.originalPrice -
                  item.price
                ) *
                  item.quantity
              ),

            price:
              item.price,

            subtotal:
              item.subtotal,
          })
        );

      // =================================================
      // ORDER DATA
      // =================================================

      const orderData = {
        orderNumber,

        status:
          "pending",

        customer: {
          fullName,

          mobile,

          email,

          address,

          city,

          state,

          stateCode,

          pincode,
        },

        items:
          orderItems,

        totalItems:
          orderItems.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.quantity || 0
              ),
            0
          ),

        coupon:
          couponResult.applied
            ? {
                code:
                  couponResult
                    .coupon
                    .code,

                discount:
                  Number(
                    couponResult
                      .coupon
                      .discount ||
                      0
                  ),

                discountScope:
                  couponResult
                    .coupon
                    .discountScope,

                category:
                  couponResult
                    .coupon
                    .category ||
                  null,

                minOrderAmount:
                  Number(
                    couponResult
                      .coupon
                      .minOrderAmount ||
                      0
                  ),

                maxDiscount:
                  couponResult
                    .coupon
                    .maxDiscount,

                eligibleSubtotal:
                  couponResult
                    .eligibleSubtotal,

                discountAmount:
                  couponDiscount,

                source:
                  couponResult
                    .coupon
                    .source,
              }
            : null,

        shipping: {
          pincode,

          city,

          state,

          stateCode,

          zone:
            shipping.zone ||
            null,

          weightGrams:
            Number(
              shipping.weightGrams ||
              0
            ),

          billableWeightGrams:
            Number(
              shipping.billableWeightGrams ||
              0
            ),

          charge:
            shippingCharge,

          isFree:
            Boolean(
              shipping.isFree
            ),
        },

        pricing: {
          subtotal:
            sellingSubtotal,

          eligibleSubtotal:
            couponResult
              .eligibleSubtotal,

          discountPercent:
            couponResult.applied
              ? Number(
                  couponResult
                    .coupon
                    .discount ||
                    0
                )
              : 0,

          discount:
            couponDiscount,

          couponDiscount,

          couponCode:
            couponResult.applied
              ? couponResult
                  .coupon
                  .code
              : "",

          shipping:
            shippingCharge,

          shippingCharge,

          totalAmountBeforeTax,

          taxableValue,

          gstRate:
            GST_RATE,

          totalGST:
            gst.totalGST,

          cgst:
            gst.cgst,

          sgst:
            gst.sgst,

          igst:
            gst.igst,

          cgstRate:
            gst.cgstRate,

          sgstRate:
            gst.sgstRate,

          igstRate:
            gst.igstRate,

          finalTotal,

          finalAmount:
            finalTotal,
        },

        payment: {
          method:
            paymentMethod,

          type:
            paymentType,

          upiId,

          amount:
            finalTotal,

          status:
            "pending",
        },

        business: {
          name:
            BUSINESS_NAME,

          whatsapp:
            "918824968974",
        },

        // IMPORTANT:
        // Used for idempotent stock tracking.
        stockOperationId,

        customerNote:
          normalizeText(
            body.customerNote
          ),

        adminNote:
          "",
      };

      // =================================================
      // CREATE ORDER
      // =================================================

      let createdOrder;

      try {
        createdOrder =
          await Order.create(
            orderData
          );
      } catch (orderError) {
        // -----------------------------------------------
        // ORDER FAILED -> ROLLBACK STOCK
        // -----------------------------------------------

        if (
          stockDecreased &&
          stockOperationId
        ) {
          const rollback =
            await rollbackDashboardStock(
              stockOperationId
            );

          if (
            !rollback.success
          ) {
            console.error(
              "CRITICAL: Stock rollback failed after Order.create failure.",

              {
                stockOperationId,

                error:
                  rollback.error,
              }
            );
          }

          stockDecreased =
            false;
        }

        // -----------------------------------------------
        // RESTORE COUPON
        // -----------------------------------------------

        if (
          couponClaimUsed
        ) {
          await restoreCouponClaim(
            couponClaimId
          );

          couponClaimUsed =
            false;
        }

        throw orderError;
      }

      // =================================================
      // EMAIL + PDF
      //
      // Email failure must NOT cancel order.
      // =================================================

      let emailResult =
        null;

      try {
        emailResult =
          await sendOrderEmails(
            createdOrder
          );

        if (
          emailResult?.customer
            ?.success
        ) {
          createdOrder.customerEmailSent =
            true;
        }

        if (
          emailResult?.admin
            ?.success
        ) {
          createdOrder.adminEmailSent =
            true;
        }

        await createdOrder.save();
      } catch (
        emailError
      ) {
        console.error(
          "ORDER EMAIL / INVOICE ERROR:",
          emailError.message
        );
      }

      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      return res.status(201).json({
        success: true,

        message:
          "Order placed successfully.",

        order:
          createdOrder,

        orderNumber:
          createdOrder.orderNumber,

        finalAmount:
          createdOrder
            .pricing
            ?.finalAmount ??
          finalTotal,

        payment:
          createdOrder.payment,

        stockOperationId:
          createdOrder
            .stockOperationId,

        email:
          emailResult,
      });
    } catch (error) {
      // =================================================
      // LOG
      // =================================================

      console.error(
        "\n========================================"
      );

      console.error(
        "CREATE ORDER ERROR"
      );

      console.error(
        "Message:",
        error.message
      );

      if (
        error.stack
      ) {
        console.error(
          error.stack
        );
      }

      console.error(
        "========================================\n"
      );

      // =================================================
      // FINAL SAFETY STOCK ROLLBACK
      //
      // Rollback endpoint is idempotent.
      // =================================================

      if (
        stockDecreased &&
        stockOperationId
      ) {
        const rollback =
          await rollbackDashboardStock(
            stockOperationId
          );

        if (
          rollback.success
        ) {
          stockDecreased =
            false;
        } else {
          console.error(
            "CRITICAL STOCK ROLLBACK FAILURE:",

            {
              operationId:
                stockOperationId,

              error:
                rollback.error,
            }
          );
        }
      }

      // =================================================
      // FINAL COUPON RESTORE
      // =================================================

      if (
        couponClaimUsed
      ) {
        await restoreCouponClaim(
          couponClaimId
        );

        couponClaimUsed =
          false;
      }

      // =================================================
      // ERROR STATUS
      // =================================================

      const status =
        error.status ||
        400;

      let message =
        error.message ||
        "Unable to place order.";

      // -------------------------------------------------
      // MONGOOSE VALIDATION ERROR
      // -------------------------------------------------

      if (
        error instanceof
        mongoose.Error
          .ValidationError
      ) {
        message =
          Object.values(
            error.errors ||
              {}
          )
            .map(
              (item) =>
                item.message
            )
            .join(", ") ||
          "Order validation failed.";
      }

      return res
        .status(
          status >= 400 &&
          status < 600
            ? status
            : 500
        )
        .json({
          success: false,

          message,

          error:
            process.env.NODE_ENV ===
            "production"
              ? undefined
              : error.message,
        });
    }
  };

// =====================================================
// ADMIN — GET ALL ORDERS
// =====================================================

const getAllOrders =
  async (
    req,
    res
  ) => {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        search,
      } = req.query;

      const pageNumber =
        Math.max(
          1,
          Number(page) || 1
        );

      const limitNumber =
        Math.min(
          100,

          Math.max(
            1,
            Number(limit) || 50
          )
        );

      const skip =
        (pageNumber - 1) *
        limitNumber;

      const filter = {};

      // -------------------------------------------------
      // STATUS
      // -------------------------------------------------

      if (
        status &&
        [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].includes(
          String(status)
            .trim()
            .toLowerCase()
        )
      ) {
        filter.status =
          String(status)
            .trim()
            .toLowerCase();
      }

      // -------------------------------------------------
      // SEARCH
      // -------------------------------------------------

      if (
        search &&
        String(search).trim()
      ) {
        const safeSearch =
          String(search)
            .trim()
            .slice(0, 100);

        filter.$or = [
          {
            orderNumber: {
              $regex:
                safeSearch,

              $options:
                "i",
            },
          },

          {
            "customer.fullName": {
              $regex:
                safeSearch,

              $options:
                "i",
            },
          },

          {
            "customer.mobile": {
              $regex:
                safeSearch,

              $options:
                "i",
            },
          },

          {
            "customer.email": {
              $regex:
                safeSearch,

              $options:
                "i",
            },
          },

          {
            "customer.pincode": {
              $regex:
                safeSearch,

              $options:
                "i",
            },
          },
        ];
      }

      const [
        orders,
        total,
      ] =
        await Promise.all([
          Order.find(
            filter
          )
            .sort({
              createdAt:
                -1,
            })
            .skip(skip)
            .limit(
              limitNumber
            )
            .lean(),

          Order.countDocuments(
            filter
          ),
        ]);

      return res.json({
        success: true,

        orders,

        data:
          orders,

        pagination: {
          page:
            pageNumber,

          limit:
            limitNumber,

          total,

          pages:
            Math.ceil(
              total /
                limitNumber
            ),
        },
      });
    } catch (error) {
      console.error(
        "GET ALL ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch orders.",
      });
    }
  };

// =====================================================
// ADMIN — GET SINGLE ORDER
// =====================================================

const getOrderById =
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        return res.status(400).json({
          success: false,

          message:
            "Order ID is required.",
        });
      }

      let order =
        null;

      // -------------------------------------------------
      // MONGO ID
      // -------------------------------------------------

      if (
        mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        order =
          await Order.findById(
            id
          ).lean();
      }

      // -------------------------------------------------
      // ORDER NUMBER
      // -------------------------------------------------

      if (!order) {
        order =
          await Order.findOne({
            orderNumber:
              id.toUpperCase(),
          }).lean();
      }

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      return res.json({
        success: true,

        order,

        data:
          order,
      });
    } catch (error) {
      console.error(
        "GET ORDER BY ID ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch order.",
      });
    }
  };

// =====================================================
// ADMIN — UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus =
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      const requestedStatus =
        String(
          req.body?.status ||
            ""
        )
          .trim()
          .toLowerCase();

      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!id) {
        return res.status(400).json({
          success: false,

          message:
            "Order ID is required.",
        });
      }

      if (
        !allowedStatuses.includes(
          requestedStatus
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order status.",
        });
      }

      let order =
        null;

      if (
        mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        order =
          await Order.findById(
            id
          );
      }

      if (!order) {
        order =
          await Order.findOne({
            orderNumber:
              id.toUpperCase(),
          });
      }

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      const previousStatus =
        order.status;

      order.status =
        requestedStatus;

      // -------------------------------------------------
      // ADMIN NOTE
      // -------------------------------------------------

      if (
        req.body?.adminNote !==
        undefined
      ) {
        order.adminNote =
          normalizeText(
            req.body.adminNote
          );
      }

      await order.save();

      return res.json({
        success: true,

        message:
          "Order status updated successfully.",

        previousStatus,

        status:
          order.status,

        order,
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update order status.",
      });
    }
  };

// =====================================================
// ADMIN — GST INVOICE PDF
// =====================================================

const getInvoicePDF =
  async (
    req,
    res
  ) => {
    try {
      const id =
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        return res.status(400).json({
          success: false,

          message:
            "Order ID is required.",
        });
      }

      let order =
        null;

      // -------------------------------------------------
      // MONGO ID
      // -------------------------------------------------

      if (
        mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        order =
          await Order.findById(
            id
          ).lean();
      }

      // -------------------------------------------------
      // ORDER NUMBER
      // -------------------------------------------------

      if (!order) {
        order =
          await Order.findOne({
            orderNumber:
              id.toUpperCase(),
          }).lean();
      }

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      // -------------------------------------------------
      // DEBUG HSN
      // -------------------------------------------------

      console.log(
        "INVOICE ORDER HSN:",
        {
          orderNumber:
            order.orderNumber,

          items:
            (order.items || []).map(
              (item) => ({
                name:
                  item.name,

                sku:
                  item.sku,

                hsnCode:
                  item.hsnCode ||
                  "",
              })
            ),
        }
      );

      // -------------------------------------------------
      // GENERATE PDF
      // -------------------------------------------------

      const tempFilePath =
        await generateGSTInvoicePDF(
          order
        );

      if (!tempFilePath) {
        throw new Error(
          "Invoice PDF could not be generated."
        );
      }

      // -------------------------------------------------
      // SEND PDF
      // -------------------------------------------------

      return res.download(
        tempFilePath,

        `${
          order.orderNumber ||
          "Vraj-Invoice"
        }.pdf`,

        (downloadError) => {
          if (
            downloadError
          ) {
            console.error(
              "Invoice download error:",
              downloadError
            );
          }
        }
      );
    } catch (error) {
      console.error(
        "GET INVOICE PDF ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to generate invoice PDF.",

        error:
          process.env.NODE_ENV ===
          "production"
            ? undefined
            : error.message,
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createOrder,

  getOrderById,

  getAllOrders,

  updateOrderStatus,

  getInvoicePDF,
};