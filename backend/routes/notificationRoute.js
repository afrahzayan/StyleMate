const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  getNotifications,
  readNotification,
  readAllNotifications,
} = require("../controllers/notificationController");

router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:id/read", readNotification);

module.exports = router;
