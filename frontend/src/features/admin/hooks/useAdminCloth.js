import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../shared/api/axiosInstance";

const PAGE_SIZE = 6;

const useAdminCloth = () => {
  const [clothes, setClothes] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    occasions: [],
    seasons: [],
    statuses: [],
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [status, setStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter dropdown options only need to be loaded once.
  useEffect(() => {
    axiosInstance
      .get("/admin/clothes/filters")
      .then((res) => setFilterOptions(res.data))
      .catch(() => null);
  }, []);

  const fetchClothes = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/clothes", {
        params: { page, limit: PAGE_SIZE, search, category, occasion, season, status },
      });
      setClothes(res.data.clothes);
      setCategoryStats(res.data.categoryStats);
      setPagination(res.data.pagination);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load clothes";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, occasion, season, status]);

  useEffect(() => {
    fetchClothes();
  }, [fetchClothes]);

  const removeCloth = async (cloth) => {
    try {
      await axiosInstance.delete(`/admin/clothes/${cloth.id}`);
      toast.success("Item removed");
      fetchClothes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  // Any filter/search change should reset back to page 1.
  const updateFilter = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  return {
    clothes,
    categoryStats,
    filterOptions,
    pagination,
    page,
    search,
    category,
    occasion,
    season,
    status,
    setSearch: updateFilter(setSearch),
    setCategory: updateFilter(setCategory),
    setOccasion: updateFilter(setOccasion),
    setSeason: updateFilter(setSeason),
    setStatus: updateFilter(setStatus),
    isLoading,
    error,
    removeCloth,
    goToPage,
    refetch: fetchClothes,
  };
};

export default useAdminCloth;