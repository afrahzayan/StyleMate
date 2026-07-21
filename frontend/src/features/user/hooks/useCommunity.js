import { useState } from "react";
import axiosInstance from "../../../shared/api/axiosInstance";

const useCommunity = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async ({ search, occasion, sort, mine } = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (occasion && occasion !== "All") params.occasion = occasion;
      if (sort) params.sort = sort;
      if (mine) params.mine = "true";
      const res = await axiosInstance.get("/community", { params });
      return { success: true, posts: res.data.posts };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load the community feed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/community/saved");
      return { success: true, posts: res.data.posts };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load saved posts" };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPostById = async (id) => {
    try {
      const res = await axiosInstance.get(`/community/${id}`);
      return { success: true, post: res.data.post };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load post" };
    }
  };

  const createPost = async (formData) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/community", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { success: true, post: res.data.post };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to publish post";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id) => {
    try {
      await axiosInstance.delete(`/community/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete post" };
    }
  };

  const toggleLike = async (id) => {
    try {
      const res = await axiosInstance.post(`/community/${id}/like`);
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update like" };
    }
  };

  const toggleSave = async (id) => {
    try {
      const res = await axiosInstance.post(`/community/${id}/save`);
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update save" };
    }
  };

  const fetchComments = async (id) => {
    try {
      const res = await axiosInstance.get(`/community/${id}/comments`);
      return { success: true, comments: res.data.comments };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to load comments" };
    }
  };

  const addComment = async (id, text) => {
    try {
      const res = await axiosInstance.post(`/community/${id}/comments`, { text });
      return { success: true, comment: res.data.comment };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to add comment" };
    }
  };

  const deleteComment = async (id, commentId) => {
    try {
      await axiosInstance.delete(`/community/${id}/comments/${commentId}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete comment" };
    }
  };

  const reportPost = async (id, payload) => {
    try {
      const res = await axiosInstance.post(`/community/${id}/report`, payload);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to submit report" };
    }
  };

  const fetchPublicProfile = async (username) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/users/public/${username}`);
      return { success: true, ...res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "User not found" };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (fields) => {
    try {
      const res = await axiosInstance.patch("/users/profile", fields);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update profile" };
    }
  };

  return {
    isLoading,
    error,
    fetchPosts,
    fetchSavedPosts,
    fetchPostById,
    createPost,
    deletePost,
    toggleLike,
    toggleSave,
    fetchComments,
    addComment,
    deleteComment,
    reportPost,
    fetchPublicProfile,
    updateProfile,
  };
};

export default useCommunity;