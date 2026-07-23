import { useState, useEffect } from "react";
import { Search, ImageOff, Ban, Megaphone, Info, Flag, X, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import AdminSidebar from "../components/adminSidebar";
import useAdminReport from "../hooks/useAdminReport";

const CATEGORY_ICON = {
  Inappropriate: ImageOff,
  Spam: Ban,
  Abuse: Megaphone,
  Misinformation: Info,
  Other: Flag,
};

const CATEGORY_BADGE = {
  Inappropriate: { bg: "#fde2e1", color: "#c0392b" },
  Spam: { bg: "#e4e7fb", color: "#3f4b8c" },
  Abuse: { bg: "#fde2e1", color: "#c0392b" },
  Misinformation: { bg: "#e9e9ec", color: "#54586b" },
  Other: { bg: "#e9e9ec", color: "#54586b" },
};

const STATUS_BADGE = {
  new: { color: "#6b7280", label: "New" },
  reviewing: { color: "#6b7280", label: "Reviewing" },
  high_priority: { color: "#dc2626", label: "High Priority" },
  critical: { color: "#dc2626", label: "Critical" },
  resolved: { color: "#16a34a", label: "Resolved" },
  rejected: { color: "#9ca3af", label: "Rejected" },
};

const TARGET_TYPE_LABEL = {
  CommunityPost: "community post",
  Cloth: "wardrobe item",
  Comment: "comment",
};

const REPORT_CATEGORIES = ["Inappropriate", "Spam", "Abuse", "Misinformation", "Other"];
const REPORT_STATUSES = ["new", "reviewing", "high_priority", "critical", "resolved", "rejected"];

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm" style={{ color: "#7c8197" }}>
          {label}
        </p>
        <p className="text-2xl font-extrabold mt-1" style={{ color: "#1c1c2e" }}>
          {value}
        </p>
      </div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#f3efe6" }}
      >
        <Icon size={18} style={{ color: "#2d3358" }} />
      </div>
    </div>
  </div>
);

const AdminReportPage = () => {
  const {
    reports,
    stats,
    activity,
    pagination,
    page,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    isLoading,
    error,
    selectedReport,
    isDetailLoading,
    openReport,
    closeReport,
    resolve,
    reject,
    removeContent,
    goToPage,
  } = useAdminReport();

  const [searchInput, setSearchInput] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("");
  }, [selectedReport?._id, selectedReport?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#faf8f5" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header
          className="flex items-center justify-between px-8 py-5 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <h1 className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>
            Reports
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="text-sm rounded-xl p-3" style={{ backgroundColor: "#fde2e1", color: "#c0392b" }}>
              {error}
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-3 gap-5">
              <StatCard label="Pending Reviews" value={stats.pendingReviews} icon={AlertTriangle} />
              <StatCard label="Resolved Today" value={stats.resolvedToday} icon={CheckCircle2} />
              <StatCard label="Resolution Rate" value={`${stats.resolutionRate}%`} icon={Sparkles} />
            </div>
          )}

          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Flag size={16} style={{ color: "#c0392b" }} />
                <h3 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
                  Content Moderation Queue
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <form onSubmit={handleSearchSubmit} className="relative w-56">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#7c8197" }}
                  />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search reports..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none"
                    style={{ borderColor: "#ede8e0" }}
                  />
                </form>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-sm rounded-xl border px-3 py-2 focus:outline-none bg-white"
                  style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
                >
                  <option value="">All Categories</option>
                  {REPORT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="text-sm rounded-xl border px-3 py-2 focus:outline-none bg-white"
                  style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
                >
                  <option value="">All Statuses</option>
                  {REPORT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_BADGE[s].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm" style={{ color: "#7c8197" }}>
                Loading reports...
              </p>
            ) : reports.length === 0 ? (
              <p className="text-sm" style={{ color: "#7c8197" }}>
                No reports match your search/filters.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left uppercase text-xs" style={{ color: "#7c8197" }}>
                    <th className="pb-3 font-semibold">Report Description</th>
                    <th className="pb-3 font-semibold">Reported User</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const Icon = CATEGORY_ICON[r.category] || Flag;
                    const categoryBadge = CATEGORY_BADGE[r.category] || CATEGORY_BADGE.Other;
                    const statusBadge = STATUS_BADGE[r.status] || STATUS_BADGE.new;
                    const resolved = r.status === "resolved" || r.status === "rejected";
                    return (
                      <tr key={r.id} className="border-t" style={{ borderColor: "#ede8e0" }}>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: categoryBadge.bg }}
                            >
                              <Icon size={16} style={{ color: categoryBadge.color }} />
                            </div>
                            <span className="font-semibold" style={{ color: "#1c1c2e" }}>
                              {r.description || r.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5" style={{ color: "#1c1c2e" }}>
                          {r.reportedUser?.name || "Unknown"}
                        </td>
                        <td className="py-3.5">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: categoryBadge.bg, color: categoryBadge.color }}
                          >
                            {r.category}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="flex items-center gap-1.5" style={{ color: statusBadge.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusBadge.color }} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openReport(r)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                              style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
                            >
                              Review
                            </button>
                            <button
                              onClick={() => setConfirmRemove(r)}
                              disabled={resolved}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                              style={{ backgroundColor: "#c0392b" }}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {pagination.total > 0 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs" style={{ color: "#7c8197" }}>
                  Showing {reports.length} of {pagination.total} reports
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border disabled:opacity-40"
                    style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-40"
                    style={{ backgroundColor: "#2d3358" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {activity.length > 0 && (
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
              <h3 className="font-extrabold text-base mb-4" style={{ color: "#1c1c2e" }}>
                Moderation Activity
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activity}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "#7c8197" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip labelFormatter={formatDate} />
                  <Bar dataKey="reports" fill="#4b4d5c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs mt-2" style={{ color: "#7c8197" }}>
                Daily reports frequency over the last 7 days.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Review modal — full report detail + resolve/reject/delete content */}
      {(selectedReport || isDetailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="rounded-2xl w-full max-w-lg shadow-xl bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#ede8e0" }}>
              <h3 className="text-base font-bold" style={{ color: "#1c1c2e" }}>
                Report Details
              </h3>
              <button onClick={closeReport}>
                <X size={18} style={{ color: "#7c8197" }} />
              </button>
            </div>

            {isDetailLoading || !selectedReport ? (
              <p className="text-sm p-6" style={{ color: "#7c8197" }}>
                Loading...
              </p>
            ) : (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailRow label="Category" value={selectedReport.category} />
                  <DetailRow
                    label="Status"
                    value={STATUS_BADGE[selectedReport.status]?.label || selectedReport.status}
                  />
                  <DetailRow label="Reported by" value={selectedReport.reportedBy?.name || "Unknown"} />
                  <DetailRow label="Reported user" value={selectedReport.reportedUser?.name || "Unknown"} />
                  <DetailRow label="Content type" value={selectedReport.targetType} />
                  <DetailRow label="Reported on" value={formatDate(selectedReport.createdAt)} />
                </div>

                {selectedReport.description && (
                  <div>
                    <p className="text-xs" style={{ color: "#7c8197" }}>
                      Report reason / description
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#1c1c2e" }}>
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs mb-2" style={{ color: "#7c8197" }}>
                    Reported content
                  </p>
                  {selectedReport.content ? (
                    <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "#ede8e0" }}>
                      {selectedReport.content.image?.url && (
                        <img
                          src={selectedReport.content.image.url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <p className="text-sm" style={{ color: "#1c1c2e" }}>
                        {selectedReport.content.title ||
                          selectedReport.content.name ||
                          selectedReport.content.text ||
                          "Content preview unavailable"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm italic" style={{ color: "#7c8197" }}>
                      This content has already been removed.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs" style={{ color: "#7c8197" }}>
                    Resolution note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full mt-1 text-sm rounded-xl border px-3 py-2 focus:outline-none"
                    style={{ borderColor: "#ede8e0" }}
                    placeholder="e.g. Confirmed inappropriate image — removed."
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => resolve(selectedReport.id ?? selectedReport._id, note)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "#16a34a" }}
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => reject(selectedReport.id ?? selectedReport._id, note)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                    style={{ borderColor: "#ede8e0", color: "#374151" }}
                  >
                    Reject
                  </button>
                  {selectedReport.content && (
                    <button
                      onClick={() => removeContent(selectedReport.id ?? selectedReport._id)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: "#c0392b" }}
                    >
                      Delete Content
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick "Remove" confirmation from the table row */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="rounded-2xl p-6 w-80 shadow-xl bg-white">
            <h3 className="text-base font-bold mb-2" style={{ color: "#1c1c2e" }}>
              Remove reported content?
            </h3>
            <p className="text-sm mb-6" style={{ color: "#7c8197" }}>
              This deletes the underlying {TARGET_TYPE_LABEL[confirmRemove.targetType] || "content"} and marks the
              report resolved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "#ede8e0", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeContent(confirmRemove.id);
                  setConfirmRemove(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#c0392b" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs" style={{ color: "#7c8197" }}>
      {label}
    </p>
    <p className="font-semibold" style={{ color: "#1c1c2e" }}>
      {value}
    </p>
  </div>
);

export default AdminReportPage;