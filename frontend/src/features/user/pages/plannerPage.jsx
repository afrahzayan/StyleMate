import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, ImageOff, User, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/sidebar";
import PlanOutfitModal from "../components/planOutfitModal";
import usePlanner from "../hooks/usePlanner";
import useOutfits from "../hooks/useOutfits";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const toDateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const buildMonthGrid = (year, monthIndex) => {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, inMonth: false, key: toDateKey(monthIndex === 0 ? year - 1 : year, monthIndex === 0 ? 11 : monthIndex - 1, day) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true, key: toDateKey(year, monthIndex, day) });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const day = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({ day, inMonth: false, key: toDateKey(monthIndex === 11 ? year + 1 : year, monthIndex === 11 ? 0 : monthIndex + 1, day) });
    if (cells.length >= 42) break;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

const outfitThumb = (outfit) => outfit?.items?.find((i) => i?.image?.url)?.image?.url || null;

const PlannerPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { fetchMonthlyPlans, fetchPlansByDate, savePlan, updatePlan, deletePlan, isLoading } = usePlanner();
  const { fetchOutfits } = useOutfits();

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [plansByDate, setPlansByDate] = useState({});
  const [outfits, setOutfits] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const groupPlansByDate = (plans) => {
    const grouped = {};
    plans.forEach((plan) => {
      const d = new Date(plan.date);
      const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      grouped[key] = grouped[key] ? [...grouped[key], plan] : [plan];
    });
    return grouped;
  };

  const loadMonth = useCallback(async () => {
    const result = await fetchMonthlyPlans(cursor.getFullYear(), cursor.getMonth() + 1);
    if (result.success) {
      setPlansByDate(groupPlansByDate(result.plans));
    } else {
      toast.error(result.message);
    }
  }, [cursor]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    (async () => {
      const result = await fetchOutfits({ sort: "recent" });
      if (result.success) setOutfits(result.outfits);
    })();
  }, []);

  const weeks = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const goPrevMonth = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNextMonth = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const searchQuery = search.trim().toLowerCase();
  const matchesSearch = (plans) =>
    !searchQuery || plans.some((p) => p.outfit?.name?.toLowerCase().includes(searchQuery));

  const closeModal = () => setSelectedDate(null);

  const handleSave = async (payload, editingPlanId) => {
    setIsSaving(true);
    const result = editingPlanId
      ? await updatePlan(editingPlanId, payload)
      : await savePlan({ ...payload, date: selectedDate });
    setIsSaving(false);

    if (result.success) {
      toast.success(editingPlanId ? "Plan updated" : "Outfit planned");
      await loadMonth();
      const refreshed = await fetchPlansByDate(selectedDate);
      if (refreshed.success) {
        setPlansByDate((prev) => ({ ...prev, [selectedDate]: refreshed.plans }));
      }
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleDelete = async (planId) => {
    const result = await deletePlan(planId);
    if (result.success) {
      toast.success("Plan removed");
      await loadMonth();
      const refreshed = await fetchPlansByDate(selectedDate);
      if (refreshed.success) {
        setPlansByDate((prev) => ({ ...prev, [selectedDate]: refreshed.plans }));
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#FAF8F2" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between gap-4 px-8 py-5 bg-white border-b shrink-0 flex-wrap"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} style={{ color: "#1c1c2e" }} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: "#2F3447", fontFamily: "'Poppins', sans-serif" }}>
              Outfit Planner
            </h1>

            <div className="flex items-center gap-2 rounded-full px-2 py-1" style={{ backgroundColor: "#F5F4EC" }}>
              <button onClick={goPrevMonth} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors" aria-label="Previous month">
                <ChevronLeft size={16} style={{ color: "#52557A" }} />
              </button>
              <span className="text-sm font-bold px-1 min-w-[130px] text-center" style={{ color: "#2F3447" }}>
                {monthLabel}
              </span>
              <button onClick={goNextMonth} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors" aria-label="Next month">
                <ChevronRight size={16} style={{ color: "#52557A" }} />
              </button>
            </div>

            <button
              onClick={goToday}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "#52557A" }}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search outfits..."
                className="pl-9 pr-4 py-2 rounded-full border text-sm outline-none w-56"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#FAF8F2" }}
              />
            </div>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: "#4a5280" }}
              aria-label="Profile"
            >
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
            <div className="grid grid-cols-7" style={{ backgroundColor: "#F5F4EC" }}>
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-3 text-center text-xs font-bold tracking-wide" style={{ color: "#7C8197" }}>
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7" style={{ borderTop: wi === 0 ? "none" : "1px solid #F0EFE8" }}>
                {week.map((cell, ci) => {
                  const isToday = cell.key === todayKey;
                  const plans = plansByDate[cell.key] || [];
                  const visible = matchesSearch(plans);
                  const primaryPlan = plans[0];
                  const thumb = primaryPlan ? outfitThumb(primaryPlan.outfit) : null;

                  return (
                    <button
                      key={ci}
                      onClick={() => setSelectedDate(cell.key)}
                      className="text-left p-2.5 flex flex-col gap-2 transition-colors hover:bg-gray-50"
                      style={{
                        minHeight: "128px",
                        borderRight: ci === 6 ? "none" : "1px solid #F0EFE8",
                        backgroundColor: isToday ? "#F0EFFA" : "white",
                        opacity: cell.inMonth ? (searchQuery && !visible ? 0.35 : 1) : 0.45,
                      }}
                    >
                      {isToday ? (
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: "#3d4467" }}
                        >
                          {cell.day}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold" style={{ color: cell.inMonth ? "#2F3447" : "#B7BAC6" }}>
                          {cell.day}
                        </span>
                      )}

                      {primaryPlan && (
                        <>
                          <span
                            className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-semibold text-white truncate max-w-full"
                            style={{ backgroundColor: "#4a5280" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                            <span className="truncate">{primaryPlan.outfit?.name || "Outfit"}</span>
                          </span>

                          <div
                            className="w-full rounded-lg overflow-hidden flex items-center justify-center"
                            style={{ height: "56px", backgroundColor: "#F5F4FA" }}
                          >
                            {thumb ? (
                              <img src={thumb} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageOff size={16} style={{ color: "#C7C9DC" }} />
                            )}
                          </div>

                          {plans.length > 1 && (
                            <span className="text-[10px] font-semibold" style={{ color: "#7C8197" }}>
                              +{plans.length - 1} more
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {isLoading && (
            <p className="text-center text-xs mt-4" style={{ color: "#7C8197" }}>Loading planner...</p>
          )}
        </main>
      </div>

      {selectedDate && (
        <PlanOutfitModal
          dateStr={selectedDate}
          existingPlans={plansByDate[selectedDate] || []}
          outfits={outfits}
          isSaving={isSaving}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default PlannerPage;