// Centralized delivery service charges & delivery timeline rules

const FAST_DELIVERY_CHARGE = 300;
const NORMAL_DELIVERY_DAYS = 7;
const FAST_DELIVERY_DAYS = 4;

const calculateExpectedDeliveryDate = (deliveryType, fromDate = new Date()) => {
  const isFast = deliveryType === "Fast Delivery" || deliveryType === "Fast Creation";
  const daysToAdd = isFast ? FAST_DELIVERY_DAYS : NORMAL_DELIVERY_DAYS;
  const date = new Date(fromDate);
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

module.exports = {
  FAST_DELIVERY_CHARGE,
  NORMAL_DELIVERY_DAYS,
  FAST_DELIVERY_DAYS,
  calculateExpectedDeliveryDate,
};
