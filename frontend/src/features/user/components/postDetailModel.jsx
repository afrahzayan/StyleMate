import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { X, Heart, Bookmark, Send, Trash2, User } from "lucide-react";
import useCommunity from "../hooks/useCommunity";

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const PostDetailModal = ({ post, currentUserId, onClose, onToggleLike, onToggleSave, onOpenProfile }) => {
  const { fetchComments, addComment, deleteComment } = useCommunity();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const loadComments = useCallback(async () => {
    const result = await fetchComments(post._id);
    if (result.success) setComments(result.comments);
  }, [post._id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    const result = await addComment(post._id, text.trim());
    setPosting(false);
    if (result.success) {
      setComments((prev) => [result.comment, ...prev]);
      setText("");
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await deleteComment(post._id, commentId);
    if (result.success) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } else {
      toast.error(result.message);
    }
  };

  const author = post.user || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] rounded-[24px] overflow-hidden bg-white flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-1/2 shrink-0" style={{ backgroundColor: "#F5F4FA" }}>
          <img src={post.image?.url} alt={post.title} className="w-full h-full object-cover max-h-[50vh] md:max-h-[90vh]" />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "#E5E7EB" }}>
            <button onClick={() => onOpenProfile?.(author.username)} className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: "#EDEBFA" }}>
                {author.profileImage?.url ? (
                  <img src={author.profileImage.url} className="w-full h-full object-cover" alt={author.username} />
                ) : (
                  <User size={18} style={{ color: "#52557A" }} />
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "#2F3447" }}>{author.name}</p>
                <p className="text-xs" style={{ color: "#7C8197" }}>@{author.username}</p>
              </div>
            </button>
            <button onClick={onClose} aria-label="Close">
              <X size={20} style={{ color: "#7C8197" }} />
            </button>
          </div>

          <div className="px-6 pt-4 pb-2 overflow-y-auto">
            <h2 className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>{post.title}</h2>
            {post.caption && <p className="text-sm mt-2 leading-relaxed" style={{ color: "#52557A" }}>{post.caption}</p>}

            <div className="flex flex-wrap gap-2 mt-3">
              {post.occasion && <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ backgroundColor: "#EDEBFA", color: "#52557A" }}>Occasion: {post.occasion}</span>}
              {post.style && <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ backgroundColor: "#EDEBFA", color: "#52557A" }}>Style: {post.style}</span>}
              {post.season && <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ backgroundColor: "#EDEBFA", color: "#52557A" }}>Season: {post.season}</span>}
            </div>

            <div className="flex items-center gap-6 mt-5 py-4 border-y" style={{ borderColor: "#E5E7EB" }}>
              <div>
                <p className="text-lg font-extrabold" style={{ color: "#1c1c2e" }}>{post.likesCount}</p>
                <p className="text-[11px] uppercase font-semibold" style={{ color: "#9CA3AF" }}>Likes</p>
              </div>
              <div>
                <p className="text-lg font-extrabold" style={{ color: "#1c1c2e" }}>{post.savesCount}</p>
                <p className="text-[11px] uppercase font-semibold" style={{ color: "#9CA3AF" }}>Saves</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onToggleLike?.(post)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: post.isLiked ? "#C0392B" : "#4a5280" }}
              >
                <Heart size={15} fill="#fff" />
                {post.isLiked ? "Liked" : "Like Outfit"}
              </button>
              <button
                onClick={() => onToggleSave?.(post)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "#E5E7EB", color: "#2F3447", backgroundColor: post.isSaved ? "#F5F4FA" : "#fff" }}
              >
                <Bookmark size={15} fill={post.isSaved ? "#52557A" : "none"} style={{ color: "#52557A" }} />
                {post.isSaved ? "Saved" : "Save Outfit"}
              </button>
            </div>

            <h3 className="text-sm font-bold mt-6 mb-3" style={{ color: "#1c1c2e" }}>Community Thoughts</h3>
            <div className="space-y-4 pb-2">
              {comments.length === 0 && (
                <p className="text-xs" style={{ color: "#9CA3AF" }}>No comments yet — be the first to share your thoughts.</p>
              )}
              {comments.map((c) => (
                <div key={c._id} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: "#EDEBFA" }}>
                    {c.user?.profileImage?.url ? (
                      <img src={c.user.profileImage.url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={14} style={{ color: "#52557A" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold" style={{ color: "#2F3447" }}>@{c.user?.username}</p>
                      <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{timeAgo(c.createdAt)}</p>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "#52557A" }}>{c.text}</p>
                  </div>
                  {c.user?._id === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={13} style={{ color: "#C0392B" }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-6 py-4 border-t shrink-0" style={{ borderColor: "#E5E7EB" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2.5 rounded-full border text-sm outline-none"
              style={{ borderColor: "#E5E7EB" }}
            />
            <button
              onClick={handleAddComment}
              disabled={!text.trim() || posting}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
              style={{ backgroundColor: "#4a5280" }}
              aria-label="Send comment"
            >
              <Send size={15} style={{ color: "#fff" }} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostDetailModal;