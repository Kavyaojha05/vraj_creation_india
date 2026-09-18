const Product = require("../models/Product");

// =====================================================
// GET ALL PUBLIC PRODUCTS
// =====================================================

const getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "active",
    })
      .select(
        "_id name sku hsnCode category subcategory image description size sellingPrice stock status"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: products.length,
      products,
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
      status: "active",
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