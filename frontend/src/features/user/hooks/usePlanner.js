import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

// Mirrors useOutfits.js: per-page state (not Redux) since this is CRUD data
// scoped to the Planner page, matching the existing pattern.
const usePlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── FETCH MONTH (calendar view) ──────────────────────────────
  const fetchMonthlyPlans = async (year, month) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/planner/month", { params: { year, month } });
      return { success: true, plans: res.data.plans };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load planner";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── FETCH PLANS FOR ONE DATE ("YYYY-MM-DD") ──────────────────
  const fetchPlansByDate = async (dateStr) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/planner/date/${dateStr}`);
      return { success: true, plans: res.data.plans };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load that date";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── CREATE / REPLACE A PLAN ───────────────────────────────────
  // payload: { outfitId, date: "YYYY-MM-DD", time?: "HH:mm", notes? }
  const savePlan = async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/planner", payload);
      return { success: true, plan: res.data.plan };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save plan";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── UPDATE A PLAN ──────────────────────────────────────────────
  const updatePlan = async (id, fields) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.patch(`/planner/${id}`, fields);
      return { success: true, plan: res.data.plan };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update plan";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // ── DELETE A PLAN ────────────────────────────────────────────────
  const deletePlan = async (id) => {
    try {
      await axiosInstance.delete(`/planner/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to remove plan" };
    }
  };

  // ── FETCH UPCOMING PLANS ────────────────────────────────────────
  const fetchUpcoming = async (limit = 2) => {
    try {
      const res = await axiosInstance.get("/planner/upcoming", { params: { limit } });
      return { success: true, plans: res.data.plans };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load upcoming plans" };
    }
  };

  return {
    isLoading,
    error,
    fetchMonthlyPlans,
    fetchPlansByDate,
    savePlan,
    updatePlan,
    deletePlan,
    fetchUpcoming,
  };
};

export default usePlanner;