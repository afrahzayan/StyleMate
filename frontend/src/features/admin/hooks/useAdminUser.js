import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../shared/api/axiosInstance";

const PAGE_SIZE = 5;

const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { page, limit: PAGE_SIZE, search },
      });
      setUsers(res.data.users);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load users";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleBlock = async (user) => {
    const isBlocked = user.status === "blocked";
    const endpoint = isBlocked ? "unblock" : "block";
    try {
      await axiosInstance.patch(`/admin/users/${user._id}/${endpoint}`);
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const removeUser = async (user) => {
    try {
      await axiosInstance.delete(`/admin/users/${user._id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  return {
    users,
    stats,
    pagination,
    page,
    search,
    setSearch: (value) => {
      setPage(1);
      setSearch(value);
    },
    isLoading,
    error,
    toggleBlock,
    removeUser,
    goToPage,
    refetch: fetchUsers,
  };
};

export default useAdminUsers;