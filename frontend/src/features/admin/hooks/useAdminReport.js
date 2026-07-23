import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../shared/api/axiosInstance";

const PAGE_SIZE = 4;

const useAdminReport = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchStatsAndActivity = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        axiosInstance.get("/admin/reports/stats"),
        axiosInstance.get("/admin/reports/activity"),
      ]);
      setStats(statsRes.data.stats);
      setActivity(activityRes.data.activity);
    } catch {
      // Stat cards and the chart are secondary — a failure here shouldn't block the table.
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/reports", {
        params: { page, limit: PAGE_SIZE, search, category, status },
      });
      setReports(res.data.reports);
      setPagination(res.data.pagination);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load reports";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchStatsAndActivity();
  }, [fetchStatsAndActivity]);

  const refetchAll = () => {
    fetchReports();
    fetchStatsAndActivity();
  };

  const openReport = async (report) => {
    setIsDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/reports/${report.id}`);
      setSelectedReport(res.data.report);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeReport = () => setSelectedReport(null);

  const resolve = async (reportId, note = "") => {
    try {
      await axiosInstance.patch(`/admin/reports/${reportId}/resolve`, { note });
      toast.success("Report resolved");
      closeReport();
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const reject = async (reportId, note = "") => {
    try {
      await axiosInstance.patch(`/admin/reports/${reportId}/reject`, { note });
      toast.success("Report rejected");
      closeReport();
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const removeContent = async (reportId) => {
    try {
      await axiosInstance.delete(`/admin/reports/${reportId}/content`);
      toast.success("Reported content removed");
      closeReport();
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const updateFilter = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  return {
    reports,
    stats,
    activity,
    pagination,
    page,
    search,
    category,
    status,
    setSearch: updateFilter(setSearch),
    setCategory: updateFilter(setCategory),
    setStatus: updateFilter(setStatus),
    isLoading,
    error,
    selectedReport,
    isDetailLoading,
    openReport,
    closeReport,
    resolve,
    reject,
    removeContent,
    goToPage,
    refetch: refetchAll,
  };
};

export default useAdminReport;