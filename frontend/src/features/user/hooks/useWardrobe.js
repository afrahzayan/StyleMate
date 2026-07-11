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
  const fetchCloths = async ({ category, favorite } = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const params = {};
      if (category && category !== "All") params.category = category;
      if (favorite) params.favorite = "true";
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

      // IMPORTANT: do NOT set Content-Type manually here. FormData needs the
      // browser to generate the multipart boundary itself; if we set
      // "multipart/form-data" ourselves, the boundary is missing and the
      // backend's multer parser fails on every request (this was the bug
      // causing all uploads to fail with a 500).
      const res = await axiosInstance.post("/cloths", formData);
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