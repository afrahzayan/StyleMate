const Order = require("../../models/store/orderModel");
const {
  getAdminDashboardSummary,
  getUsersList,
  setUserStatus,
  deleteUserById,
  getClothesList,
  getClothFilterOptions,
  getClothDetail,
  deleteClothById,
  getReportsList,
  getReportStats,
  getModerationActivity,
  getReportDetail,
  resolveReport,
  rejectReport,
  deleteReportedContent,
} = require("../../services/adminService");

const getDashboardSummary = async (req, res) => {
  try {
    const summary = await getAdminDashboardSummary();
    return res.status(200).json({ dashboard: summary });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading the dashboard" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getUsersList({ page, limit, search });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading users" });
  }
};

const blockUser = async (req, res) => {
  try {
    const result = await setUserStatus(req.params.id, "blocked");
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "User blocked", user: result.user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const result = await setUserStatus(req.params.id, "active");
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "User unblocked", user: result.user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserById(req.params.id);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── cloth management ─────────────────────────────────────────────
const getClothes = async (req, res) => {
  try {
    const { page, limit, search, category, occasion, season, status } = req.query;
    const result = await getClothesList({ page, limit, search, category, occasion, season, status });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading clothes" });
  }
};

const getClothFilters = async (req, res) => {
  try {
    const options = await getClothFilterOptions();
    return res.status(200).json(options);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading filters" });
  }
};

const getClothDetails = async (req, res) => {
  try {
    const cloth = await getClothDetail(req.params.id);
    if (!cloth) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json({ cloth });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteCloth = async (req, res) => {
  try {
    const result = await deleteClothById(req.params.id);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Item removed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── report management ────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const { page, limit, search, category, status } = req.query;
    const result = await getReportsList({ page, limit, search, category, status });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading reports" });
  }
};

const getReportsStats = async (req, res) => {
  try {
    const stats = await getReportStats();
    return res.status(200).json({ stats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading report stats" });
  }
};

const getReportsActivity = async (req, res) => {
  try {
    const activity = await getModerationActivity();
    return res.status(200).json({ activity });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading report activity" });
  }
};

const getReportDetails = async (req, res) => {
  try {
    const report = await getReportDetail(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.status(200).json({ report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const resolveReportById = async (req, res) => {
  try {
    const result = await resolveReport(req.params.id, req.userId, req.body?.note);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Report resolved", report: result.report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const rejectReportById = async (req, res) => {
  try {
    const result = await rejectReport(req.params.id, req.userId, req.body?.note);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Report rejected", report: result.report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteReportContent = async (req, res) => {
  try {
    const result = await deleteReportedContent(req.params.id, req.userId);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    return res.status(200).json({ message: "Content removed", report: result.report });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ── order management ────────────────────────────────────────────
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email phone").sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    console.error("[getAdminOrders error]:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (err) {
    console.error("[getAdminOrderById error]:", err);
    return res.status(500).json({ message: "Failed to fetch order details" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const newStatus = req.body.status || req.body.orderStatus;
    const validStatuses = ["Pending", "Confirmed", "Processing", "In Production", "Ready", "Shipped", "Delivered", "Cancelled"];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid or missing order status value" });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return res.status(404).json({ message: "Order not found" });

    const oldStatus = existingOrder.orderStatus;

    // Do not create notification or emit socket event if status did not change
    if (oldStatus === newStatus) {
      return res.status(200).json({ message: "Order status unchanged.", order: existingOrder });
    }

    // Use findByIdAndUpdate with a scoped validator instead of fetch->mutate->save().
    // save() re-validates every required field on the WHOLE document (deliveryAddress,
    // basePrice, etc.), so any older/incomplete order document throws a ValidationError
    // and crashes the request with a 500 even though only orderStatus changed.
    // Updating just the changed path avoids re-validating unrelated fields.
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: newStatus },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    // Send notification & emit Socket.IO event to order owner
    if (order.user) {
      const targetUserId = order.user._id ? order.user._id.toString() : order.user.toString();
      const orderShortId = order._id.toString().slice(-6).toUpperCase();
      const notificationMsg = `Your order #${orderShortId} status has been updated to "${newStatus}".`;

      console.log(`[Admin Order Status Update]: Order #${orderShortId} (${order._id}) changed: "${oldStatus}" -> "${newStatus}". Target user: ${targetUserId}`);

      try {
        const { createNotification } = require("../../services/notificationService");
        await createNotification({
          userId: targetUserId,
          type: "order_status_update",
          title: "Order Status Updated",
          message: notificationMsg,
          relatedType: "Order",
          relatedId: order._id,
        });
      } catch (notifyErr) {
        console.error("Failed to send order status notification:", notifyErr.message);
      }

      try {
        const { getIO } = require("../../config/socket");
        const userRoom = `user:${targetUserId}`;
        getIO().to(userRoom).emit("orderStatusUpdated", {
          orderId: order._id.toString(),
          status: newStatus,
          oldStatus,
          message: notificationMsg,
          updatedAt: new Date(),
        });
        console.log(`[Socket.IO Server]: Emitting "orderStatusUpdated" to room: ${userRoom}`);
      } catch (socketErr) {
        console.error("Failed to emit orderStatusUpdated socket event:", socketErr.message);
      }

      // Send status update email to user
      try {
        const { sendStatusEmail } = require("../../utils/sendEmail");
        const User = require("../../models/userModel");
        let recipientEmail = order.deliveryAddress?.email;
        let recipientName = order.deliveryAddress?.fullName;

        if (!recipientEmail && order.user) {
          const userDoc = await User.findById(order.user).select("email name");
          if (userDoc) {
            recipientEmail = userDoc.email;
            recipientName = userDoc.name;
          }
        }

        if (recipientEmail) {
          await sendStatusEmail({
            toEmail: recipientEmail,
            userName: recipientName || "Customer",
            orderId: order._id,
            orderTitle: order.title || order.clothingType,
            status: newStatus,
            expectedDeliveryDate: order.expectedDeliveryDate,
            shortMessage: `Your StyleMate order has been updated to "${newStatus}".`,
          });
          console.log(`[Email Notification]: Order status update email sent to ${recipientEmail}`);
        }
      } catch (emailErr) {
        console.error("Failed to send order status update email:", emailErr.message);
      }
    }

    return res.status(200).json({ message: "Order status updated successfully.", order });
  } catch (err) {
    console.error("[updateOrderStatus error]:", err);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

module.exports = {
  getDashboardSummary,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getClothes,
  getClothFilters,
  getClothDetails,
  deleteCloth,
  getReports,
  getReportsStats,
  getReportsActivity,
  getReportDetails,
  resolveReportById,
  rejectReportById,
  deleteReportContent,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
};