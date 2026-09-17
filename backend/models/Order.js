const mongoose = require("mongoose");

// =====================================================
// VRAJ CREATION - ORDER MODEL
// =====================================================
// GST EXCLUSIVE / GST ADDED ON TOP
//
// Important:
// - Product HSN is stored as snapshot inside order item
// - HSN is NOT generated from category
// - Stock operation ID is stored for stock-sync tracking
// - Compatible with Mongoose 9
// =====================================================


// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    // -------------------------------------------------
    // PRODUCT ID
    // -------------------------------------------------

    productId: {
      type: String,
      trim: true,
      required: true,
    },

    // -------------------------------------------------
    // SKU
    // -------------------------------------------------

    sku: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // PRODUCT NAME
    // -------------------------------------------------

    name: {
      type: String,
      trim: true,
      required: true,
    },

    // -------------------------------------------------
    // HSN CODE
    // -------------------------------------------------
    // HSN is copied from Product Master at order time.
    //
    // Valid:
    // 4 digits
    // 6 digits
    // 8 digits
    //
    // Blank HSN is allowed for old products.
    //
    // No category-based HSN fallback.
    // -------------------------------------------------

    hsnCode: {
      type: String,
      trim: true,
      default: "",

      validate: {
        validator: function (value) {
          if (!value) {
            return true;
          }

          return /^(?:\d{4}|\d{6}|\d{8})$/.test(
            value
          );
        },

        message:
          "HSN Code must be 4, 6 or 8 digits.",
      },
    },

    // -------------------------------------------------
    // CATEGORY
    // -------------------------------------------------

    category: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // SUBCATEGORY
    // -------------------------------------------------

    subcategory: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // IMAGE
    // -------------------------------------------------

    image: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // SIZE
    // -------------------------------------------------

    size: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // QUANTITY
    // -------------------------------------------------

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // -------------------------------------------------
    // ORIGINAL PRICE
    // -------------------------------------------------

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // -------------------------------------------------
    // DISCOUNT PERCENT
    // -------------------------------------------------

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // -------------------------------------------------
    // DISCOUNT AMOUNT
    // -------------------------------------------------

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // FINAL UNIT PRICE
    // -------------------------------------------------

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // -------------------------------------------------
    // ITEM SUBTOTAL
    // -------------------------------------------------

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// CUSTOMER SCHEMA
// =====================================================

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },

    mobile: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      required: true,
    },

    city: {
      type: String,
      trim: true,
      required: true,
    },

    state: {
      type: String,
      trim: true,
      default: "Rajasthan",
    },

    stateCode: {
      type: String,
      trim: true,
      default: "08",
    },

    pincode: {
      type: String,
      trim: true,
      required: true,
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// PRICING SCHEMA
// =====================================================

const pricingSchema = new mongoose.Schema(
  {
    // -------------------------------------------------
    // PRODUCT SUBTOTAL
    // -------------------------------------------------

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // ELIGIBLE SUBTOTAL
    // -------------------------------------------------

    eligibleSubtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // DISCOUNT PERCENT
    // -------------------------------------------------

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // -------------------------------------------------
    // GENERAL DISCOUNT
    // -------------------------------------------------

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // COUPON DISCOUNT
    // -------------------------------------------------

    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // COUPON CODE
    // -------------------------------------------------

    couponCode: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // SHIPPING
    // -------------------------------------------------

    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // SHIPPING CHARGE
    // -------------------------------------------------

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // TOTAL BEFORE TAX
    // -------------------------------------------------

    totalAmountBeforeTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // TAXABLE VALUE
    // -------------------------------------------------

    taxableValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // GST RATE
    // -------------------------------------------------

    gstRate: {
      type: Number,
      default: 5,
      min: 0,
    },

    // -------------------------------------------------
    // TOTAL GST
    // -------------------------------------------------

    totalGST: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // CGST
    // -------------------------------------------------

    cgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // SGST
    // -------------------------------------------------

    sgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // IGST
    // -------------------------------------------------

    igst: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // CGST RATE
    // -------------------------------------------------

    cgstRate: {
      type: Number,
      default: 2.5,
      min: 0,
    },

    // -------------------------------------------------
    // SGST RATE
    // -------------------------------------------------

    sgstRate: {
      type: Number,
      default: 2.5,
      min: 0,
    },

    // -------------------------------------------------
    // IGST RATE
    // -------------------------------------------------

    igstRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // FINAL TOTAL
    // -------------------------------------------------

    finalTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------------------------------
    // FINAL AMOUNT
    // -------------------------------------------------

    finalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// COUPON SCHEMA
// =====================================================

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    wheelValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      trim: true,
      default: "",
    },

    discountScope: {
      type: String,
      trim: true,
      default: "",
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// SHIPPING SCHEMA
// =====================================================

const shippingSchema = new mongoose.Schema(
  {
    charge: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "Rajasthan",
    },

    stateCode: {
      type: String,
      trim: true,
      default: "08",
    },

    weightGrams: {
      type: Number,
      default: 0,
      min: 0,
    },

    billableWeightGrams: {
      type: Number,
      default: 0,
      min: 0,
    },

    lengthCm: {
      type: Number,
      default: 0,
      min: 0,
    },

    widthCm: {
      type: Number,
      default: 0,
      min: 0,
    },

    heightCm: {
      type: Number,
      default: 0,
      min: 0,
    },

    courier: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// PAYMENT SCHEMA
// =====================================================

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,

      enum: [
        "cod",
        "upi",
      ],

      default: "cod",
    },

    type: {
      type: String,

      enum: [
        "upi_id",
        "qr",
        null,
      ],

      default: null,
    },

    upiId: {
      type: String,
      trim: true,
      default: "",
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      trim: true,
      default: "pending",
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// BUSINESS SCHEMA
// =====================================================

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Vraj Creation",
    },

    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: "08AADPO3512A1ZB",
    },

    state: {
      type: String,
      trim: true,
      default: "Rajasthan",
    },

    stateCode: {
      type: String,
      trim: true,
      default: "08",
    },

    address: {
      type: String,
      trim: true,

      default:
        "Madhuban Colony Basni Jodhpur, Rajasthan, India",
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// GST SNAPSHOT SCHEMA
// =====================================================
// Stores GST values used at order creation.
// Protects old invoices/orders from future GST changes.
// =====================================================

const gstSchema = new mongoose.Schema(
  {
    taxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmountBeforeTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstRate: {
      type: Number,
      default: 5,
      min: 0,
    },

    totalGST: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    igst: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgstRate: {
      type: Number,
      default: 2.5,
      min: 0,
    },

    sgstRate: {
      type: Number,
      default: 2.5,
      min: 0,
    },

    igstRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    isInterState: {
      type: Boolean,
      default: false,
    },

    sellerState: {
      type: String,
      trim: true,
      default: "Rajasthan",
    },

    customerState: {
      type: String,
      trim: true,
      default: "Rajasthan",
    },

    pricingMode: {
      type: String,

      enum: [
        "gst_exclusive",
        "gst_inclusive",
      ],

      default: "gst_exclusive",
    },

    amountWithGST: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    _id: false,
  }
);


// =====================================================
// MAIN ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // =================================================
    // ORDER NUMBER
    // =================================================

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // =================================================
    // ORDER STATUS
    // =================================================

    status: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
      ],

      default: "pending",
      index: true,
    },

    // =================================================
    // CUSTOMER
    // =================================================

    customer: {
      type: customerSchema,
      required: true,
    },

    // =================================================
    // ORDER ITEMS
    // =================================================

    items: {
      type: [
        orderItemSchema,
      ],

      required: true,

      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length > 0
          );
        },

        message:
          "Order must contain at least one item.",
      },
    },

    // =================================================
    // TOTAL ITEMS
    // =================================================

    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // COUPON
    // =================================================

    coupon: {
      type: couponSchema,
      default: null,
    },

    // =================================================
    // SHIPPING
    // =================================================

    shipping: {
      type: shippingSchema,
      default: () => ({}),
    },

    // =================================================
    // PRICING
    // =================================================

    pricing: {
      type: pricingSchema,
      default: () => ({}),
    },

    // =================================================
    // GST SNAPSHOT
    // =================================================

    gst: {
      type: gstSchema,
      default: () => ({}),
    },

    // =================================================
    // PAYMENT
    // =================================================

    payment: {
      type: paymentSchema,
      default: () => ({}),
    },

    // =================================================
    // BUSINESS
    // =================================================

    business: {
      type: businessSchema,
      default: () => ({}),
    },

    // =================================================
    // STOCK OPERATION ID
    // =================================================
    //
    // Used while synchronizing stock with dashboard.
    //
    // IMPORTANT:
    // No index:true here.
    // Index is defined only once below.
    // =================================================

    stockOperationId: {
      type: String,
      trim: true,
      default: "",
    },

    // =================================================
    // INVOICE
    // =================================================

    invoiceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceFileName: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceFilePath: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceGenerated: {
      type: Boolean,
      default: false,
    },

    // =================================================
    // EMAIL STATUS
    // =================================================

    adminEmailSent: {
      type: Boolean,
      default: false,
    },

    customerEmailSent: {
      type: Boolean,
      default: false,
    },

    // =================================================
    // WHATSAPP STATUS
    // =================================================

    whatsappSent: {
      type: Boolean,
      default: false,
    },

    // =================================================
    // NOTES
    // =================================================

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },

  {
    timestamps: true,

    minimize: false,
  }
);


// =====================================================
// INDEXES
// =====================================================

// Customer mobile
orderSchema.index({
  "customer.mobile": 1,
});

// Created date
orderSchema.index({
  createdAt: -1,
});

// Status + created date
orderSchema.index({
  status: 1,
  createdAt: -1,
});

// Payment method + status
orderSchema.index({
  "payment.method": 1,
  status: 1,
});

// Shipping pincode
orderSchema.index({
  "shipping.pincode": 1,
});

// Customer state
orderSchema.index({
  "customer.state": 1,
});

// Stock operation ID
// ONLY ONE INDEX DEFINITION
orderSchema.index({
  stockOperationId: 1,
});


// =====================================================
// PRE-VALIDATION
// =====================================================
// IMPORTANT:
// Mongoose 9 does NOT use next() in pre middleware.
// =====================================================

orderSchema.pre(
  "validate",
  function () {

    // -------------------------------------------------
    // TOTAL ITEMS
    // -------------------------------------------------

    if (Array.isArray(this.items)) {
      this.totalItems =
        this.items.reduce(
          (total, item) => {
            return (
              total +
              Number(
                item.quantity || 0
              )
            );
          },
          0
        );
    }

    // -------------------------------------------------
    // ENSURE GST RATE
    // -------------------------------------------------

    if (
      this.gst &&
      (
        this.gst.gstRate === undefined ||
        this.gst.gstRate === null
      )
    ) {
      this.gst.gstRate = 5;
    }

    // -------------------------------------------------
    // NO next()
    // -------------------------------------------------
    // Mongoose 9 automatically continues after
    // this synchronous middleware completes.
  }
);


// =====================================================
// EXPORT MODEL
// =====================================================

const Order = mongoose.model(
  "Order",
  orderSchema
);

module.exports = Order;