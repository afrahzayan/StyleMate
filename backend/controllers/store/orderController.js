const Order = require("../../models/store/orderModel");
const Stripe = require("stripe");
const { calculateExpectedDeliveryDate, FAST_DELIVERY_CHARGE } = require("../../config/deliveryConfig");

// Helper function to safely get Stripe instance with clear console error if secret key is missing
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim() === "" || secretKey.includes("YOUR_STRIPE_TEST_SECRET_KEY_HERE")) {
    console.error("[Stripe Error]: STRIPE_SECRET_KEY is missing or set to placeholder in backend/.env!");
    return null;
  }
  return new Stripe(secretKey);
};

// Helper function to validate delivery address fields
const validateDeliveryAddress = (address) => {
  if (!address) return "Delivery address is required.";
  const { fullName, phone, email, address: street, city, state, pincode, country } = address;
  if (!fullName || !fullName.trim()) return "Full Name is required.";
  if (!phone || !phone.trim()) return "Phone Number is required.";
  if (!email || !email.trim()) return "Email is required.";
  if (!street || !street.trim()) return "Address is required.";
  if (!city || !city.trim()) return "City is required.";
  if (!state || !state.trim()) return "State is required.";
  if (!pincode || !pincode.trim()) return "Pincode is required.";
  if (!country || !country.trim()) return "Country is required.";
  return null;
};

// 1. Create Cash on Delivery (COD) Order
const createCodOrder = async (req, res) => {
  try {
    const {
      title,
      clothingType,
      selections = {},
      measurements = {},
      deliveryAddress,
      deliveryType = "Standard Creation",
      basePrice = 0,
      customizationCharges = 0,
      fastCreationCharge = 0,
      totalAmount,
    } = req.body;

    // Validate delivery address
    const addressError = validateDeliveryAddress(deliveryAddress);
    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    if (!clothingType || !totalAmount) {
      return res.status(400).json({ message: "clothingType and totalAmount are required." });
    }

    const isFast = deliveryType === "Fast Delivery" || deliveryType === "Fast Creation";
    const computedFastCharge = isFast ? (fastCreationCharge || FAST_DELIVERY_CHARGE) : 0;
    const expectedDeliveryDate = calculateExpectedDeliveryDate(deliveryType);

    const newOrder = await Order.create({
      user: req.userId,
      title: title || `${clothingType} Order`,
      clothingType,
      selections,
      measurements,
      deliveryAddress,
      deliveryType,
      expectedDeliveryDate,
      basePrice,
      customizationCharges,
      fastCreationCharge: computedFastCharge,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Order confirmed successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("[createCodOrder Error]:", err.message);
    return res.status(500).json({ message: err.message || "Failed to create order." });
  }
};

// 2. Create Stripe Checkout Session (UPI / Online Payment)
const createStripeSession = async (req, res) => {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      console.error("[Stripe Error]: Stripe instance could not be created.");
      return res.status(500).json({
        message: "Stripe key missing. Please paste your Stripe Test Secret Key (starts with sk_test_) into backend/.env as STRIPE_SECRET_KEY=sk_test_...",
      });
    }

    const {
      title,
      clothingType,
      selections = {},
      measurements = {},
      deliveryAddress,
      deliveryType = "Standard Creation",
      basePrice = 0,
      customizationCharges = 0,
      fastCreationCharge = 0,
      totalAmount,
    } = req.body;

    // Validate delivery address
    const addressError = validateDeliveryAddress(deliveryAddress);
    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    if (!clothingType || !totalAmount) {
      return res.status(400).json({ message: "clothingType and totalAmount are required." });
    }

    const isFast = deliveryType === "Fast Delivery" || deliveryType === "Fast Creation";
    const computedFastCharge = isFast ? (fastCreationCharge || FAST_DELIVERY_CHARGE) : 0;
    const expectedDeliveryDate = calculateExpectedDeliveryDate(deliveryType);

    // Save pending order in DB
    const pendingOrder = await Order.create({
      user: req.userId,
      title: title || `${clothingType} Order`,
      clothingType,
      selections,
      measurements,
      deliveryAddress,
      deliveryType,
      expectedDeliveryDate,
      basePrice,
      customizationCharges,
      fastCreationCharge: computedFastCharge,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: deliveryAddress?.email || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: title || `Custom ${clothingType}`,
                description: `Customized ${clothingType} (${deliveryType})`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${pendingOrder._id}`,
        cancel_url: `${clientUrl}/checkout?cancelled=true`,
      });
    } catch (primaryErr) {
      console.warn("[Stripe INR session create failed, trying USD fallback]:", primaryErr.message);
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: deliveryAddress?.email || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: title || `Custom ${clothingType}`,
                description: `Customized ${clothingType} (${deliveryType})`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${pendingOrder._id}`,
        cancel_url: `${clientUrl}/checkout?cancelled=true`,
      });
    }

    // Save stripe session id
    pendingOrder.stripeSessionId = session.id;
    await pendingOrder.save();

    return res.status(200).json({
      success: true,
      url: session.url,
      orderId: pendingOrder._id,
    });
  } catch (err) {
    console.error("[createStripeSession Error]:", err.stack || err.message);
    return res.status(500).json({
      message: err.type === "StripeError" || err.raw?.message
        ? `Stripe Error: ${err.raw?.message || err.message}`
        : err.message || "Failed to create Stripe payment session.",
    });
  }
};

// 3. Confirm Stripe Online Payment after test payment
const confirmStripePayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (sessionId) {
      order = await Order.findOne({ stripeSessionId: sessionId });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order payment confirmed successfully!",
      order,
    });
  } catch (err) {
    console.error("[confirmStripePayment Error]:", err.message);
    return res.status(500).json({ message: "Failed to confirm payment." });
  }
};

// 4. Get User Orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    console.error("[getUserOrders Error]:", err.message);
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
};

// 5. Get Order By ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.status(200).json(order);
  } catch (err) {
    console.error("[getOrderById Error]:", err.message);
    return res.status(500).json({ message: "Failed to fetch order details." });
  }
};

// 6. Delete Order (User deletes their own order)
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Order.findByIdAndDelete(orderId);

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (err) {
    console.error("[deleteOrder Error]:", err.message);
    return res.status(500).json({ message: "Failed to delete order." });
  }
};

module.exports = {
  createCodOrder,
  createStripeSession,
  confirmStripePayment,
  getUserOrders,
  getOrderById,
  deleteOrder,
};
