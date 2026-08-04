import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ArrowRight, PackageCheck, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import axiosInstance from "../../../shared/api/axiosInstance";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (sessionId || orderId) {
      const confirmPayment = async () => {
        try {
          const res = await axiosInstance.post("/orders/confirm-stripe", { sessionId, orderId });
          if (res.data?.success) {
            setOrder(res.data.order);
            toast.success("Payment successful! Order confirmed.");
          }
        } catch (err) {
          console.error("[confirmPayment error]:", err);
          toast.error("Failed to confirm Stripe payment.");
        } finally {
          setLoading(false);
        }
      };
      confirmPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId, orderId]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-7 py-10 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border shadow-sm text-center space-y-6" style={{ borderColor: "#ede8e0" }}>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-[#1c1c2e] mb-1">
                Order Confirmed!
              </h1>
              <p className="text-xs text-gray-500">
                Thank you for your order. Our tailoring team will begin creating your custom dress.
              </p>
            </div>

            {loading ? (
              <div className="py-6 text-xs font-semibold text-gray-500">
                Confirming order details...
              </div>
            ) : order ? (
              <div className="p-4 rounded-2xl bg-gray-50 border text-left text-xs space-y-2" style={{ borderColor: "#ede8e0" }}>
                <div className="flex justify-between items-center pb-2 border-b font-bold text-gray-800" style={{ borderColor: "#ede8e0" }}>
                  <span>Order #{order._id?.substring(order._id.length - 8).toUpperCase()}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black">
                    {order.orderStatus || "Confirmed"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Garment Type:</span>
                  <span className="font-semibold text-gray-800">{order.clothingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="font-semibold text-gray-800">{order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI / Online Payment"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className={`font-semibold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Speed:</span>
                  <span className="font-semibold text-gray-800">{order.deliveryType}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-extrabold text-sm text-[#1c1c2e]" style={{ borderColor: "#ede8e0" }}>
                  <span>Total Amount Paid/Due:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate("/designs/history")}
                className="w-full py-3 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow"
                style={{ backgroundColor: "#1c1c2e" }}
              >
                <PackageCheck size={16} />
                View My Designs & Orders
              </button>

              <button
                onClick={() => navigate("/store")}
                className="w-full py-3 rounded-xl text-xs font-bold text-gray-700 border flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                style={{ borderColor: "#ede8e0" }}
              >
                <ShoppingBag size={15} />
                Return to Store Home
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
