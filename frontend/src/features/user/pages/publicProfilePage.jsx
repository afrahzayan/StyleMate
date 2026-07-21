import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, ImageOff } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../../user/components/sidebar";
import useCommunity from "../hooks/useCommunity";

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isLoading, fetchPublicProfile } = useCommunity();
  const [profile, setProfile] = useState(null);

  const load = useCallback(async () => {
    const result = await fetchPublicProfile(username);
    if (result.success) setProfile(result);
    else toast.error(result.message);
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-8 py-5 bg-white border-b shrink-0" style={{ borderColor: "#E5E7EB" }}>
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>Profile</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          {isLoading && !profile && <p className="text-sm" style={{ color: "#7C8197" }}>Loading profile...</p>}

          {profile && (
            <div className="max-w-3xl">
              <div className="flex items-center gap-5 rounded-2xl bg-white p-6" style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ backgroundColor: "#EDEBFA" }}>
                  {profile.user.profileImage?.url ? (
                    <img src={profile.user.profileImage.url} alt={profile.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <User size={30} style={{ color: "#52557A" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>{profile.user.name}</h2>
                  <p className="text-sm" style={{ color: "#7C8197" }}>@{profile.user.username}</p>
                  {profile.user.bio && <p className="text-sm mt-2" style={{ color: "#52557A" }}>{profile.user.bio}</p>}

                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <p className="text-base font-extrabold" style={{ color: "#1c1c2e" }}>{profile.postsCount}</p>
                      <p className="text-[11px] uppercase font-semibold" style={{ color: "#9CA3AF" }}>Posts</p>
                    </div>
                    <div>
                      <p className="text-base font-extrabold" style={{ color: "#1c1c2e" }}>{profile.followersCount}</p>
                      <p className="text-[11px] uppercase font-semibold" style={{ color: "#9CA3AF" }}>Followers</p>
                    </div>
                    <div>
                      <p className="text-base font-extrabold" style={{ color: "#1c1c2e" }}>{profile.followingCount}</p>
                      <p className="text-[11px] uppercase font-semibold" style={{ color: "#9CA3AF" }}>Following</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold mt-8 mb-3" style={{ color: "#1c1c2e" }}>Shared Outfits</h3>

              {profile.posts.length === 0 ? (
                <p className="text-sm" style={{ color: "#7C8197" }}>No posts shared yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.posts.map((post) => (
                    <div
                      key={post._id}
                      className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group"
                      style={{ backgroundColor: "#F5F4FA" }}
                      onClick={() => navigate("/community")}
                    >
                      {post.image?.url ? (
                        <img src={post.image.url} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff size={20} style={{ color: "#C7C9DC" }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicProfilePage;