import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const useCustomizationOptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOptions = async (group) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/customization/options", { params: group ? { group } : {} });
      return { success: true, options: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load options";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularDesigns = async () => {
    try {
      const res = await axiosInstance.get("/customization/designs/popular");
      return { success: true, designs: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load designs" };
    }
  };

  const fetchAiRecommendations = async (answers) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/customization/ai/recommend", answers);
      return { success: true, recommendations: res.data.recommendations };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to get AI recommendations";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, fetchOptions, fetchPopularDesigns, fetchAiRecommendations };
};

export default useCustomizationOptions;