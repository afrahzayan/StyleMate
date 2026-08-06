import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const useMyDesigns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const saveDesign = async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/customization/my-designs", payload);
      return { success: true, design: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save design";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyDesigns = async (status) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/customization/my-designs", { params: status ? { status } : {} });
      return { success: true, designs: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load your designs";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDesign = async (id) => {
    try {
      await axiosInstance.delete(`/customization/my-designs/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete design" };
    }
  };

  return { isLoading, error, saveDesign, fetchMyDesigns, deleteDesign };
};

export default useMyDesigns;