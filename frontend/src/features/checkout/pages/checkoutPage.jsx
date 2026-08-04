import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, CheckCircle2, CreditCard, Truck, ShieldCheck, Sparkles, MapPin, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../user/components/sidebar";
import axiosInstance from "../../../shared/api/axiosInstance";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  // Retrieve checkout data passed from Finish & Review modal or fallback
  const checkoutData = location.state?.checkoutData || {
    title: "Custom Kurti",
    clothingType: "Kurti",
    selections: {
      fabric: "Cotton",
      color: "Royal Purple",
      sleeveType: "Puff Sleeve",
      neckType: "Round Neck",
      length: "Short",
      pattern: "Floral",
      embroidery: "Handwork",
      threadWork: "Golden Thread",
      stoneWork: "Heavy",
      fit: "Regular Fit",
      gender: "Women",
    },
    measurements: {},
    basePrice: 1200,
    customizationCharges: 300,
    fastCreationFee: 300,
    totalPrice: 1800,
    deliveryType: "Fast Creation",
  };

  // Delivery address form state pre-filled with logged-in user details if available
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [addressErrors, setAddressErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" or "ONLINE"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if payment was cancelled from Stripe redirect
  useEffect(() => {
    if (searchParams.get("cancelled") === "true") {
      toast.error("Stripe payment was cancelled. You can select Cash on Delivery or try online payment again.", {
        duration: 5000,
      });
    }
  }, [searchParams]);

  const {
    title,
    clothingType,
    selections = {},
    measurements = {},
    basePrice = 799,
    customizationCharges = 0,
    fastCreationFee = 0,
    totalPrice = 799,
    deliveryType = "Standard Creation",
  } = checkoutData;

  const handleInputChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!addressForm.fullName.trim()) errors.fullName = "Full Name is required";
    if (!addressForm.phone.trim()) errors.phone = "Phone Number is required";
    if (!addressForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!addressForm.address.trim()) errors.address = "Street Address is required";
    if (!addressForm.city.trim()) errors.city = "City is required";
    if (!addressForm.state.trim()) errors.state = "State is required";
    if (!addressForm.pincode.trim()) errors.pincode = "Pincode is required";
    if (!addressForm.country.trim()) errors.country = "Country is required";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required delivery details before proceeding.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        title,
        clothingType: clothingType || selections.clothingType || "Custom Dress",
        selections,
        measurements,
        deliveryAddress: {
          fullName: addressForm.fullName.trim(),
          phone: addressForm.phone.trim(),
          email: addressForm.email.trim(),
          address: addressForm.address.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pincode: addressForm.pincode.trim(),
          country: addressForm.country.trim(),
        },
        deliveryType,
        basePrice,
        customizationCharges,
        fastCreationCharge: fastCreationFee,
        totalAmount: totalPrice,
        paymentMethod,
      };

      if (paymentMethod === "COD") {
        // Cash on Delivery Flow
        const res = await axiosInstance.post("/orders/cod", orderPayload);
        if (res.data?.success) {
          toast.success("Order confirmed successfully!");
          navigate("/checkout/success", { state: { order: res.data.order } });
        }
      } else if (paymentMethod === "ONLINE") {
        // UPI / Online Payment via Stripe Test Mode
        const res = await axiosInstance.post("/orders/create-stripe-session", orderPayload);
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          toast.error("Failed to create Stripe payment session.");
        }
      }
    } catch (err) {
      console.error("[Checkout Error]:", err);
      toast.error(err.response?.data?.message || "Failed to process order. Please check backend setup.");
    } finally {
      setIsSubmitting(false);
    }
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
            <div>
              <h1 className="font-extrabold text-base" style={{ color: "#1c1c2e" }}>
                Checkout & Review
              </h1>
              <p className="text-xs text-gray-400">Enter delivery address & select payment method</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-700 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: "#4a5280" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-7 py-6">
          {searchParams.get("cancelled") === "true" && (
            <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>Stripe test payment was cancelled. You can complete your order using Cash on Delivery or retry online payment.</span>
            </div>
          )}

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Delivery Address & Customized Garment Specs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Delivery Address Form */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-4" style={{ borderColor: "#ede8e0" }}>
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "#ede8e0" }}>
                  <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: "#1c1c2e" }}>
                    <MapPin size={18} className="text-[#4a5280]" />
                    Delivery Address
                  </h2>
                  <span className="text-[11px] text-gray-400 font-medium">* Required for shipping</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.fullName ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.fullName ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.fullName && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={addressForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.phone ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.phone ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.phone && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={addressForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="e.g. ananya@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.email ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.email ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.email && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="House No., Building, Street Name, Area"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.address ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.address ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.address && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="e.g. Mumbai"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.city ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.city ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.city && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.state ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.state ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.state && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      placeholder="e.g. 400001"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.pincode ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.pincode ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.pincode && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.pincode}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="e.g. India"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-medium ${
                        addressErrors.country ? "border-red-500 bg-red-50/50" : "focus:border-[#4a5280]"
                      }`}
                      style={{ borderColor: addressErrors.country ? "#ef4444" : "#ede8e0" }}
                    />
                    {addressErrors.country && <p className="text-[10px] text-red-500 mt-1 font-semibold">{addressErrors.country}</p>}
                  </div>
                </div>
              </div>

              {/* Customized Dress Specifications */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "#ede8e0" }}>
                <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: "#ede8e0" }}>
                  <h2 className="text-base font-extrabold" style={{ color: "#1c1c2e" }}>
                    Customized Dress Details
                  </h2>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500" />
                    {clothingType || "Custom Outfit"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <SpecTile label="Clothing Type" value={clothingType} />
                  <SpecTile label="Fabric" value={selections.fabric} />
                  <SpecTile label="Color" value={selections.color} />
                  <SpecTile label="Sleeve" value={selections.sleeveType} />
                  <SpecTile label="Neck" value={selections.neckType} />
                  <SpecTile label="Length" value={selections.length} />
                  <SpecTile label="Pattern" value={selections.pattern} />
                  <SpecTile label="Embroidery" value={selections.embroidery} />
                  <SpecTile label="Thread Work" value={selections.threadWork} />
                  <SpecTile label="Stone Work" value={selections.stoneWork} />
                  <SpecTile label="Fit" value={selections.fit} />
                  <SpecTile label="Creation Option" value={deliveryType} highlight />
                </div>
              </div>
            </div>

            {/* Right Column: Payment Method & Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-4" style={{ borderColor: "#ede8e0" }}>
                <h2 className="text-base font-extrabold" style={{ color: "#1c1c2e" }}>
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "COD" ? "border-[#4a5280] bg-[#f5f6fa]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="accent-[#4a5280] w-4 h-4"
                      />
                      <div>
                        <span className="font-bold text-xs text-[#1c1c2e] block">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-gray-500">Pay cash upon delivery of your tailored dress.</span>
                      </div>
                    </div>
                    <Truck size={20} className="text-gray-400" />
                  </label>

                  {/* UPI / Online Payment */}
                  <label
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "ONLINE" ? "border-[#4a5280] bg-[#f5f6fa]" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ONLINE"
                        checked={paymentMethod === "ONLINE"}
                        onChange={() => setPaymentMethod("ONLINE")}
                        className="accent-[#4a5280] w-4 h-4"
                      />
                      <div>
                        <span className="font-bold text-xs text-[#1c1c2e] block">UPI / Online Payment (Stripe Test Mode)</span>
                        <span className="text-[11px] text-gray-500">Pay securely via Cards or UPI using Stripe test credentials.</span>
                      </div>
                    </div>
                    <CreditCard size={20} className="text-[#4a5280]" />
                  </label>
                </div>
              </div>

              {/* Price Summary & Submit */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-4" style={{ borderColor: "#ede8e0" }}>
                <h2 className="text-base font-extrabold pb-2 border-b" style={{ color: "#1c1c2e", borderColor: "#ede8e0" }}>
                  Price Summary
                </h2>

                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Base Garment Price</span>
                    <span className="font-semibold text-gray-800">₹{basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customization Charges</span>
                    <span className="font-semibold text-gray-800">₹{customizationCharges}</span>
                  </div>
                  {fastCreationFee > 0 && (
                    <div className="flex justify-between text-amber-800 font-medium">
                      <span>Fast Creation Option</span>
                      <span>+₹{fastCreationFee}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t flex justify-between items-center text-sm" style={{ borderColor: "#ede8e0" }}>
                    <span className="font-extrabold text-[#1c1c2e]">Final Total Price</span>
                    <span className="text-xl font-black text-[#1c1c2e]">₹{totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#1c1c2e" }}
                >
                  <ShieldCheck size={18} className="text-amber-400" />
                  {isSubmitting
                    ? "Processing..."
                    : paymentMethod === "COD"
                    ? "Confirm Order (COD)"
                    : "Proceed to Stripe Payment"}
                </button>

                <div className="p-3 bg-gray-50 rounded-xl border text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5" style={{ borderColor: "#ede8e0" }}>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>{paymentMethod === "COD" ? "No payment required now. Pay on delivery." : "Stripe Test Mode handles fake test payments safely."}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SpecTile = ({ label, value, highlight }) => {
  if (!value) return null;
  return (
    <div className={`p-2.5 rounded-xl border ${highlight ? "bg-amber-50/60 border-amber-200" : "bg-gray-50/80 border-gray-100"}`}>
      <span className="text-[11px] text-gray-400 font-medium block">{label}</span>
      <span className={`font-bold text-xs ${highlight ? "text-amber-900" : "text-gray-800"}`}>{value}</span>
    </div>
  );
};

export default CheckoutPage;
