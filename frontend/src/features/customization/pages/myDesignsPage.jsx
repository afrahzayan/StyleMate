import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Share2, Download, Trash2, Scissors, ShoppingBag, Eye, Edit3, CreditCard, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import useMyDesigns from "../hooks/useMyDesigns";
import { downloadDesignSummary } from "../utils/downloadDesignSummary";
import axiosInstance from "../../../shared/api/axiosInstance";
import { getStatusBadgeClass } from "../../../shared/utils/orderStatusColors";
import UserOrderDetailModal from "../components/userOrderDetailModal";
import { connectSocket } from "../../../shared/socket/socket";
import { getHexForOption } from "../components/questionnaire/optionStep";
import { buildFinalImagePublicId, buildFinalImageUrl, getClothingTypeImageUrl } from "../utils/cloudinaryLayer";

const getClothingImage = (item) => {
  if (
    item?.previewImage?.url &&
    !item.previewImage.url.includes("placeholder") &&
    !item.previewImage.url.includes("custom-design/final")
  ) {
    return item.previewImage.url;
  }
  const type = item?.clothingType || item?.selections?.clothingType || "Shirt";
  return getClothingTypeImageUrl(type);
};

const MyDesignsPage = ({ view: initialView = "saved" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(activeTabFromQuery || initialView);

  const { user, accessToken } = useSelector((state) => state.auth);
  const { fetchMyDesigns, deleteDesign, isLoading: isDesignsLoading } = useMyDesigns();
  const [designs, setDesigns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSavedDesign, setSelectedSavedDesign] = useState(null);

  const loadData = async () => {
    if (activeTab === "saved") {
      const result = await fetchMyDesigns("saved");
      if (result.success) setDesigns(result.designs);
    } else {
      // Both "history" and "orders" query placed orders from Order collection
      setIsOrdersLoading(true);
      try {
        const res = await axiosInstance.get("/orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("[fetchOrders Error]:", err);
      } finally {
        setIsOrdersLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    const socket = connectSocket(accessToken);
    if (!socket) return undefined;

    const handleOrderStatusUpdate = (data) => {
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
      toast.success("Design link copied to clipboard!");
    } catch {
      alert(shareUrl);
    }
  };

  const handleDelete = async (design) => {
    if (!window.confirm("Delete this design?")) return;
    const result = await deleteDesign(design._id);
    if (result.success) {
      toast.success("Saved design deleted.");
      loadData();
    }
  };

  const handleEditDesign = (design) => {
    navigate("/customize/new", { state: { editDesign: design } });
  };

  const handleProceedCheckoutFromSaved = (design) => {
    const checkoutData = {
      title: design.title || `${design.clothingType || "Custom"} Design`,
      clothingType: design.clothingType || "Custom Dress",
      previewImage: {
        url: getClothingImage(design),
        publicId: design.previewImage?.publicId || "",
      },
      selections: design.selections || {},
      basePrice: design.price || 799,
      customizationCharges: 0,
      creationSpeed: design.creationSpeed || "standard",
      fastCreationFee: design.fastCreationFee || 0,
      totalPrice: design.price || 799,
      deliveryType: design.creationSpeed === "fast" ? "Fast Delivery" : "Normal Delivery",
    };

    navigate("/checkout", { state: { checkoutData } });
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
              {activeTab === "saved"
                ? "Saved Custom Designs"
                : activeTab === "orders"
                  ? "My Custom Orders"
                  : "Design History (Ordered)"}
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
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === "saved"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
              >
                Saved Designs
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === "history"
                    ? "bg-[#4a5280] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
              >
                Design History
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${activeTab === "orders"
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

          {/* Saved Designs Tab View */}
          {activeTab === "saved" && (
            <div>
              {isDesignsLoading && <p className="text-xs text-gray-400">Loading your saved designs...</p>}

              {!isDesignsLoading && designs.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "#ede8e0" }}>
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    You haven't saved any custom designs yet.
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
                  <DesignCardItem
                    key={design._id}
                    item={design}
                    badgeText="Saved Design"
                    onViewDetails={() => setSelectedSavedDesign(design)}
                    onEdit={() => handleEditDesign(design)}
                    onDownloadSummary={() => downloadDesignSummary(design)}
                    onShare={() => handleShare(design)}
                    onDelete={() => handleDelete(design)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Design History Tab View (Uses Saved Designs card layout for placed orders) */}
          {activeTab === "history" && (
            <div>
              {isOrdersLoading && <p className="text-xs text-gray-400">Loading your design history...</p>}

              {!isOrdersLoading && orders.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "#ede8e0" }}>
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    No placed order history found. Customize and order a dress to add to your history!
                  </p>
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
                  <DesignCardItem
                    key={order._id}
                    item={{
                      ...order,
                      title: order.title || `${order.clothingType || "Custom"} Design`,
                      price: order.totalAmount || order.price || 799,
                    }}
                    badgeText="Ordered Design"
                    onViewDetails={() =>
                      setSelectedSavedDesign({
                        ...order,
                        title: order.title || `${order.clothingType || "Custom"} Design`,
                        price: order.totalAmount || order.price || 799,
                      })
                    }
                    onEdit={() => handleEditDesign(order)}
                    onDownloadSummary={() => downloadDesignSummary(order)}
                    onShare={() => handleShare(order)}
                    onDelete={() => handleDeleteOrder(order._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* My Orders Tab View (Detailed Order tracking UI) */}
          {activeTab === "orders" && (
            <div>
              {isOrdersLoading && <p className="text-xs text-gray-400">Loading your placed orders...</p>}

              {!isOrdersLoading && orders.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border" style={{ borderColor: "#ede8e0" }}>
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    You haven't placed any custom dress orders yet.
                  </p>
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
          )}
        </main>
      </div>

      {/* Saved / History Design Details Modal */}
      {selectedSavedDesign && (
        <SavedDesignDetailsModal
          design={selectedSavedDesign}
          onClose={() => setSelectedSavedDesign(null)}
          onEdit={() => {
            handleEditDesign(selectedSavedDesign);
            setSelectedSavedDesign(null);
          }}
          onCheckout={() => {
            handleProceedCheckoutFromSaved(selectedSavedDesign);
            setSelectedSavedDesign(null);
          }}
        />
      )}

      {/* User Order Details Modal */}
      {selectedOrder && (
        <UserOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

// Sub-component: Reusable Design Card (used by both Saved Designs and Design History)
const DesignCardItem = ({
  item,
  badgeText = "Saved Design",
  onViewDetails,
  onEdit,
  onDownloadSummary,
  onShare,
  onDelete,
}) => {
  const displayPrice = item.price || item.totalAmount || 799;

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
      style={{ borderColor: "#ede8e0" }}
    >
      <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden group">
        <img
          src={getClothingImage(item)}
          alt={item.title}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-700 shadow-sm border border-gray-200">
          {badgeText}
        </span>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <div>
          <h3 className="truncate text-sm font-extrabold text-[#1c1c2e]">{item.title}</h3>
          <p className="text-xs font-bold text-[#4a5280] mt-0.5">Est. ₹{displayPrice}</p>
        </div>

        <div className="pt-2 text-xs space-y-1 text-gray-500 border-t" style={{ borderColor: "#ede8e0" }}>
          <div className="flex justify-between">
            <span>Clothing Type:</span>
            <span className="font-bold text-gray-800">{item.clothingType}</span>
          </div>
          {item.selections?.fabric && (
            <div className="flex justify-between">
              <span>Fabric:</span>
              <span className="font-semibold text-gray-700">{item.selections.fabric}</span>
            </div>
          )}
          {item.selections?.color && (
            <div className="flex justify-between">
              <span>Color:</span>
              <span className="font-semibold text-gray-700">{item.selections.color}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-gray-50/50 border-t space-y-2" style={{ borderColor: "#ede8e0" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#2d3358" }}
          >
            <Eye size={13} />
            View Details
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#4a5280] border border-[#4a5280]/20 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 shadow-xs"
          >
            <Edit3 size={13} />
            Edit
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: "#ede8e0" }}>
          <button
            onClick={onDownloadSummary}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900"
          >
            <Download size={12} /> Summary
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900"
          >
            <Share2 size={12} /> Share
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline ml-auto"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Saved / History Design Details Modal
const SavedDesignDetailsModal = ({ design, onClose, onEdit, onCheckout }) => {
  const selections = design?.selections || {};
  const colorHex = selections.color ? getHexForOption(selections.color) : null;
  const imageSrc = getClothingImage(design);
  const isOrdered = Boolean(design.orderStatus || design.paymentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1c1c2e] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            <h2 className="text-lg font-extrabold tracking-wide">{design.title || "Custom Design Details"}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-44 h-56 bg-gray-100 rounded-2xl overflow-hidden border shadow-sm shrink-0" style={{ borderColor: "#ede8e0" }}>
              <img src={imageSrc} alt={design.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-2 w-full">
              <h3 className="font-extrabold text-lg text-[#1c1c2e]">{design.clothingType}</h3>
              <p className="text-xl font-black text-[#4a5280]">Est. Price: ₹{design.price || design.totalAmount}</p>
              <div className={`p-3 border rounded-xl text-xs font-semibold ${isOrdered ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-amber-50/70 border-amber-200 text-amber-900"}`}>
                Status: <span className="uppercase font-bold">{isOrdered ? "Ordered Design" : "Saved Design"}</span> {isOrdered ? "(Placed Order)" : "(Not yet ordered)"}
              </div>
            </div>
          </div>

          {/* Full Customization Specifications */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#1c1c2e] border-b pb-2" style={{ borderColor: "#ede8e0" }}>
              Customization Options & Specifications
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <SpecItem label="Clothing Type" value={design.clothingType} />
              <SpecItem label="Gender" value={selections.gender} />
              <SpecItem label="Fabric" value={selections.fabric} />
              <SpecItem
                label="Color"
                value={
                  <span className="flex items-center gap-1.5">
                    {selections.color || "Default"}
                    {colorHex && (
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
                    )}
                  </span>
                }
              />
              <SpecItem label="Sleeve Type" value={selections.sleeveType} />
              <SpecItem label="Neck Type" value={selections.neckType} />
              <SpecItem label="Length" value={selections.length} />
              <SpecItem label="Pattern" value={selections.pattern} />
              <SpecItem label="Embroidery" value={selections.embroidery} />
              <SpecItem label="Thread Work" value={selections.threadWork} />
              <SpecItem label="Stone Work" value={selections.stoneWork} />
              <SpecItem label="Fit" value={selections.fit} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t" style={{ borderColor: "#ede8e0" }}>
            <button
              onClick={onEdit}
              className="w-full sm:w-1/2 py-3 rounded-xl text-xs font-bold border border-[#4a5280] text-[#4a5280] bg-white hover:bg-gray-50 flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Edit3 size={15} />
              {isOrdered ? "Re-customize Design" : "Edit Design"}
            </button>

            <button
              onClick={onCheckout}
              className="w-full sm:w-1/2 py-3 rounded-xl text-xs font-extrabold text-white bg-[#1c1c2e] hover:opacity-90 flex items-center justify-center gap-2 shadow-md transition-opacity"
            >
              <CreditCard size={15} className="text-amber-400" />
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
      <span className="text-[10px] text-gray-400 font-medium block">{label}</span>
      <span className="font-bold text-xs text-gray-800">{value}</span>
    </div>
  );
};

export default MyDesignsPage;