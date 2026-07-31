import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const DEBOUNCE_MS = 250;

// Debounced live price calls — a customer dragging through options shouldn't
// fire a request per keystroke. This only ever powers the on-screen
// estimated price; there is no checkout or payment step to reconcile
// against.
const useLivePrice = (clothingType, selections) => {
  const [price, setPrice] = useState({ base: 0, extras: 0, total: 0 });
  const [isCalculating, setIsCalculating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!clothingType) return;

    setIsCalculating(true);
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.post("/customization/price/calculate", {
          clothingType,
          selections,
        });
        setPrice(res.data);
      } catch {
        // Leave the last known good price on screen rather than blanking it.
      } finally {
        setIsCalculating(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [clothingType, JSON.stringify(selections)]);

  return { price, isCalculating };
};

export default useLivePrice;