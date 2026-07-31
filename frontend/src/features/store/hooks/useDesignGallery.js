import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

// Powers the Store Home showcase sections. There is nothing here that
// touches price-for-sale, stock, or a cart — it's read-only gallery data.
const useDesignGallery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFeaturedDesigns = async (limit = 8) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/store/designs/featured", { params: { limit } });
      return { success: true, designs: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load featured designs";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentDesigns = async (limit = 8) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/store/designs/recent", { params: { limit } });
      return { success: true, designs: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load recently designed dresses";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/store/categories");
      return { success: true, categories: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load categories" };
    }
  };

  return { isLoading, error, fetchFeaturedDesigns, fetchRecentDesigns, fetchCategories };
};

export default useDesignGallery;