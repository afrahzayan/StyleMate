import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

// Wardrobe state is per-page (fetched fresh on each visit) rather than
// global Redux state, since it's list/detail CRUD data rather than
// app-wide auth state — matches the scope of what's actually shared
// across the app right now.
const useWardrobe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── FETCH ALL (optionally filtered) ─────────────────────────
  const fetchCloths = async (category) => {
    setIsLoading(true);
    setError("");
    try {
      const params = category && category !== "All" ? { category } : {};
      const res = await axiosInstance.get("/cloths", { params });
      return { success: true, cloths: res.data.cloths };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load wardrobe";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── FETCH ONE ────────────────────────────────────────────────
  const fetchClothById = async (id) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/cloths/${id}`);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load item";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── ADD (upload image, AI analyzes, auto-saves) ─────────────
  const addCloth = async (imageFile) => {
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await axiosInstance.post("/cloths", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add item";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── UPDATE ───────────────────────────────────────────────────
  const updateCloth = async (id, fields) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.patch(`/cloths/${id}`, fields);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save changes";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── TOGGLE FAVORITE ──────────────────────────────────────────
  const toggleFavorite = async (id) => {
    try {
      const res = await axiosInstance.patch(`/cloths/${id}/favorite`);
      return { success: true, cloth: res.data.cloth };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update" };
    }
  };

  // ── DELETE ───────────────────────────────────────────────────
  const deleteCloth = async (id) => {
    try {
      await axiosInstance.delete(`/cloths/${id}`);
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