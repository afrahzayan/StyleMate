import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Flag, User, Sparkles } from "lucide-react";

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const PostCard = ({ post, onOpen, onToggleLike, onToggleSave, onShare, onReport, onOpenProfile }) => {
  const author = post.user || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 break-inside-avoid rounded-[20px] bg-white overflow-hidden"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(47,52,71,0.06)" }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => onOpenProfile?.(author.username)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: "#EDEBFA" }}
          >
            {author.profileImage?.url ? (
              <img src={author.profileImage.url} alt={author.username} className="w-full h-full object-cover" />
            ) : (
              <User size={15} style={{ color: "#52557A" }} />
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold truncate" style={{ color: "#2F3447" }}>
              @{author.username || "user"}
            </p>
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{timeAgo(post.createdAt)}</p>
          </div>
        </button>

        <button
          onClick={() => onReport?.(post)}
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ color: "#C7C9DC" }}
          aria-label="Report post"
        >
          <Flag size={14} />
        </button>
      </div>

      <div className="relative cursor-pointer" onClick={() => onOpen?.(post)}>
        <img src={post.image?.url} alt={post.title} className="w-full object-cover" style={{ maxHeight: 520 }} />
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide text-white uppercase flex items-center gap-1"
          style={{ backgroundColor: post.outfitType === "ai" ? "#4a5280" : "rgba(47,52,71,0.65)" }}
        >
          {post.outfitType === "ai" && <Sparkles size={10} />}
          {post.outfitType === "ai" ? "AI Generated" : "Manual"}
        </span>
      </div>

      <div className="px-4 pt-3">
        <p className="text-sm font-bold cursor-pointer" style={{ color: "#2F3447" }} onClick={() => onOpen?.(post)}>
          {post.title}
        </p>
        {post.caption && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7C8197" }}>
            {post.caption}
          </p>
        )}
        {post.tags?.length > 0 && (
          <p className="text-xs mt-1.5 font-medium" style={{ color: "#52557A" }}>
            {post.tags.map((t) => `#${t}`).join(" ")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 mt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleLike?.(post)}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: post.isLiked ? "#C0392B" : "#7C8197" }}
          >
            <Heart size={16} fill={post.isLiked ? "#C0392B" : "none"} />
            {post.likesCount}
          </button>
          <button
            onClick={() => onOpen?.(post)}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#7C8197" }}
          >
            <MessageCircle size={16} />
            {post.commentsCount ?? ""}
          </button>
          <button
            onClick={() => onShare?.(post)}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#7C8197" }}
          >
            <Share2 size={16} />
          </button>
        </div>

        <button
          onClick={() => onToggleSave?.(post)}
          aria-label="Save post"
          style={{ color: post.isSaved ? "#52557A" : "#7C8197" }}
        >
          <Bookmark size={17} fill={post.isSaved ? "#52557A" : "none"} />
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;