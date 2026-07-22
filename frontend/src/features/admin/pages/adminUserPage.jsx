import { useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, Trash2, Search } from "lucide-react";
import AdminSidebar from "../components/adminSidebar";
import useAdminUsers from "../hooks/useAdminUser";

const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StatCard = ({ label, value, deltaLabel }) => (
  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
    {deltaLabel && (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
      >
        {deltaLabel}
      </span>
    )}
    <p className="text-sm mt-2" style={{ color: "#7c8197" }}>
      {label}
    </p>
    <p className="text-2xl font-extrabold mt-1" style={{ color: "#1c1c2e" }}>
      {value.toLocaleString()}
    </p>
  </div>
);

const AdminUsersPage = () => {
  const {
    users,
    stats,
    pagination,
    page,
    setSearch,
    isLoading,
    error,
    toggleBlock,
    removeUser,
    goToPage,
  } = useAdminUsers();

  const [searchInput, setSearchInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

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
            Manage Users
          </h1>
          <button
            onClick={() => toast("Coming soon", { icon: "🛠️" })}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: "#2d3358" }}
          >
            <UserPlus size={16} />
            Add New User
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <p className="text-xs" style={{ color: "#7c8197" }}>
            Dashboard <span className="mx-1">›</span> Users
          </p>
          <h2 className="text-2xl font-extrabold -mt-4" style={{ color: "#1c1c2e" }}>
            User Directory
          </h2>

          {error && (
            <div className="text-sm rounded-xl p-3" style={{ backgroundColor: "#fde2e1", color: "#c0392b" }}>
              {error}
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-4 gap-5">
              <StatCard label="Total Users" value={stats.totalUsers} />
              <StatCard label="Active Users" value={stats.activeUsers} />
              <StatCard label="Blocked Users" value={stats.blockedUsers} />
              <StatCard label="Pending Approval" value={stats.pendingApproval} />
            </div>
          )}

          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
                All Registered Users
              </h3>
              <form onSubmit={handleSearchSubmit} className="relative w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#7c8197" }}
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none"
                  style={{ borderColor: "#ede8e0" }}
                />
              </form>
            </div>

            {isLoading ? (
              <p className="text-sm" style={{ color: "#7c8197" }}>
                Loading users...
              </p>
            ) : users.length === 0 ? (
              <p className="text-sm" style={{ color: "#7c8197" }}>
                No users found.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left uppercase text-xs" style={{ color: "#7c8197" }}>
                    <th className="pb-3 font-semibold">User Identity</th>
                    <th className="pb-3 font-semibold">Email Address</th>
                    <th className="pb-3 font-semibold">Account Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const blocked = u.status === "blocked";
                    return (
                      <tr key={u._id} className="border-t" style={{ borderColor: "#ede8e0" }}>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: "#e4e7fb", color: "#2d3358" }}
                            >
                              {initials(u.name)}
                            </div>
                            <span className="font-semibold" style={{ color: "#1c1c2e" }}>
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5" style={{ color: "#4b4d5c" }}>
                          {u.email}
                        </td>
                        <td className="py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: blocked ? "#faf1de" : "#dcfce7",
                              color: blocked ? "#b45309" : "#16a34a",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: blocked ? "#b45309" : "#16a34a" }}
                            />
                            {blocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleBlock(u)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                              style={{
                                borderColor: blocked ? "#bbf7d0" : "#fde2e1",
                                color: blocked ? "#16a34a" : "#c0392b",
                              }}
                            >
                              {blocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(u)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center"
                              style={{ borderColor: "#ede8e0" }}
                            >
                              <Trash2 size={15} style={{ color: "#c0392b" }} />
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
                  Showing {users.length} of {pagination.total} users
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
        </main>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="rounded-2xl p-6 w-80 shadow-xl bg-white">
            <h3 className="text-base font-bold mb-2" style={{ color: "#1c1c2e" }}>
              Delete {confirmDelete.name}?
            </h3>
            <p className="text-sm mb-6" style={{ color: "#7c8197" }}>
              This permanently removes the user account. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "#ede8e0", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeUser(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#c0392b" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;