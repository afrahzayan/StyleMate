const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/authMiddleware");
const {
  createCodOrder,
  createStripeSession,
  confirmStripePayment,
  getUserOrders,
  getOrderById,
  deleteOrder,
} = require("../../controllers/store/orderController");

router.post("/cod", protect, createCodOrder);
router.post("/create-stripe-session", protect, createStripeSession);
router.post("/confirm-stripe", protect, confirmStripePayment);
router.get("/", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.delete("/:id", protect, deleteOrder);

module.exports = router;
