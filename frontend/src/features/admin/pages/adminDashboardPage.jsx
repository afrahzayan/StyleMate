import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Flag } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminSidebar from "../components/adminSidebar";
import useAdminDashboard from "../hooks/useAdmiDashboard";

const CATEGORY_COLORS = ["#2d3358", "#4b4d5c", "#cfc9b8", "#c7c9f4", "#23262f", "#8b8fae"];

const CATEGORY_BADGE = {
  Inappropriate: { bg: "#fde2e1", color: "#c0392b" },
  Spam: { bg: "#e4e7fb", color: "#3f4b8c" },
  Abuse: { bg: "#f3e7d8", color: "#8a6d3b" },
  Misinformation: { bg: "#e9e9ec", color: "#54586b" },
  Other: { bg: "#e9e9ec", color: "#54586b" },
};

const STATUS_BADGE = {
  critical: { color: "#dc2626", label: "Critical" },
  new: { color: "#6b7280", label: "New" },
  reviewing: { color: "#d97706", label: "Reviewing" },
  high_priority: { color: "#ea580c", label: "High Priority" },
  resolved: { color: "#16a34a", label: "Resolved" },
};

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const StatCard = ({ label, value, delta, deltaLabel, icon: Icon }) => (
  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
    <div className="flex items-center justify-between mb-4">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "#e4e7fb" }}
      >
        <Icon size={17} style={{ color: "#2d3358" }} />
      </div>
      {delta != null && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: delta >= 0 ? "#dcfce7" : "#fde2e1",
            color: delta >= 0 ? "#16a34a" : "#c0392b",
          }}
        >
          {delta >= 0 ? "+" : ""}
          {delta} {deltaLabel}
        </span>
      )}
    </div>
    <p className="text-sm" style={{ color: "#7c8197" }}>
      {label}
    </p>
    <p className="text-2xl font-extrabold mt-1" style={{ color: "#1c1c2e" }}>
      {value.toLocaleString()}
    </p>
  </div>
);

const AdminDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useAdminDashboard();

  const overview = data?.overview;
  const activity = (data?.usersActivity || []).map((row) => ({
    ...row,
    label: formatDate(row.date),
  }));
  const categories = data?.clothesByCategory || [];
  const reports = data?.recentReports || [];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#faf8f5" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header
          className="flex items-center justify-between px-8 py-5 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <h1 className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>
            Dashboard
          </h1>
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: "#1c1c2e" }}>
              {user?.name || "Admin"}
            </p>
            <p className="text-xs uppercase tracking-wide" style={{ color: "#7c8197" }}>
              {user?.role === "admin" ? "Admin" : "Chief Stylist"}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="text-sm rounded-xl p-3" style={{ backgroundColor: "#fde2e1", color: "#c0392b" }}>
              {error}
            </div>
          )}

          {isLoading || !overview ? (
            <p className="text-sm" style={{ color: "#7c8197" }}>
              Loading dashboard...
            </p>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-5">
                <StatCard
                  label="Total Users"
                  value={overview.totalUsers}
                  delta={overview.newUsersThisWeek}
                  deltaLabel="this week"
                  icon={() => <span>👥</span>}
                />
                <StatCard
                  label="Total Clothes"
                  value={overview.totalClothes}
                  delta={overview.newClothesToday}
                  deltaLabel="today"
                  icon={() => <span>👕</span>}
                />
                <StatCard
                  label="Total Outfits"
                  value={overview.totalOutfits}
                  delta={overview.newOutfitsThisWeek}
                  deltaLabel="this week"
                  icon={() => <span>🧥</span>}
                />
                <StatCard
                  label="AI Requests"
                  value={overview.totalAiRequests}
                  delta={null}
                  icon={() => <span>🤖</span>}
                />
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
                  <h2 className="font-extrabold text-base mb-4" style={{ color: "#1c1c2e" }}>
                    Users Activity (Past 30 Days)
                  </h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={activity}>
                      <defs>
                        <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2d3358" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2d3358" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#7c8197" }}
                        interval={Math.ceil(activity.length / 6)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#7c8197" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        formatter={(value) => [value, "New Users"]}
                        labelStyle={{ color: "#1c1c2e" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#2d3358"
                        strokeWidth={2}
                        fill="url(#activityFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
                  <h2 className="font-extrabold text-base mb-4" style={{ color: "#1c1c2e" }}>
                    Clothes by Category
                  </h2>
                  {categories.length === 0 ? (
                    <p className="text-sm" style={{ color: "#7c8197" }}>
                      No clothes uploaded yet.
                    </p>
                  ) : (
                    <>
                      <div className="relative">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={categories}
                              dataKey="count"
                              nameKey="category"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                            >
                              {categories.map((entry, index) => (
                                <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-xl font-extrabold" style={{ color: "#1c1c2e" }}>
                            {overview.totalClothes.toLocaleString()}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide" style={{ color: "#7c8197" }}>
                            Total Items
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        {categories.map((entry, index) => (
                          <div key={entry.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                              />
                              <span style={{ color: "#1c1c2e" }}>{entry.category}</span>
                            </div>
                            <span className="font-semibold" style={{ color: "#1c1c2e" }}>
                              {entry.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flag size={16} style={{ color: "#c0392b" }} />
                    <h2 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
                      Recent Report Alerts
                    </h2>
                    {data.pendingReportsCount > 0 && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#fde2e1", color: "#c0392b" }}
                      >
                        {data.pendingReportsCount} pending
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toast("Coming soon", { icon: "🛠️" })}
                    className="text-sm font-semibold"
                    style={{ color: "#2d3358" }}
                  >
                    View all reports
                  </button>
                </div>

                {reports.length === 0 ? (
                  <p className="text-sm" style={{ color: "#7c8197" }}>
                    No reports yet.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left" style={{ color: "#7c8197" }}>
                        <th className="pb-3 font-semibold">Report Description</th>
                        <th className="pb-3 font-semibold">Reported User</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => {
                        const categoryBadge = CATEGORY_BADGE[report.category] || CATEGORY_BADGE.Other;
                        const statusBadge = STATUS_BADGE[report.status] || STATUS_BADGE.new;
                        return (
                          <tr key={report.id} className="border-t" style={{ borderColor: "#ede8e0" }}>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold" style={{ color: "#1c1c2e" }}>
                                  {report.description || report.category}
                                </span>
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                                  style={{ backgroundColor: categoryBadge.bg, color: categoryBadge.color }}
                                >
                                  {report.category}
                                </span>
                              </div>
                            </td>
                            <td className="py-3" style={{ color: "#1c1c2e" }}>
                              {report.reportedUser?.name || "Unknown"}
                            </td>
                            <td className="py-3">
                              <span className="flex items-center gap-1.5" style={{ color: statusBadge.color }}>
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: statusBadge.color }}
                                />
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => toast("Coming soon", { icon: "🛠️" })}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                                style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;