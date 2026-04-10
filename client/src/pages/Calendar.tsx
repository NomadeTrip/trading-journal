/**
 * Calendar Page — Trading Journal Pro (Multi-Account)
 * Design: Swiss International Style — calendario mensual con soporte para múltiples trades
 * TP=verde esmeralda, SL=rojo coral, BE=gris neutro
 */

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Percent,
  BarChart2,
  Target,
  Plus,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournal } from "@/contexts/JournalContext";
import TradeModal from "@/components/TradeModal";
import TradeItem from "@/components/TradeItem";
import AccountManager from "@/components/AccountManager";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatCurrency(value: number, showSign = true): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!showSign) return `$${formatted}`;
  if (value > 0) return `+$${formatted}`;
  if (value < 0) return `-$${formatted}`;
  return `$${formatted}`;
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "neutral";
}

function MetricCard({ label, value, sub, icon, color = "text-gray-700", trend }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" && "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
              trend === "down" && "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
              trend === "neutral" && "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
      <p className={cn("text-xl font-bold font-mono tracking-tight", color)}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-300 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CalendarPage() {
  const {
    getTradesByDate,
    getMonthTrades,
    getAccountMetrics,
    setTrade,
    deleteTrade,
    getAccount,
    getAccountBalance,
    getAllAccounts,
    getTradesByAccount: getTradesByAccountFn,
  } = useJournal();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Seleccionar automáticamente la primera cuenta cuando se carguen los datos
  const allAccounts = getAllAccounts();
  useEffect(() => {
    if (!selectedAccountId && allAccounts.length > 0) {
      setSelectedAccountId(allAccounts[0].id);
    }
  }, [allAccounts, selectedAccountId]);

  const account = getAccount(selectedAccountId);
  const metrics = getAccountMetrics(selectedAccountId, year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTradeId(null);
    setModalOpen(true);
  };

  const handleEditTrade = (tradeId: string, dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTradeId(tradeId);
    setModalOpen(true);
  };

  const handleSaveTrade = async (trade: any) => {
    if (selectedDate && selectedAccountId) {
      try {
        await setTrade(selectedDate, selectedAccountId, trade);
        setModalOpen(false);
        toast.success("Trade guardado correctamente");
      } catch (err: any) {
        console.error("Error al guardar trade:", err);
        toast.error(err?.message || "Error al guardar el trade");
      }
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      await deleteTrade(tradeId);
      setModalOpen(false);
      toast.success("Trade eliminado");
    } catch (err: any) {
      console.error("Error al eliminar trade:", err);
      toast.error(err?.message || "Error al eliminar el trade");
    }
  };

  const toggleDayExpanded = (dateStr: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Get trades for each day (only for selected account)
  const getTradesForDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const trades = getTradesByDate(dateStr);
    return trades.filter((t) => t.accountId === selectedAccountId);
  };

  // Get dominant result for day (for color coding)
  const getDayResult = (day: number) => {
    const trades = getTradesForDay(day);
    if (trades.length === 0) return null;
    
    // Prioridad: TP > SL > BE
    if (trades.some(t => t.result === "TP")) return "TP";
    if (trades.some(t => t.result === "SL")) return "SL";
    if (trades.some(t => t.result === "BE")) return "BE";
    return null;
  };

  // Calculate day profit (net profit = profit - commission)
  const getDayProfit = (day: number) => {
    const trades = getTradesForDay(day);
    return trades.reduce((sum, t) => sum + t.profit - (t.commission || 0), 0);
  };

  // Calculate balance at the start of each day (before that day's trades)
  const getBalanceBeforeDay = useCallback((day: number): number => {
    const account = getAccount(selectedAccountId);
    if (!account) return 0;

    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const allTrades = getTradesByAccountFn(selectedAccountId);
    
    // Get all trades before this day
    const tradesBeforeDay = allTrades.filter((t) => t.date < dateStr);
    const totalProfitBefore = tradesBeforeDay.reduce((sum, t) => sum + t.profit - (t.commission || 0), 0);
    
    return account.initialBalance + totalProfitBefore;
  }, [selectedAccountId, year, month, getAccount, getTradesByAccountFn]);

  // Calculate daily return percentage
  const getDayReturnPercentage = useCallback((day: number): number => {
    const dayProfit = getDayProfit(day);
    const balanceBefore = getBalanceBeforeDay(day);
    
    if (balanceBefore === 0) return 0;
    return (dayProfit / balanceBefore) * 100;
  }, [getBalanceBeforeDay]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-gray-950 p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Calendario de Trading
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Registro diario de operaciones
          </p>
        </div>
        <AccountManager selectedAccountId={selectedAccountId} onSelectAccount={setSelectedAccountId} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Profit mensual"
          value={formatCurrency(metrics.totalProfit)}
          icon={<DollarSign size={18} />}
          color={metrics.totalProfit >= 0 ? "text-emerald-600" : "text-red-500"}
          trend={metrics.totalProfit > 0 ? "up" : metrics.totalProfit < 0 ? "down" : "neutral"}
        />
        <MetricCard
          label="Winrate"
          value={`${metrics.winrate.toFixed(1)}%`}
          sub={`${metrics.tpCount} TP / ${metrics.slCount} SL / ${metrics.beCount} BE`}
          icon={<Percent size={18} />}
          color={metrics.winrate >= 50 ? "text-emerald-600" : "text-red-500"}
          trend={metrics.winrate >= 50 ? "up" : "down"}
        />
        <MetricCard
          label="Trades del mes"
          value={String(metrics.tradeCount)}
          icon={<BarChart2 size={18} />}
          color="text-gray-800"
        />
        <MetricCard
          label="Retorno mensual"
          value={`${metrics.returnPct >= 0 ? "+" : ""}${metrics.returnPct.toFixed(2)}%`}
          sub={`${formatCurrency(metrics.initialBalance, false)} → ${formatCurrency(metrics.currentBalance, false)}`}
          icon={<Target size={18} />}
          color={metrics.returnPct >= 0 ? "text-emerald-600" : "text-red-500"}
          trend={metrics.returnPct > 0 ? "up" : metrics.returnPct < 0 ? "down" : "neutral"}
        />
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {MONTHS[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-24 border-b border-r border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/20"
                />
              );
            }

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTrades = getTradesForDay(day);
            const dayResult = getDayResult(day);
            const dayProfit = getDayProfit(day);
            const isToday = dateStr === todayStr;
            const dayOfWeek = idx % 7;
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            const isExpanded = expandedDays.has(dateStr);

            const cellBg =
              dayResult === "TP"
                ? "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30"
                : dayResult === "SL"
                ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30"
                : dayResult === "BE"
                ? "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-600"
                : isWeekend
                ? "bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50";

            const borderLeft =
              dayResult === "TP"
                ? "border-l-2 border-l-emerald-400"
                : dayResult === "SL"
                ? "border-l-2 border-l-red-400"
                : dayResult === "BE"
                ? "border-l-2 border-l-gray-400"
                : "";

            return (
              <div
                key={dateStr}
                className={cn(
                  "border-b border-r border-gray-100 dark:border-gray-700 transition-all duration-150 relative",
                  cellBg,
                  borderLeft,
                  isExpanded ? "col-span-7 h-auto" : "h-24"
                )}
              >
                {!isExpanded ? (
                  <button
                    onClick={() => dayTrades.length > 1 ? toggleDayExpanded(dateStr) : handleDayClick(day)}
                    className="w-full h-full p-2 text-left flex flex-col group"
                  >
                    {/* Day number */}
                    <div className="flex items-start justify-between mb-1">
                      <span
                        className={cn(
                          "text-xs font-bold leading-none",
                          isToday
                            ? "w-5 h-5 bg-[#111827] dark:bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]"
                            : dayResult
                            ? dayResult === "TP"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : dayResult === "SL"
                              ? "text-red-700 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                            : isWeekend
                            ? "text-gray-300 dark:text-gray-500"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {day}
                      </span>
                      {dayTrades.length > 0 && (
                        <div className="flex items-center gap-1">
                          {dayTrades.length > 1 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">
                              {dayTrades.length}
                            </span>
                          )}
                          {dayResult && (
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                dayResult === "TP" && "bg-emerald-500 text-white",
                                dayResult === "SL" && "bg-red-500 text-white",
                                dayResult === "BE" && "bg-gray-400 text-white"
                              )}
                            >
                              {dayResult}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Trade data */}
                    {dayTrades.length > 0 && (
                      <div className="flex-1 flex flex-col justify-end gap-1">
                        <p
                          className={cn(
                            "text-xs font-bold font-mono leading-none",
                            dayProfit > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : dayProfit < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {formatCurrency(dayProfit)}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-semibold font-mono leading-none",
                            getDayReturnPercentage(day) > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : getDayReturnPercentage(day) < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {getDayReturnPercentage(day) > 0 ? "+" : ""}{getDayReturnPercentage(day).toFixed(2)}%
                        </p>
                      </div>
                    )}

                    {/* Add button on hover (empty days) */}
                    {dayTrades.length === 0 && !isWeekend && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <Plus size={13} className="text-gray-400" />
                        </div>
                      </div>
                    )}
                  </button>
                ) : (
                  // Expanded view for multiple trades
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{formatDate(dateStr)}</p>
                        <p className="text-xs text-gray-500">{dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}</p>
                      </div>
                      <button
                        onClick={() => toggleDayExpanded(dateStr)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    {/* Trades list */}
                    <div className="space-y-2">
                      {dayTrades.map((trade) => (
                        <TradeItem
                          key={trade.id}
                          trade={trade}
                          onEdit={() => handleEditTrade(trade.id, dateStr)}
                          onDelete={deleteTrade}
                        />
                      ))}
                    </div>

                    {/* Add trade button */}
                    <button
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-500 transition-colors text-sm font-medium"
                    >
                      + Agregar trade
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 bg-gray-50/50 dark:bg-gray-700/40">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Leyenda:</span>
          {[
            { color: "bg-emerald-500", label: "Take Profit" },
            { color: "bg-red-500", label: "Stop Loss" },
            { color: "bg-gray-400", label: "Break Even" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-sm", color)} />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTradeId(null);
        }}
        date={selectedDate || ""}
        accountId={selectedAccountId}
        existingTradeId={selectedTradeId || undefined}
        onSave={handleSaveTrade}
      />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}