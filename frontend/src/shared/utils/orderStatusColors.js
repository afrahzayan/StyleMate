// Shared Order Status Colors & Badge Styles
// Used consistently across Admin Dashboard, Admin Orders, Admin Details, User Orders, and User Details.

export const STATUS_CONFIG = {
  Pending: {
    hex: "#f59e0b",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    text: "text-amber-600",
    stepIndex: 0,
  },
  Confirmed: {
    hex: "#3b82f6",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    text: "text-blue-600",
    stepIndex: 1,
  },
  Processing: {
    hex: "#a855f7",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    text: "text-purple-600",
    stepIndex: 2,
  },
  "In Production": {
    hex: "#6366f1",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
    text: "text-indigo-600",
    stepIndex: 3,
  },
  Ready: {
    hex: "#06b6d4",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-300",
    text: "text-cyan-600",
    stepIndex: 4,
  },
  Shipped: {
    hex: "#0ea5e9",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    text: "text-sky-600",
    stepIndex: 5,
  },
  Delivered: {
    hex: "#10b981",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    text: "text-emerald-600",
    stepIndex: 6,
  },
  Cancelled: {
    hex: "#ef4444",
    badge: "bg-red-100 text-red-800 border-red-300",
    text: "text-red-600",
    stepIndex: -1,
  },
};

export const getStatusBadgeClass = (status) => {
  return STATUS_CONFIG[status]?.badge || STATUS_CONFIG.Confirmed.badge;
};

export const getStatusHexColor = (status) => {
  return STATUS_CONFIG[status]?.hex || "#3b82f6";
};

export const ORDER_PROGRESS_STEPS = [
  "Pending",
  "Confirmed",
  "Processing",
  "In Production",
  "Ready",
  "Shipped",
  "Delivered",
];
