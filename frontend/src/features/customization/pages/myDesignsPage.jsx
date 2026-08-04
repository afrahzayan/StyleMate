import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Share2, Download, Send, Trash2, Scissors, ShoppingBag, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import useMyDesigns from "../hooks/useMyDesigns";
import { downloadDesignSummary } from "../utils/downloadDesignSummary";
import axiosInstance from "../../../shared/api/axiosInstance";
import { getStatusBadgeClass } from "../../../shared/utils/orderStatusColors";
import UserOrderDetailModal from "../components/userOrderDetailModal";
import { connectSocket, getSocket } from "../../../shared/socket/socket";

const CLOTHING_TYPE_IMAGES = {
  Shirt: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/shirt.png",
  "T-Shirt": "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/tshirt.png",
  Kurta: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/kurta.png",
  Kurti: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/kurti.png",
  Gown: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/gown.png",
  Dress: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/dress.png",
};

const getClothingImage = (item) => {
  if (item?.previewImage?.url && !item.previewImage.url.includes("placeholder")) {
    return item.previewImage.url;
  }
  const type = item?.clothingType || item?.selections?.clothingType || "Shirt";
  return CLOTHING_TYPE_IMAGES[type] || CLOTHING_TYPE_IMAGES.Shirt;
};

const MyDesignsPage = ({ view: initialView = "saved" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(activeTabFromQuery || initialView);

  const { user, accessToken } = useSelector((state) => state.auth);
  const { fetchMyDesigns, submitDesignRequest, deleteDesign, isLoading: isDesignsLoading } = useMyDesigns();
  const [designs, setDesigns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadData = async () => {
    if (activeTab === "orders") {
      setIsOrdersLoading(true);
      try {
        const res = await axiosInstance.get("/orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("[fetchOrders Error]:", err);
      } finally {
        setIsOrdersLoading(false);
      }
    } else {
      const result = await fetchMyDesigns(activeTab === "saved" ? "saved" : undefined);
      if (result.success) setDesigns(result.designs);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    const socket = connectSocket(accessToken);
    if (!socket) return undefined;

    const handleOrderStatusUpdate = (data) => {
      console.log("LIVE ORDER UPDATE RECEIVED:", data);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === data.orderId
            ? {
                ...order,
                orderStatus: data.status,
              }
            : order
        )
      );

      setSelectedOrder((currentSelected) =>
        currentSelected && currentSelected._id === data.orderId
          ? { ...currentSelected, orderStatus: data.status }
          : currentSelected
      );

      toast.success(data.message || `Order status updated to ${data.status}`);
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
    };
  }, [accessToken]);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await axiosInstance.delete(`/orders/${orderId}`);
      if (res.data?.success) {
        toast.success("Order deleted successfully.");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (err) {
      console.error("[handleDeleteOrder Error]:", err);
      toast.error(err.response?.data?.message || "Failed to delete order.");
    }
  };

  const handleShare = async (design) => {
    const shareUrl = `${window.location.origin}/customize?design=${design._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Design link copied to clipboard!");
    } catch {
      alert(shareUrl);
    }
  };

  const handleSubmit = async (design) => {
    const result = await submitDesignRequest(design._id);
    if (result.success) loadData();
  };

  const handleDelete = async (design) => {
    if (!window.confirm("Delete this design?")) return;
    const result = await deleteDesign(design._id);
    if (result.success) loadData();
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-7 py-4 bg-white border-b shrink-0"
          style={{ borderColor: "#ede8e0" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
              {activeTab === "saved" ? "Saved Custom Designs" : activeTab === "orders" ? "My Custom Orders" : "Design History"}
            </h1>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-700 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: "#4a5280" }}
            >
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-7 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === "saved"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                Saved Designs
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === "history"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                Design History
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  activeTab === "orders"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <ShoppingBag size={14} />
                My Orders
              </button>
            </div>

            <button
              onClick={() => navigate("/customize/new")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#4a5280] text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <Scissors size={14} />
              New Design
            </button>
          </div>

          {/* Orders View */}
          {activeTab === "orders" ? (
            <div>
              {isOrdersLoading && <p className="text-xs text-gray-400">Loading your placed orders...</p>}

              {!isOrdersLoading && orders.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "#ede8e0" }}>
                  <p className="text-sm font-semibold text-gray-600 mb-4">You haven't placed any custom dress orders yet.</p>
                  <button
                    onClick={() => navigate("/customize/new")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow"
                    style={{ backgroundColor: "#4a5280" }}
                  >
                    Customize & Order Now
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
                    style={{ borderColor: "#ede8e0" }}
                  >
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between" style={{ borderColor: "#ede8e0" }}>
                      <span className="font-extrabold text-xs text-[#1c1c2e]">
                        Order #{order._id?.substring(order._id.length - 6).toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus || "Confirmed"}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-20 bg-gray-100 rounded-xl border overflow-hidden shrink-0" style={{ borderColor: "#ede8e0" }}>
                          <img src={getClothingImage(order)} alt={order.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-sm text-[#1c1c2e]">{order.clothingType}</h3>
                          <p className="text-[11px] text-gray-500">
                            {order.selections?.fabric || "Custom Fabric"} • {order.selections?.color || "Custom Color"}
                          </p>
                          <p className="font-black text-sm text-[#1c1c2e]">₹{order.totalAmount}</p>
                        </div>
                      </div>

                      <div className="pt-2 text-xs space-y-1 text-gray-500 border-t" style={{ borderColor: "#ede8e0" }}>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-semibold text-gray-800">{order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI / Online"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Status:</span>
                          <span className={`font-semibold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order Date:</span>
                          <span className="font-semibold text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50/50 border-t flex items-center gap-2" style={{ borderColor: "#ede8e0" }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                        style={{ backgroundColor: "#2d3358" }}
                      >
                        <Eye size={14} />
                        View Details & Progress
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        title="Delete Order"
                        className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Designs View (Saved / History) */
            <div>
              {isDesignsLoading && <p className="text-xs text-gray-400">Loading your designs...</p>}

              {!isDesignsLoading && designs.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "#ede8e0" }}>
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    {activeTab === "saved" ? "You haven't saved any custom designs yet." : "No design history found."}
                  </p>
                  <button
                    onClick={() => navigate("/customize/new")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow"
                    style={{ backgroundColor: "#4a5280" }}
                  >
                    Start Designing Now
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {designs.map((design) => (
                  <div
                    key={design._id}
                    className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md"
                    style={{ borderColor: "#ede8e0" }}
                  >
                    <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                      <img
                        src={getClothingImage(design)}
                        alt={design.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-700 shadow-sm border border-gray-200">
                        {design.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate text-sm font-extrabold" style={{ color: "#1c1c2e" }}>
                          {design.title}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-[#4a5280]">Est. ₹{design.price}</p>
                      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "#ede8e0" }}>
                        <button
                          onClick={() => downloadDesignSummary(design)}
                          className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Download size={13} /> Summary
                        </button>
                        <button
                          onClick={() => handleShare(design)}
                          className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Share2 size={13} /> Share
                        </button>
                        {design.status === "saved" && (
                          <button
                            onClick={() => handleSubmit(design)}
                            className="flex items-center gap-1 rounded-xl bg-[#4a5280] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                          >
                            <Send size={13} /> Submit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(design)}
                          className="flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 ml-auto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Order Details Modal */}
      {selectedOrder && (
        <UserOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default MyDesignsPage;