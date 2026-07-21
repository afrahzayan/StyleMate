import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const useWardrobe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCloths = async ({ category, favorite } = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const params = {};
      if (category && category !== "All") params.category = category;
      if (favorite) params.favorite = "true";
      const res = await axiosInstance.get("/clothes", { params });
      return { success: true, cloths: res.data.cloths };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load wardrobe";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClothById = async (id) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/clothes/${id}`);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load item";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const addCloth = async (imageFile) => {
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await axiosInstance.post("/clothes", formData);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add item";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCloth = async (id, fields) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.patch(`/clothes/${id}`, fields);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save changes";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const res = await axiosInstance.patch(`/clothes/${id}/favorite`);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update" };
    }
  };

  const deleteCloth = async (id) => {
    try {
      await axiosInstance.delete(`/clothes/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete" };
    }
  };

  return {
    isLoading,
    error,
    fetchCloths,
    fetchClothById,
    addCloth,
    updateCloth,
    toggleFavorite,
    deleteCloth,
  };
};

export default useWardrobe;