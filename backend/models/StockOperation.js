// =====================================================
// VRAJ CREATION - STOCK OPERATION MODEL
// Idempotent Dashboard Stock Operations
// =====================================================

const mongoose = require("mongoose");

// =====================================================
// STOCK ITEM
// =====================================================

const stockItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// STOCK RESULT
// =====================================================

const stockResultSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: "",
      trim: true,
    },

    mongoId: {
      type: String,
      default: "",
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingStock: {
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
// STOCK OPERATION SCHEMA
// =====================================================

const stockOperationSchema =
  new mongoose.Schema(
    {
      // -------------------------------------------------
      // UNIQUE IDEMPOTENCY KEY
      // -------------------------------------------------

      operationId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
      },

      // -------------------------------------------------
      // OPERATION TYPE
      // -------------------------------------------------

      type: {
        type: String,
        enum: [
          "decrease",
          "rollback",
        ],
        required: true,
        index: true,
      },

      // -------------------------------------------------
      // ORIGINAL OPERATION
      // -------------------------------------------------
      //
      // Rollback ke case me original decrease
      // operationId yahan save hoga.
      //

      originalOperationId: {
        type: String,
        default: null,
        index: true,
        trim: true,
      },

      // -------------------------------------------------
      // STATUS
      // -------------------------------------------------

      status: {
        type: String,
        enum: [
          "processing",
          "completed",
          "failed",
        ],
        default: "processing",
        index: true,
      },

      // -------------------------------------------------
      // REQUESTED ITEMS
      // -------------------------------------------------

      items: {
        type: [stockItemSchema],
        required: true,
      },

      // -------------------------------------------------
      // RESULT
      // -------------------------------------------------

      products: {
        type: [stockResultSchema],
        default: [],
      },

      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      errorMessage: {
        type: String,
        default: "",
        trim: true,
      },

      // -------------------------------------------------
      // COMPENSATION FAILURE
      // -------------------------------------------------

      compensationFailed: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

// =====================================================
// INDEXES
// =====================================================

stockOperationSchema.index({
  originalOperationId: 1,
});

stockOperationSchema.index({
  type: 1,
  status: 1,
});

// =====================================================
// EXPORT
// =====================================================

module.exports =
  mongoose.model(
    "StockOperation",
    stockOperationSchema
  );