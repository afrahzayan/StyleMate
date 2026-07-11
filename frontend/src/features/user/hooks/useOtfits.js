import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

// Mirrors useWardrobe.js: per-page state (not Redux) since this is list/detail
// CRUD data scoped to the Outfits pages, matching the existing pattern.
const useOutfits = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── FETCH ALL (optionally filtered by occasion/favorite, searched, sorted) ─
  const fetchOutfits = async ({ occasion, sort, favorite, search } = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const params = {};
      if (occasion && occasion !== "All") params.occasion = occasion;
      if (sort) params.sort = sort;
      if (favorite) params.favorite = "true";
      if (search && search.trim()) params.search = search.trim();
      const res = await axiosInstance.get("/outfits", { params });
      return { success: true, outfits: res.data.outfits };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load outfits";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── FAVORITE STATS (saved count, total worn, top occasion) ────
  const fetchFavoriteStats = async () => {
    try {
      const res = await axiosInstance.get("/outfits/favorites/stats");
      return { success: true, stats: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load favorite stats" };
    }
  };

  // ── FETCH ONE ─────────────────────────────────────────────────
  const fetchOutfitById = async (id) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/outfits/${id}`);
      return { success: true, outfit: res.data.outfit };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load outfit";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── CREATE ───────────────────────────────────────────────────
  // payload: { name, occasion, items: [clothId, ...], source }
  const createOutfit = async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/outfits", payload);
      return { success: true, outfit: res.data.outfit };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save outfit";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── UPDATE ───────────────────────────────────────────────────
  const updateOutfit = async (id, fields) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.patch(`/outfits/${id}`, fields);
      return { success: true, outfit: res.data.outfit };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update outfit";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── TOGGLE FAVORITE ──────────────────────────────────────────
  const toggleFavorite = async (id) => {
    try {
      const res = await axiosInstance.patch(`/outfits/${id}/favorite`);
      return { success: true, outfit: res.data.outfit };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update" };
    }
  };

  // ── DELETE ───────────────────────────────────────────────────
  const deleteOutfit = async (id) => {
    try {
      await axiosInstance.delete(`/outfits/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete" };
    }
  };

  return {
    isLoading,
    error,
    fetchOutfits,
    fetchFavoriteStats,
    fetchOutfitById,
    createOutfit,
    updateOutfit,
    toggleFavorite,
    deleteOutfit,
  };
};

export default useOutfits;