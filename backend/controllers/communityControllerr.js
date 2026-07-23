const CommunityPost = require("../models/communityPostModel");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const Save = require("../models/saveModel");
const Report = require("../models/reportModel");
const Outfit = require("../models/outfitModel");
const User = require("../models/userModel");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

const AUTHOR_FIELDS = "name username profileImage";
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Attaches isLiked / isSaved flags for the requesting user onto a list of posts
const withViewerFlags = async (posts, userId) => {
  if (!posts.length) return posts;
  const postIds = posts.map((p) => p._id);
  const [likes, saves] = await Promise.all([
    Like.find({ user: userId, post: { $in: postIds } }).select("post"),
    Save.find({ user: userId, post: { $in: postIds } }).select("post"),
  ]);
  const likedSet = new Set(likes.map((l) => l.post.toString()));
  const savedSet = new Set(saves.map((s) => s.post.toString()));

  return posts.map((post) => ({
    ...post.toObject(),
    isLiked: likedSet.has(post._id.toString()),
    isSaved: savedSet.has(post._id.toString()),
  }));
};

const createPost = async (req, res) => {
  try {
    const { linkedOutfit, title, caption, occasion, style, season, tags, outfitType } = req.body;

    let image;
    let outfitName = "";

    if (linkedOutfit) {
      const outfit = await Outfit.findById(linkedOutfit).populate("items");
      if (outfit) {
        outfitName = outfit.name;
        if (!req.file) {
          const fallback = outfit.items.find((i) => i?.image?.url);
          if (fallback) {
            image = { url: fallback.image.url, publicId: fallback.image.publicId };
          }
        }
      }
    }

    if (!image && req.file) {
      const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, { folder: "community" });
      image = { url, publicId };
    }

    if (!image) {
      return res.status(400).json({ message: "Please upload an image for your post" });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
      ? tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean)
      : [];

    const post = await CommunityPost.create({
      user: req.userId || null,
      image,
      title: (title && title.trim()) || outfitName || "Untitled Post",
      caption: caption || "",
      occasion: occasion || "",
      style: style || "",
      season: season || "",
      tags: parsedTags,
      outfitType: outfitType === "ai" ? "ai" : "manual",
      linkedOutfit: linkedOutfit || null,
    });

    const populated = await post.populate("user", AUTHOR_FIELDS);
    return res.status(201).json({ message: "Post published", post: populated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while publishing your post" });
  }
};

const getPosts = async (req, res) => {
  try {
    const { search, occasion, sort, mine } = req.query;
    const filter = { status: "visible" };

    if (mine === "true") filter.user = req.userId;
    if (occasion && occasion !== "All" && occasion !== "Latest" && occasion !== "Most Liked") {
      filter.occasion = occasion;
    }

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      const matchingUsers = await User.find({
        $or: [{ username: regex }, { name: regex }],
      }).select("_id");

      filter.$or = [
        { title: regex },
        { caption: regex },
        { occasion: regex },
        { user: { $in: matchingUsers.map((u) => u._id) } },
      ];
    }

    const sortOption = sort === "mostLiked" ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

    const posts = await CommunityPost.find(filter).sort(sortOption).populate("user", AUTHOR_FIELDS);
    const withFlags = await withViewerFlags(posts, req.userId);

    return res.status(200).json({ posts: withFlags, count: withFlags.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading the feed" });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const saves = await Save.find({ user: req.userId }).sort({ createdAt: -1 }).populate({
      path: "post",
      match: { status: "visible" },
      populate: { path: "user", select: AUTHOR_FIELDS },
    });

    const posts = saves.map((s) => s.post).filter(Boolean);
    const withFlags = await withViewerFlags(posts, req.userId);

    return res.status(200).json({ posts: withFlags, count: withFlags.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading saved posts" });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, status: "visible" }).populate(
      "user",
      AUTHOR_FIELDS
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    const [withFlags] = await withViewerFlags([post], req.userId);
    return res.status(200).json({ post: withFlags });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const EDITABLE_FIELDS = ["title", "caption", "occasion", "style", "season", "tags"];

const updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, user: req.userId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    await post.save();
    const populated = await post.populate("user", AUTHOR_FIELDS);
    return res.status(200).json({ message: "Post updated", post: populated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Promise.all([
      Like.deleteMany({ post: post._id }),
      Save.deleteMany({ post: post._id }),
      Comment.deleteMany({ post: post._id }),
      post.image?.publicId ? deleteFromCloudinary(post.image.publicId).catch(() => null) : Promise.resolve(),
    ]);

    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, status: "visible" });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await Like.findOne({ user: req.userId, post: post._id });

    if (existing) {
      await existing.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
      return res.status(200).json({ liked: false, likesCount: post.likesCount });
    }

    await Like.create({ user: req.userId, post: post._id });
    post.likesCount += 1;
    await post.save();
    return res.status(200).json({ liked: true, likesCount: post.likesCount });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Please try again" });
    }
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const toggleSave = async (req, res) => {
  try {
    const post = await CommunityPost.findOne({ _id: req.params.id, status: "visible" });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await Save.findOne({ user: req.userId, post: post._id });

    if (existing) {
      await existing.deleteOne();
      post.savesCount = Math.max(0, post.savesCount - 1);
      await post.save();
      return res.status(200).json({ saved: false, savesCount: post.savesCount });
    }

    await Save.create({ user: req.userId, post: post._id });
    post.savesCount += 1;
    await post.save();
    return res.status(200).json({ saved: true, savesCount: post.savesCount });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Please try again" });
    }
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", AUTHOR_FIELDS);
    return res.status(200).json({ comments, count: comments.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment can't be empty" });
    }

    const post = await CommunityPost.findOne({ _id: req.params.id, status: "visible" });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({ post: post._id, user: req.userId, text: text.trim() });
    post.commentsCount += 1;
    await post.save();
    const populated = await comment.populate("user", AUTHOR_FIELDS);

    return res.status(201).json({ message: "Comment added", comment: populated, commentsCount: post.commentsCount });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      post: req.params.id,
      user: req.userId,
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { commentsCount: -1 } },
      { new: true }
    );

    return res.status(200).json({ message: "Comment deleted", commentsCount: post?.commentsCount ?? 0 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const reportPost = async (req, res) => {
  try {
    const { category, description } = req.body;
    if (!category) return res.status(400).json({ message: "Please choose a reason" });

    const post = await CommunityPost.findOne({ _id: req.params.id, status: "visible" });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user && post.user.toString() === req.userId) {
      return res.status(400).json({ message: "You can't report your own post" });
    }

    await Report.create({
      reportedBy: req.userId,
      reportedUser: post.user,
      targetType: "CommunityPost",
      targetId: post._id,
      category,
      description: description || "",
    });

    return res.status(201).json({ message: "Thanks — our team will review this post" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
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
};