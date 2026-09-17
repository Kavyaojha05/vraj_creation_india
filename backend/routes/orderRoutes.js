const express = require("express");

const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getInvoicePDF,
} = require("../controllers/orderController");

const adminAuth =
  require("../middleware/adminAuth");

const router =
  express.Router();

router.post(
  "/",
  createOrder
);

router.get(
  "/",
  adminAuth,
  getAllOrders
);

router.get(
  "/:id/invoice",
  adminAuth,
  getInvoicePDF
);

router.get(
  "/:id",
  adminAuth,
  getOrderById
);

router.patch(
  "/:id/status",
  adminAuth,
  updateOrderStatus
);

module.exports = router;