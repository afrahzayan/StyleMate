import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../../user/components/sidebar";
import PostCard from "../components/postCard";
import ShareMenu from "../components/shareMenu";
import PostDetailModal from "../components/postDetailModel";
import useCommunity from "../hooks/useCommunity";

const SavedPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, fetchSavedPosts, toggleLike, toggleSave } = useCommunity();

  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [sharePost, setSharePost] = useState(null);

  const loadSaved = useCallback(async () => {
    const result = await fetchSavedPosts();
    if (result.success) setPosts(result.posts);
    else toast.error(result.message);
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleToggleLike = async (post) => {
    const result = await toggleLike(post._id);
    if (result.success) {
      setPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, isLiked: result.liked, likesCount: result.likesCount } : p)));
    } else toast.error(result.message);
  };

  const handleToggleSave = async (post) => {
    const result = await toggleSave(post._id);
    if (result.success) {
      if (!result.saved) {
        setPosts((prev) => prev.filter((p) => p._id !== post._id));
        setActivePost(null);
      }
    } else toast.error(result.message);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-8 py-5 bg-white border-b shrink-0" style={{ borderColor: "#E5E7EB" }}>
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>Saved Posts</h1>
            <p className="text-xs mt-0.5" style={{ color: "#7C8197" }}>Community outfits you've bookmarked</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {!isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#EDEBFA" }}>
                <Bookmark size={24} style={{ color: "#52557A" }} />
              </div>
              <h2 className="text-lg font-extrabold mb-1" style={{ color: "#2F3447" }}>No saved posts yet</h2>
              <p className="text-sm max-w-sm" style={{ color: "#7C8197" }}>
                Tap the bookmark icon on any community post to save it here for later.
              </p>
            </div>
          )}

          <div className="columns-1 sm:columns-2 xl:columns-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onOpen={setActivePost}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onShare={setSharePost}
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
          onOpenProfile={(username) => {
            setActivePost(null);
            if (username) navigate(`/community/profile/${username}`);
          }}
        />
      )}

      {sharePost && <ShareMenu post={sharePost} onClose={() => setSharePost(null)} />}
    </div>
  );
};

export default SavedPostsPage;