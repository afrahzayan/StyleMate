import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const useAiSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSuggestions = async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/ai-suggestions/generate", payload);
      return { success: true, suggestion: res.data.suggestion };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate suggestions";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateSuggestions = async (batchId) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post(`/ai-suggestions/${batchId}/regenerate`);
      return { success: true, suggestion: res.data.suggestion };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to regenerate suggestions";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const saveSuggestedOutfit = async (batchId, suggestionIndex, name) => {
    try {
      const res = await axiosInstance.post(`/ai-suggestions/${batchId}/save`, { suggestionIndex, name });
      return { success: true, outfit: res.data.outfit };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to save outfit" };
    }
  };

  const toggleSuggestionFavorite = async (batchId, suggestionIndex) => {
    try {
      const res = await axiosInstance.patch(`/ai-suggestions/${batchId}/favorite`, { suggestionIndex });
      return { success: true, outfit: res.data.outfit };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update favorite" };
    }
  };

  const fetchHistory = async ({ page, limit } = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/ai-suggestions/history", { params: { page, limit } });
      return { success: true, batches: res.data.batches, total: res.data.total, pages: res.data.pages };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load history";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestionById = async (id) => {
    try {
      const res = await axiosInstance.get(`/ai-suggestions/${id}`);
      return { success: true, suggestion: res.data.suggestion };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load suggestion" };
    }
  };

  const deleteSuggestion = async (id) => {
    try {
      await axiosInstance.delete(`/ai-suggestions/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete" };
    }
  };

  return {
    isLoading,
    error,
    generateSuggestions,
    regenerateSuggestions,
    saveSuggestedOutfit,
    toggleSuggestionFavorite,
    fetchHistory,
    fetchSuggestionById,
    deleteSuggestion,
  };
};

export default useAiSuggestions;