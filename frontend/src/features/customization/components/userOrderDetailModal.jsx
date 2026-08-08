import { X, CheckCircle2, ShoppingBag, MapPin, Sparkles, CreditCard, AlertCircle, Clock, Check } from "lucide-react";
import { getStatusBadgeClass, ORDER_PROGRESS_STEPS } from "../../../shared/utils/orderStatusColors";

const CLOTHING_TYPE_IMAGES = {
  Shirt: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/shirt.png",
  "T-Shirt": "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/tshirt.png",
  Kurta: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/kurta.png",
  Kurti: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/kurti.png",
  Gown: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/gown.png",
  Dress: "https://res.cloudinary.com/kerygwxk/image/upload/v1700000000/StyleMate/onboarding/clothing/dress.png",
};

const getClothingImage = (order) => {
  const type = order?.clothingType || order?.selections?.clothingType || "Shirt";
  return CLOTHING_TYPE_IMAGES[type] || CLOTHING_TYPE_IMAGES.Shirt;
};

const UserOrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const isCancelled = order.orderStatus === "Cancelled";
  const currentStepIndex = ORDER_PROGRESS_STEPS.indexOf(order.orderStatus || "Confirmed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1c1c2e] text-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-400" />
            <h2 className="text-lg font-extrabold tracking-wide">
              Order Details — #{order._id?.substring(order._id.length - 8).toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Order Status Header & Badge */}
          <div className="p-4 rounded-2xl bg-gray-50 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderColor: "#ede8e0" }}>
            <div>
              <span className="text-xs text-gray-400 font-medium block">Current Status:</span>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getStatusBadgeClass(order.orderStatus)}`}>
                {order.orderStatus || "Confirmed"}
              </span>
            </div>
            <div className="text-right text-xs text-gray-400 space-y-1">
              <div>
                <span>Order Date: </span>
                <span className="font-semibold text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {order.expectedDeliveryDate && (
                <div>
                  <span>Expected Delivery: </span>
                  <span className="font-bold text-emerald-700">
                    {new Date(order.expectedDeliveryDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Progress Bar */}
          <div className="p-5 rounded-2xl bg-white border shadow-sm space-y-3" style={{ borderColor: "#ede8e0" }}>
            <h3 className="text-xs font-extrabold text-[#1c1c2e] flex items-center gap-1.5">
              <Clock size={15} className="text-[#4a5280]" />
              Order Progress
            </h3>

            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600 shrink-0" />
                <span>This order was cancelled. Please contact support or place a new custom design order.</span>
              </div>
            ) : (
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 overflow-x-auto pb-2 gap-2">
                  {ORDER_PROGRESS_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step} className="flex flex-col items-center min-w-[70px] text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${isCompleted
                              ? "bg-[#4a5280] text-white shadow-sm"
                              : "bg-gray-100 text-gray-400 border border-gray-200"
                            } ${isCurrent ? "ring-4 ring-[#4a5280]/20" : ""}`}
                        >
                          {isCompleted ? <Check size={14} /> : idx + 1}
                        </div>
                        <span className={`text-[10px] leading-tight ${isCurrent ? "font-extrabold text-[#1c1c2e]" : isCompleted ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Garment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
              <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                <MapPin size={15} className="text-[#4a5280]" />
                Delivery Address
              </h3>
              <div className="text-gray-700 font-medium leading-relaxed">
                <p className="font-bold text-gray-900">{order.deliveryAddress?.fullName}</p>
                <p>{order.deliveryAddress?.address}</p>
                <p>
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                </p>
                <p>{order.deliveryAddress?.country}</p>
                <p className="text-gray-400 text-[11px] mt-1">Phone: {order.deliveryAddress?.phone}</p>
              </div>
            </div>

            {/* Garment Image & Basic Info */}
            <div className="p-4 rounded-2xl bg-gray-50 border flex items-center gap-4 text-xs" style={{ borderColor: "#ede8e0" }}>
              <div className="w-24 h-28 bg-white rounded-xl border overflow-hidden shrink-0" style={{ borderColor: "#ede8e0" }}>
                <img src={getClothingImage(order)} alt={order.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-[#1c1c2e]">{order.title}</h4>
                <p className="font-semibold text-xs text-[#4a5280]">{order.clothingType}</p>
                <p className="text-[11px] text-gray-500">{order.deliveryType}</p>
                <p className="font-black text-sm text-gray-900 pt-1">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Customized Dress Specifications */}
          <div className="p-4 rounded-2xl bg-gray-50 border space-y-3" style={{ borderColor: "#ede8e0" }}>
            <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
              <Sparkles size={15} className="text-amber-500" />
              Customization Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <SpecTile label="Clothing Type" value={order.clothingType} />
              <SpecTile label="Fabric" value={order.selections?.fabric} />
              <SpecTile label="Color" value={order.selections?.color} />
              <SpecTile label="Sleeve" value={order.selections?.sleeveType} />
              <SpecTile label="Neck" value={order.selections?.neckType} />
              <SpecTile label="Length" value={order.selections?.length} />
              <SpecTile label="Pattern" value={order.selections?.pattern} />
              <SpecTile label="Embroidery" value={order.selections?.embroidery} />
              <SpecTile label="Thread Work" value={order.selections?.threadWork} />
              <SpecTile label="Stone Work" value={order.selections?.stoneWork} />
              <SpecTile label="Fit" value={order.selections?.fit} />
              <SpecTile label="Creation Speed" value={order.deliveryType} highlight />
            </div>
          </div>

          {/* Price Summary & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
              <h3 className="font-extrabold text-sm text-[#1c1c2e] pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                Price Summary
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-400">Base Garment Price:</span>
                <span className="font-bold text-gray-800">₹{order.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customization Charges:</span>
                <span className="font-bold text-gray-800">₹{order.customizationCharges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fast Creation Fee:</span>
                <span className="font-bold text-gray-800">₹{order.fastCreationCharge}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-black text-sm text-[#1c1c2e]" style={{ borderColor: "#ede8e0" }}>
                <span>Total Amount:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-2xl bg-gray-50 border space-y-2 text-xs" style={{ borderColor: "#ede8e0" }}>
              <h3 className="font-extrabold text-sm text-[#1c1c2e] flex items-center gap-1.5 pb-2 border-b" style={{ borderColor: "#ede8e0" }}>
                <CreditCard size={15} className="text-[#4a5280]" />
                Payment Information
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="font-bold text-gray-800">{order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI / Online Payment"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status:</span>
                <span className={`font-bold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

export default UserOrderDetailModal;
