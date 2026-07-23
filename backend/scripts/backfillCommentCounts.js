const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const CommunityPost = require("../models/communityPostModel");
const Comment = require("../models/commentModel");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function backfill() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not found in environment. Add it to .env or set it inline.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const posts = await CommunityPost.find({}).select("_id").lean();
  console.log(`Found ${posts.length} posts to process`);

  for (const post of posts) {
    const count = await Comment.countDocuments({ post: post._id });
    await CommunityPost.findByIdAndUpdate(post._id, { commentsCount: count });
  }

  console.log("Backfill complete");
  await mongoose.disconnect();
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
