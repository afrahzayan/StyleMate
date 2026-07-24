import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck, PartyPopper, ShieldAlert, CalendarClock } from "lucide-react";
import useNotifications from "../hooks/notificationHook";

const ICONS = {
  report_content_removed: ShieldAlert,
  planner_reminder_day_before: CalendarClock,
  planner_reminder_morning_of: CalendarClock,
  system: PartyPopper,
};

const timeAgo = (isoDate) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const {
    items,
    unreadCount,
    hasLoadedOnce,
    toast,
    dismissToast,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
  };

  return (
    <>
      {/* Floating bell, sits above everything so it works on every page */}
      <div ref={panelRef} className="fixed top-4 right-5 z-50">
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-11 h-11 rounded-full bg-white shadow-md border flex items-center justify-center hover:shadow-lg transition-shadow"
          style={{ borderColor: "#ede8e0" }}
          aria-label="Notifications"
        >
          <Bell size={19} style={{ color: "#4a5280" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: "#e5484d" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-80 max-h-[28rem] bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col"
            style={{ borderColor: "#ede8e0" }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{ borderColor: "#ede8e0" }}
            >
              <h3 className="font-extrabold text-sm" style={{ color: "#1c1c2e" }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-semibold hover:underline"
                  style={{ color: "#4a5280" }}
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              {!hasLoadedOnce && (
                <p className="text-xs text-gray-400 text-center py-8">Loading...</p>
              )}

              {hasLoadedOnce && items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">You're all caught up</p>
              )}

              {items.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <button
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className="w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors flex gap-3"
                    style={{ borderColor: "#f3f0eb", backgroundColor: n.isRead ? "transparent" : "#f5f6fb" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#f0f2fa" }}
                    >
                      <Icon size={15} style={{ color: "#4a5280" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "#1c1c2e" }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#6b7280" }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "#9ca3af" }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ backgroundColor: "#4a5280" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live toast for a freshly arrived notification */}
      {toast && (
        <div className="fixed top-4 right-20 z-50 w-80 animate-in fade-in slide-in-from-top-2">
          <div
            className="bg-white rounded-xl shadow-xl border p-3.5 flex gap-3 items-start"
            style={{ borderColor: "#ede8e0" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#f0f2fa" }}
            >
              <Bell size={15} style={{ color: "#4a5280" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold" style={{ color: "#1c1c2e" }}>
                {toast.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                {toast.message}
              </p>
            </div>
            <button onClick={dismissToast} className="shrink-0 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationBell;
