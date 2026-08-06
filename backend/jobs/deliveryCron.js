const cron = require("node-cron");
const Order = require("../models/store/orderModel");
const User = require("../models/userModel");
const { createNotification } = require("../services/notificationService");

/**
 * Simple helper function to check orders approaching expected delivery date.
 * An order is considered "Upcoming" if it is active (not Delivered/Cancelled)
 * and its expected delivery date is within the next 3 days or already due.
 */
const checkUpcomingDeliveries = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Fetch active orders with expected delivery date within 3 days
    const upcomingOrders = await Order.find({
      orderStatus: { $nin: ["Delivered", "Cancelled"] },
      expectedDeliveryDate: { $lte: threeDaysFromNow, $ne: null },
    }).populate("user", "name email");

    console.log(
      `[Delivery Cron Job]: Running automated check. Found ${upcomingOrders.length} order(s) approaching delivery date.`
    );

    // Filter urgent orders due within 48 hours to notify admin
    const urgentOrders = upcomingOrders.filter((order) => {
      if (!order.expectedDeliveryDate) return false;
      const hoursRemaining = (new Date(order.expectedDeliveryDate) - now) / (1000 * 60 * 60);
      return hoursRemaining <= 48;
    });

    if (urgentOrders.length > 0) {
      const admins = await User.find({ role: "admin" }).select("_id");
      for (const admin of admins) {
        for (const order of urgentOrders) {
          const shortId = order._id.toString().slice(-6).toUpperCase();
          const deliveryLabel = order.deliveryType?.includes("Fast") ? "Fast" : "Normal";
          const formattedDate = new Date(order.expectedDeliveryDate).toLocaleDateString();

          // Send notification to admin user
          await createNotification({
            userId: admin._id,
            type: "admin_upcoming_delivery",
            title: `Upcoming Delivery Alert (#${shortId})`,
            message: `Order #${shortId} (${deliveryLabel} Delivery) expected by ${formattedDate}. Status: ${order.orderStatus}`,
            relatedType: "Order",
            relatedId: order._id,
          }).catch((err) => {
            // Ignore duplicate/quiet notification errors
          });
        }
      }
    }
  } catch (err) {
    console.error("[Delivery Cron Job Error]:", err.message);
  }
};

/**
 * Initializes and starts the Cron Job when backend server boots up.
 */
const startDeliveryCron = () => {
  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule("*/10 * * * *", () => {
    checkUpcomingDeliveries();
  });

  // Run an immediate check on startup
  checkUpcomingDeliveries();

  console.log("Delivery Cron Job started successfully (runs every 10 minutes).");
};

module.exports = {
  startDeliveryCron,
  checkUpcomingDeliveries,
};
