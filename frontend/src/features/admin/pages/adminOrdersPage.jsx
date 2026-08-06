import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  X,
  ShoppingBag,
  Clock,
  User,
  MapPin,
  Sparkles,
  CreditCard,
  Zap,
  PackageCheck,
  AlertTriangle,
  Bell,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminSidebar from "../components/adminSidebar";
import axiosInstance from "../../../shared/api/axiosInstance";
import { getStatusBadgeClass } from "../../../shared/utils/orderStatusColors";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Processing",
  "In Production",
  "Ready",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Helper to identify if an order requires fast delivery
const checkIsFastDelivery = (deliveryType) => {
  if (!deliveryType) return false;
  return deliveryType === "Fast Delivery" || deliveryType === "Fast Creation";
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [search, setSearch] = useState("");
  const [deliveryTab, setDeliveryTab] = useState("ALL"); // 'ALL', 'FAST', 'NORMAL'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("[fetchOrders Error]:", err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingOrders = async () => {
    setLoadingUpcoming(true);
    try {
      const res = await axiosInstance.get("/admin/orders/upcoming");
      setUpcomingOrders(res.data || []);
    } catch (err) {
      console.error("[fetchUpcomingOrders Error]:", err);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUpcomingOrders();
  }, []);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || "Confirmed");
  };

  const handleStatusChange = async (orderId, targetStatus) => {
    if (!orderId || !targetStatus) return;
    try {
      const res = await axiosInstance.patch(`/admin/orders/${orderId}/status`, {
        status: targetStatus,
      });

      if (res.data?.order) {
        toast.success("Order status updated successfully.");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: targetStatus } : o))
        );
        setUpcomingOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: targetStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: targetStatus } : prev));
          setNewStatus(targetStatus);
        }
      }
    } catch (err) {
      console.error("[handleStatusChange Error]:", err);
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  };

  const handleModalUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setIsUpdating(true);
    await handleStatusChange(selectedOrder._id, newStatus);
    setIsUpdating(false);
  };

  // Separate orders into counts
  const fastOrdersCount = orders.filter((o) => checkIsFastDelivery(o.deliveryType)).length;
  const normalOrdersCount = orders.filter((o) => !checkIsFastDelivery(o.deliveryType)).length;

  // Filter orders by delivery type tab, search, and status
  const filteredOrders = orders.filter((order) => {
    const isFast = checkIsFastDelivery(order.deliveryType);

    if (deliveryTab === "FAST" && !isFast) return false;
    if (deliveryTab === "NORMAL" && isFast) return false;

    const matchesSearch =
      order._id?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.deliveryAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      order.clothingType?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatusFilter === "ALL" || order.orderStatus === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f4f5fa" }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1c1c2e" }}>
              Customer Orders Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Separate fast & normal delivery orders, monitor upcoming deadlines, and manage order statuses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, customers..."
                className="pl-9 pr-4 py-2 rounded-xl text-xs border outline-none bg-white w-64 shadow-sm"
                style={{ borderColor: "#ede8e0" }}
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border outline-none bg-white shadow-sm"
              style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* ⏰ UPCOMING DELIVERIES NOTIFICATION SECTION */}
        <div className="mb-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Bell size={18} className="animate-bounce" />
              </div>
              <div>
                <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  Upcoming Deliveries Notification
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    {upcomingOrders.length} Due Soon
                  </span>
                </h2>
                <p className="text-[11px] text-amber-800">
                  Automatically checked by Cron Job. Orders approaching expected delivery date within 3 days.
                </p>
              </div>
            </div>

            <button
              onClick={fetchUpcomingOrders}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-700"
            >
              Refresh Status
            </button>
          </div>

          {loadingUpcoming ? (
            <div className="text-xs text-amber-800 py-3 text-center">Checking upcoming deliveries...</div>
          ) : upcomingOrders.length === 0 ? (
            <div className="bg-white/80 rounded-xl p-3.5 text-center text-xs text-emerald-700 font-bold border border-emerald-100 flex items-center justify-center gap-2">
              <PackageCheck size={16} /> No urgent or approaching deliveries right now. All orders are on schedule!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingOrders.map((order) => {
                const isFast = checkIsFastDelivery(order.deliveryType);
                const shortId = order._id ? order._id.slice(-6).toUpperCase() : "N/A";
                const customerName = order.deliveryAddress?.fullName || order.user?.name || "Customer";
                const deliveryDateStr = order.expectedDeliveryDate
                  ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A";

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl p-3.5 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                    style={{ borderColor: isFast ? "#fde68a" : "#e2e8f0" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-gray-900">#{shortId}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${
                              isFast
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {isFast ? <Zap size={10} className="fill-amber-500" /> : <Clock size={10} />}
                            {isFast ? "Fast Delivery" : "Normal Delivery"}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-gray-800 mt-1">{customerName}</div>
                      </div>

                      <StatusBadge status={order.orderStatus} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 mt-1">
                      <span className="text-gray-500 flex items-center gap-1 font-semibold text-[11px]">
                        <Clock size={12} className="text-amber-600" />
                        Expected: <strong className="text-gray-900">{deliveryDateStr}</strong>
                      </span>

                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#2d3358] hover:opacity-90 transition-opacity"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ⚡ DELIVERY TYPE TABS (FAST vs NORMAL DELIVERIES SEPARATION) */}
        <div className="flex items-center justify-between border-b mb-6 pb-2" style={{ borderColor: "#ede8e0" }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeliveryTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                deliveryTab === "ALL"
                  ? "bg-[#2d3358] text-white shadow-md"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
              style={{ borderColor: deliveryTab === "ALL" ? "#2d3358" : "#ede8e0" }}
            >
              All Orders
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  deliveryTab === "ALL" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setDeliveryTab("FAST")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                deliveryTab === "FAST"
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Zap size={14} className="fill-current" />
              Fast Delivery Orders
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  deliveryTab === "FAST" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-950"
                }`}
              >
                {fastOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setDeliveryTab("NORMAL")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                deliveryTab === "NORMAL"
                  ? "bg-[#4a5280] text-white shadow-md"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
              style={{ borderColor: deliveryTab === "NORMAL" ? "#4a5280" : "#ede8e0" }}
            >
              Normal Delivery Orders
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  deliveryTab === "NORMAL" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {normalOrdersCount}
              </span>
            </button>
          </div>

          <span className="text-xs font-bold text-gray-400">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#ede8e0" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-wider text-[11px]"
                  style={{ borderColor: "#ede8e0" }}
                >
                  <th className="py-4 px-5">Order ID</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Delivery Type</th>
                  <th className="py-4 px-5">Dress</th>
                  <th className="py-4 px-5">Expected Date</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Payment Method</th>
                  <th className="py-4 px-5">Order Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#ede8e0" }}>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-gray-400 font-medium">
                      Loading customer orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-gray-400 font-medium">
                      No orders found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isFast = checkIsFastDelivery(order.deliveryType);

                    return (
                      <tr
                        key={order._id || Math.random()}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isFast ? "bg-amber-50/20" : ""
                        }`}
                      >
                        {/* Order ID */}
                        <td className="py-3.5 px-5 font-extrabold text-[#1c1c2e]">
                          #{order._id ? order._id.slice(-6).toUpperCase() : "N/A"}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-gray-800">
                            {order.deliveryAddress?.fullName || order.user?.name || "Customer"}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {order.deliveryAddress?.phone || order.user?.phone || order.deliveryAddress?.email || "N/A"}
                          </div>
                        </td>

                        {/* Delivery Type Badge */}
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-xs ${
                              isFast
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {isFast ? <Zap size={12} className="fill-amber-500 text-amber-600" /> : <Clock size={12} className="text-gray-500" />}
                            {order.deliveryType || "Normal Delivery"}
                          </span>
                        </td>

                        {/* Dress */}
                        <td className="py-3.5 px-5 font-bold text-[#4a5280]">
                          {order.clothingType || "Custom Dress"}
                        </td>

                        {/* Expected Delivery Date */}
                        <td className="py-3.5 px-5 font-bold text-gray-700 text-[11px]">
                          {order.expectedDeliveryDate
                            ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-5 font-black text-gray-900">₹{order.totalAmount ?? 0}</td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-gray-800 block">
                            {order.paymentMethod || "COD"}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold ${
                              order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {order.paymentStatus || "Pending"}
                          </span>
                        </td>

                        {/* Order Status Selector */}
                        <td className="py-3.5 px-5">
                          <select
                            value={order.orderStatus || "Pending"}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border outline-none bg-gray-50 transition-colors cursor-pointer hover:border-[#4a5280]"
                            style={{ borderColor: "#ede8e0", color: "#1c1c2e" }}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleOpenDetails(order)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 ml-auto shadow-sm transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#2d3358" }}
                          >
                            <Eye size={13} />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#2d3358] text-white shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-amber-400" />
                <h2 className="text-lg font-extrabold tracking-wide">
                  Order Details — #{selectedOrder._id?.substring(selectedOrder._id.length - 8).toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Order Status Update Header Section */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-amber-900 font-bold">Current Order Status:</span>
                    <StatusBadge status={selectedOrder.orderStatus} />
                  </div>
                  {selectedOrder.expectedDeliveryDate && (
                    <span className="text-[11px] font-semibold text-emerald-800 block mt-1">
                      Expected Delivery Date:{" "}
                      {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border outline-none bg-white shadow-sm cursor-pointer"
                    style={{ borderColor: "#ede8e0" }}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleModalUpdateStatus}
                    disabled={isUpdating || newStatus === selectedOrder.orderStatus}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
                    style={{ backgroundColor: "#2d3358" }}
                  >
                    {isUpdating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>

              {/* Grid Layout: Customer Info & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
                  <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                    <User size={15} className="text-[#4a5280]" />
                    Customer Information
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Name:</span>
                    <span className="font-bold text-gray-800">{selectedOrder.deliveryAddress?.fullName || selectedOrder.user?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Email:</span>
                    <span className="font-bold text-gray-800">{selectedOrder.deliveryAddress?.email || selectedOrder.user?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Phone:</span>
                    <span className="font-bold text-gray-800">{selectedOrder.deliveryAddress?.phone || selectedOrder.user?.phone || "N/A"}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
                  <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                    <MapPin size={15} className="text-[#4a5280]" />
                    Delivery Address
                  </h3>
                  <div className="text-gray-700 font-medium leading-relaxed">
                    <p className="font-bold text-gray-900">{selectedOrder.deliveryAddress?.fullName}</p>
                    <p>{selectedOrder.deliveryAddress?.address}</p>
                    <p>
                      {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                    </p>
                    <p>{selectedOrder.deliveryAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Customized Dress Specifications */}
              <div className="p-4 rounded-2xl bg-gray-50 border space-y-3" style={{ borderColor: "#ede8e0" }}>
                <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                  <Sparkles size={15} className="text-amber-500" />
                  Customized Dress Specifications ({selectedOrder.clothingType})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <SpecTile label="Clothing Type" value={selectedOrder.clothingType} />
                  <SpecTile label="Fabric" value={selectedOrder.selections?.fabric} />
                  <SpecTile label="Color" value={selectedOrder.selections?.color} />
                  <SpecTile label="Sleeve" value={selectedOrder.selections?.sleeveType} />
                  <SpecTile label="Neck" value={selectedOrder.selections?.neckType} />
                  <SpecTile label="Length" value={selectedOrder.selections?.length} />
                  <SpecTile label="Pattern" value={selectedOrder.selections?.pattern} />
                  <SpecTile label="Embroidery" value={selectedOrder.selections?.embroidery} />
                  <SpecTile label="Thread Work" value={selectedOrder.selections?.threadWork} />
                  <SpecTile label="Stone Work" value={selectedOrder.selections?.stoneWork} />
                  <SpecTile label="Fit" value={selectedOrder.selections?.fit} />
                  <SpecTile label="Delivery Speed" value={selectedOrder.deliveryType} highlight={checkIsFastDelivery(selectedOrder.deliveryType)} />
                </div>
              </div>

              {/* Price & Payment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Summary */}
                <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
                  <h3 className="font-extrabold text-sm text-[#1c1c2e] pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                    Price Summary
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Price:</span>
                    <span className="font-bold text-gray-800">₹{selectedOrder.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customization Charges:</span>
                    <span className="font-bold text-gray-800">₹{selectedOrder.customizationCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fast Creation Fee:</span>
                    <span className="font-bold text-gray-800">₹{selectedOrder.fastCreationCharge}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-black text-sm text-[#1c1c2e]" style={{ borderColor: "#ede8e0" }}>
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
                  <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                    <CreditCard size={15} className="text-[#4a5280]" />
                    Payment Details
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="font-bold text-gray-800">{selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : "UPI / Online Payment"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status:</span>
                    <span className={`font-bold ${selectedOrder.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  {selectedOrder.stripeSessionId && (
                    <div className="flex flex-col pt-1">
                      <span className="text-gray-400 text-[10px]">Stripe Session ID:</span>
                      <span className="font-mono text-[10px] text-gray-700 break-all">{selectedOrder.stripeSessionId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const safeStatus = status || "Pending";
  const badgeClass = getStatusBadgeClass(safeStatus);

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeClass}`}
    >
      {safeStatus}
    </span>
  );
};

const SpecTile = ({ label, value, highlight }) => {
  if (!value) return null;
  return (
    <div className={`p-2 rounded-lg border ${highlight ? "bg-amber-50/70 border-amber-200" : "bg-white border-gray-100"}`}>
      <span className="text-[10px] text-gray-400 font-medium block">{label}</span>
      <span className={`font-bold text-xs ${highlight ? "text-amber-900" : "text-gray-800"}`}>{value}</span>
    </div>
  );
};

export default AdminOrdersPage;
