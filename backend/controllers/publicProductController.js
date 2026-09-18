const mongoose = require("mongoose");
const Product = require("../models/Product");

// =====================================================
// GET ALL PUBLIC PRODUCTS
// =====================================================

const getPublicProducts = async (req, res) => {
  try {
    console.log("=================================");
    console.log("DB NAME:", mongoose.connection.name);
    console.log("DB HOST:", mongoose.connection.host);
    console.log("PRODUCT COLLECTION:", Product.collection.name);

    const totalProducts = await Product.countDocuments();

    console.log("TOTAL PRODUCTS:", totalProducts);

    const products = await Product.find()
      .select(
        "_id name sku hsnCode category subcategory image description size sellingPrice stock status"
      )
      .sort({
        createdAt: -1,
      });

    console.log("PRODUCTS FOUND:", products.length);

    res.json({
      success: true,
      count: products.length,
      products,
      debug: {
        database: mongoose.connection.name,
        collection: Product.collection.name,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("GET PUBLIC PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE PUBLIC PRODUCT
// =====================================================

const getPublicProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
    }).select(
      "_id name sku hsnCode category subcategory image description size sellingPrice stock status"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET PUBLIC PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getPublicProducts,
  getPublicProduct,
};