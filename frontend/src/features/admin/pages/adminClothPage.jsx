import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Eye, X } from "lucide-react";
import AdminSidebar from "../components/adminSidebar";
import useAdminCloth from "../hooks/useAdminCloth";

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-sm rounded-xl border px-3 py-2 focus:outline-none bg-white"
    style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const StatusBadge = ({ status }) => {
  const active = status === "Active";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: active ? "#dcfce7" : "#fde2e1",
        color: active ? "#16a34a" : "#c0392b",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? "#16a34a" : "#c0392b" }} />
      {status}
    </span>
  );
};

const AdminClothPage = () => {
  const {
    clothes,
    categoryStats,
    filterOptions,
    pagination,
    page,
    setSearch,
    category,
    setCategory,
    occasion,
    setOccasion,
    season,
    setSeason,
    status,
    setStatus,
    isLoading,
    error,
    removeCloth,
    goToPage,
  } = useAdminCloth();

  const [searchInput, setSearchInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewCloth, setViewCloth] = useState(null);

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
            Manage Clothes
          </h1>
          <button
            onClick={() => toast("Coming soon", { icon: "🛠️" })}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: "#2d3358" }}
          >
            + Add New Item
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <p className="text-xs" style={{ color: "#7c8197" }}>
            Dashboard <span className="mx-1">›</span> Clothes
          </p>
          <div className="-mt-4">
            <h2 className="text-2xl font-extrabold" style={{ color: "#1c1c2e" }}>
              Wardrobe Inventory
            </h2>
            <p className="text-sm mt-1" style={{ color: "#7c8197" }}>
              Browse, view, or remove items from the global clothing catalog.
            </p>
          </div>

          {error && (
            <div className="text-sm rounded-xl p-3" style={{ backgroundColor: "#fde2e1", color: "#c0392b" }}>
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
                All Clothing Items
              </h3>

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
                    placeholder="Search name, color, user..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none"
                    style={{ borderColor: "#ede8e0" }}
                  />
                </form>

                <FilterSelect
                  value={category}
                  onChange={setCategory}
                  options={filterOptions.categories}
                  placeholder="All Categories"
                />
                <FilterSelect
                  value={occasion}
                  onChange={setOccasion}
                  options={filterOptions.occasions}
                  placeholder="All Occasions"
                />
                <FilterSelect
                  value={season}
                  onChange={setSeason}
                  options={filterOptions.seasons}
                  placeholder="All Seasons"
                />
                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  options={filterOptions.statuses}
                  placeholder="All Statuses"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm" style={{ color: "#7c8197" }}>
                Loading clothes...
              </p>
            ) : clothes.length === 0 ? (
              <p className="text-sm" style={{ color: "#7c8197" }}>
                No items match your search/filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left uppercase text-xs" style={{ color: "#7c8197" }}>
                      <th className="pb-3 font-semibold">Item</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Color</th>
                      <th className="pb-3 font-semibold">Season / Occasion</th>
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Uploaded</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clothes.map((c) => (
                      <tr key={c.id} className="border-t" style={{ borderColor: "#ede8e0" }}>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.image?.url}
                              alt={c.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                              style={{ backgroundColor: "#ede8e0" }}
                            />
                            <span className="font-semibold" style={{ color: "#1c1c2e" }}>
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "#f3efe6", color: "#54586b" }}
                          >
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3.5" style={{ color: "#4b4d5c" }}>
                          {c.color || "—"}
                        </td>
                        <td className="py-3.5" style={{ color: "#4b4d5c" }}>
                          {[c.season, c.occasion].filter(Boolean).join(" / ") || "—"}
                        </td>
                        <td className="py-3.5" style={{ color: "#1c1c2e" }}>
                          {c.user?.name || "Unknown"}
                        </td>
                        <td className="py-3.5" style={{ color: "#4b4d5c" }}>
                          {formatDate(c.uploadedAt)}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewCloth(c)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center"
                              style={{ borderColor: "#ede8e0" }}
                              title="View details"
                            >
                              <Eye size={15} style={{ color: "#2d3358" }} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(c)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center"
                              style={{ borderColor: "#ede8e0" }}
                              title="Delete item"
                            >
                              <Trash2 size={15} style={{ color: "#c0392b" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.total > 0 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs" style={{ color: "#7c8197" }}>
                  Showing {clothes.length} of {pagination.total} items
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

          {Object.keys(categoryStats).length > 0 && (
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "#ede8e0" }}>
              <h3 className="font-extrabold text-base mb-4" style={{ color: "#1c1c2e" }}>
                Category Stats
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "#4b4d5c" }}>
                      {cat}
                    </span>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: "#f3efe6", color: "#1c1c2e" }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* View complete clothing details */}
      {viewCloth && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="rounded-2xl w-full max-w-md shadow-xl bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#ede8e0" }}>
              <h3 className="text-base font-bold" style={{ color: "#1c1c2e" }}>
                Item Details
              </h3>
              <button onClick={() => setViewCloth(null)}>
                <X size={18} style={{ color: "#7c8197" }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <img
                src={viewCloth.image?.url}
                alt={viewCloth.name}
                className="w-full h-48 object-cover rounded-xl"
                style={{ backgroundColor: "#ede8e0" }}
              />
              <h4 className="text-lg font-extrabold" style={{ color: "#1c1c2e" }}>
                {viewCloth.name}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <DetailRow label="Category" value={viewCloth.category} />
                <DetailRow label="Color" value={viewCloth.color || "—"} />
                <DetailRow label="Season" value={viewCloth.season || "—"} />
                <DetailRow label="Occasion" value={viewCloth.occasion || "—"} />
                <DetailRow label="Uploaded by" value={viewCloth.user?.name || "Unknown"} />
                <DetailRow label="Uploaded on" value={formatDate(viewCloth.uploadedAt)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "#7c8197" }}>
                  Status
                </span>
                <StatusBadge status={viewCloth.status} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
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
              This removes the item from the wardrobe catalog. This action cannot be undone.
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
                  removeCloth(confirmDelete);
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

export default AdminClothPage;