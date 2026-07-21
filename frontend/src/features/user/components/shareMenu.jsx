import { useEffect } from "react";
import toast from "react-hot-toast";
import { X, Link2, MessageCircle } from "lucide-react";

const ShareMenu = ({ post, onClose }) => {
  const shareUrl = `${window.location.origin}/community/post/${post._id}`;

  useEffect(() => {
    if (navigator.share) {
      navigator
        .share({ title: post.title, text: post.caption || post.title, url: shareUrl })
        .then(onClose)
        .catch(() => {}); // user cancelled native sheet, fall through to custom menu
    }
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
    onClose();
  };

  const options = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`,
    },
    {
      label: "Facebook",
      icon: MessageCircle,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "X (Twitter)",
      icon: MessageCircle,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div
        className="rounded-2xl p-5 w-80 shadow-xl"
        style={{ backgroundColor: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: "#1c1c2e" }}>Share this look</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} style={{ color: "#7C8197" }} />
          </button>
        </div>

        <div className="space-y-1.5">
          {options.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#FAF8F2] transition-colors"
              style={{ color: "#2F3447" }}
            >
              {label}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[#FAF8F2] transition-colors"
            style={{ color: "#2F3447" }}
          >
            <Link2 size={16} />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareMenu;