import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const useDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/dashboard/summary");
      setData(res.data.dashboard);
      return { success: true, dashboard: res.data.dashboard };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load dashboard";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
};

export default useDashboard;
