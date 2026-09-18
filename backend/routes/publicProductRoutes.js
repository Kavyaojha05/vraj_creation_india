const express = require("express");

const {
  getPublicProducts,
  getPublicProduct,
} = require("../controllers/publicProductController");

const router = express.Router();

// GET ALL PUBLIC PRODUCTS
router.get("/", getPublicProducts);

// GET SINGLE PUBLIC PRODUCT
router.get("/:id", getPublicProduct);

module.exports = router;