const express = require("express");

const {
  calculateShippingController,
} = require("../controllers/shippingController");

const router = express.Router();

// Calculate shipping
router.post(
  "/calculate",
  calculateShippingController
);

module.exports = router;