const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const {
  createPost,
  getPosts,
  getSavedPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  getComments,
  addComment,
  deleteComment,
  reportPost,
} = require("../controllers/communityControllerr");

router.post("/", upload.single("image"), createPost);
router.get("/", protect, getPosts);
router.get("/saved", protect, getSavedPosts);
router.get("/:id", protect, getPostById);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

router.post("/:id/like", protect, toggleLike);
router.post("/:id/save", protect, toggleSave);
router.post("/:id/report", protect, reportPost);

router.get("/:id/comments", protect, getComments);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;