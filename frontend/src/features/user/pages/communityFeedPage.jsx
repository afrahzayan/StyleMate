import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, User, Plus, Sparkles, Bookmark } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../../user/components/sidebar";
import FilterPills from "../../user/components/outfit/filterPills";
import PostCard from "../components/postCard";
import ShareMenu from "../components/shareMenu";
import ReportModal from "../components/reportModel";
import PostDetailModal from "../components/postDetailModel";
import useCommunity from "../hooks/useCommunity";

const FILTERS = [
  { label: "Latest", value: "Latest" },
  { label: "Most Liked", value: "Most Liked" },
  { label: "Casual", value: "Casual" },
  { label: "Formal", value: "Formal" },
  { label: "Party", value: "Party" },
  { label: "Traditional", value: "Traditional" },
  { label: "Office", value: "Office" },
];

const useDebouncedValue = (value, delayMs) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
};

const CommunityFeedPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { fetchPosts, toggleLike, toggleSave, deletePost } = useCommunity();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Latest");
  const [showMine, setShowMine] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [activePost, setActivePost] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [reportPost, setReportPost] = useState(null);

  const abortRef = useRef(null);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setShowMine(false);
  };

  const loadPosts = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const occasion = ["Latest", "Most Liked"].includes(activeFilter) ? "All" : activeFilter;
    const sort = activeFilter === "Most Liked" ? "mostLiked" : "recent";
    const result = await fetchPosts({ search: debouncedSearch, occasion, sort, mine: showMine, signal: controller.signal });
    if (abortRef.current !== controller) return;
    setLoading(false);
    if (result.success) setPosts(result.posts);
    else if (result.message) toast.error(result.message);
  }, [activeFilter, showMine, debouncedSearch]);

  useEffect(() => {
    loadPosts();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [loadPosts]);

  const handleToggleLike = async (post) => {
    const result = await toggleLike(post._id);
    if (result.success) {
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, isLiked: result.liked, likesCount: result.likesCount } : p))
      );
      setActivePost((prev) => (prev && prev._id === post._id ? { ...prev, isLiked: result.liked, likesCount: result.likesCount } : prev));
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleSave = async (post) => {
    const result = await toggleSave(post._id);
    if (result.success) {
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, isSaved: result.saved, savesCount: result.savesCount } : p))
      );
      setActivePost((prev) => (prev && prev._id === post._id ? { ...prev, isSaved: result.saved, savesCount: result.savesCount } : prev));
      toast.success(result.saved ? "Saved to your collection" : "Removed from saved");
    } else {
      toast.error(result.message);
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const result = await deletePost(post._id);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      setActivePost((prev) => (prev && prev._id === post._id ? null : prev));
      toast.success("Post deleted");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between gap-4 px-8 py-5 bg-white border-b shrink-0 flex-wrap"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
              Community Feed
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#7C8197" }}>See what the StyleMate community is wearing</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search creators, outfits, occasions..."
                className="pl-9 pr-4 py-2.5 rounded-full border text-sm outline-none w-72"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#FAF8F2" }}
              />
            </div>
            <button
              onClick={() => navigate("/community/saved")}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
              style={{ borderColor: "#E5E7EB" }}
              aria-label="Saved posts"
            >
              <Bookmark size={16} style={{ color: "#52557A" }} />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#4a5280" }}
              aria-label="Profile"
            >
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowMine((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                style={{
                  backgroundColor: showMine ? "#D7D8F6" : "#FFFFFF",
                  color: showMine ? "#2F3447" : "#7C8197",
                  borderColor: showMine ? "#D7D8F6" : "#E5E7EB",
                }}
              >
                <User size={14} />
                {showMine ? "Showing My Posts" : "Show My Posts"}
              </button>
              <FilterPills options={FILTERS} active={activeFilter} onChange={handleFilterChange} />
            </div>

            <button
              onClick={() => navigate("/community/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shrink-0"
              style={{ backgroundColor: "#4a5280" }}
            >
              <Plus size={15} />
              Create Post
            </button>
          </div>

          {!loading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-40 h-40 rounded-3xl flex items-center justify-center mb-6" style={{ backgroundColor: "#F5F4FA" }}>
                <Sparkles size={32} style={{ color: "#C7C9DC" }} />
              </div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "#2F3447" }}>No outfit posts yet.</h2>
              <p className="text-sm max-w-sm mb-6" style={{ color: "#7C8197" }}>
                The runway is clear and waiting for your vision. Be the first to inspire the community with your unique style!
              </p>
              <button
                onClick={() => navigate("/community/create")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "#4a5280" }}
              >
                <Plus size={15} />
                Create First Post
              </button>
            </div>
          )}

          <div className="columns-1 sm:columns-2 xl:columns-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.id}
                onOpen={setActivePost}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onDelete={handleDeletePost}
                onShare={setSharePost}
                onReport={setReportPost}
                onOpenProfile={(username) => username && navigate(`/community/profile/${username}`)}
              />
            ))}
          </div>
        </main>
      </div>

      {activePost && (
        <PostDetailModal
          post={activePost}
          currentUserId={user?.id}
          onClose={() => setActivePost(null)}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
          onCommentCountChange={(count) => {
            setActivePost((prev) => prev ? { ...prev, commentsCount: count } : prev);
            setPosts((prev) => prev.map((p) => (p._id === activePost._id ? { ...p, commentsCount: count } : p)));
          }}
          onOpenProfile={(username) => {
            setActivePost(null);
            if (username) navigate(`/community/profile/${username}`);
          }}
        />
      )}

      {sharePost && <ShareMenu post={sharePost} onClose={() => setSharePost(null)} />}

      {reportPost && (
        <ReportModalContainer
          post={reportPost}
          onClose={() => setReportPost(null)}
        />
      )}
    </div>
  );
};

const ReportModalContainer = ({ post, onClose }) => {
  const { reportPost } = useCommunity();
  const handleSubmit = async (postId, payload) => {
    const result = await reportPost(postId, payload);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    onClose();
  };
  return <ReportModal post={post} onClose={onClose} onSubmit={handleSubmit} />;
};

export default CommunityFeedPage;