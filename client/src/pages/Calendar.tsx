/**
 * Calendar Page — Trading Journal Pro
 * Design: Swiss International Style — calendario mensual con celdas de color semántico
 * TP=verde esmeralda, SL=rojo coral, BE=gris neutro
 */

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  Target,
  DollarSign,
  Percent,
  Plus,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournal } from "@/contexts/JournalContext";
import TradeModal from "@/components/TradeModal";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0=Sun → convert to Mon-based (0=Mon)
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" && "bg-emerald-50 text-emerald-600",
              trend === "down" && "bg-red-50 text-red-600",
              trend === "neutral" && "bg-gray-100 text-gray-500"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
      <p className={cn("text-xl font-bold font-mono tracking-tight", color)}>{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CalendarPage() {
  const { getTrade, setTrade, deleteTrade, getMonthMetrics, data } = useJournal();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(data.initialBalance));
  const { setInitialBalance } = useJournal();

  const metrics = getMonthMetrics(year, month);
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
    setModalOpen(true);
  };

  const handleSaveBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val > 0) setInitialBalance(val);
    setEditingBalance(false);
  };

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Calendario de Trading
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Registro diario de operaciones
          </p>
        </div>
        {/* Initial balance editor */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Balance inicial:</span>
          {editingBalance ? (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  className="pl-6 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono w-28 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveBalance()}
                />
              </div>
              <Button size="sm" onClick={handleSaveBalance} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3">
                OK
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingBalance(false)} className="h-8 px-2">
                ✕
              </Button>
            </div>
          ) : (
            <button
              onClick={() => { setBalanceInput(String(data.initialBalance)); setEditingBalance(true); }}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors shadow-sm"
            >
              {formatCurrency(data.initialBalance, false)}
              <Settings2 size={12} className="text-gray-400" />
            </button>
          )}
        </div>
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
          sub={`${formatCurrency(metrics.initialBalance, false)} → ${formatCurrency(metrics.finalBalance, false)}`}
          icon={<Target size={18} />}
          color={metrics.returnPct >= 0 ? "text-emerald-600" : "text-red-500"}
          trend={metrics.returnPct > 0 ? "up" : metrics.returnPct < 0 ? "down" : "neutral"}
        />
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            {MONTHS[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
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
                  className="h-24 border-b border-r border-gray-50 bg-gray-50/30"
                />
              );
            }

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const trade = getTrade(dateStr);
            const isToday = dateStr === todayStr;
            // idx % 7: 0=Mon,1=Tue,...,5=Sat,6=Sun
            const dayOfWeek = idx % 7;
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

            const cellBg =
              trade?.result === "TP"
                ? "bg-emerald-50 hover:bg-emerald-100/80"
                : trade?.result === "SL"
                ? "bg-red-50 hover:bg-red-100/80"
                : trade?.result === "BE"
                ? "bg-gray-100 hover:bg-gray-200/80"
                : isWeekend
                ? "bg-gray-50/50 hover:bg-gray-100/50"
                : "bg-white hover:bg-gray-50";

            const borderLeft =
              trade?.result === "TP"
                ? "border-l-2 border-l-emerald-400"
                : trade?.result === "SL"
                ? "border-l-2 border-l-red-400"
                : trade?.result === "BE"
                ? "border-l-2 border-l-gray-400"
                : "";

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "h-24 border-b border-r border-gray-100 p-2 text-left transition-all duration-150 relative group flex flex-col",
                  cellBg,
                  borderLeft
                )}
              >
                {/* Day number */}
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-bold leading-none",
                      isToday
                        ? "w-5 h-5 bg-[#111827] text-white rounded-full flex items-center justify-center text-[10px]"
                        : trade
                        ? trade.result === "TP"
                          ? "text-emerald-700"
                          : trade.result === "SL"
                          ? "text-red-700"
                          : "text-gray-600"
                        : isWeekend
                        ? "text-gray-300"
                        : "text-gray-500"
                    )}
                  >
                    {day}
                  </span>
                  {trade?.result && (
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                        trade.result === "TP" && "bg-emerald-500 text-white",
                        trade.result === "SL" && "bg-red-500 text-white",
                        trade.result === "BE" && "bg-gray-400 text-white"
                      )}
                    >
                      {trade.result}
                    </span>
                  )}
                </div>

                {/* Trade data */}
                {trade && (
                  <div className="flex-1 flex flex-col justify-end">
                    <p
                      className={cn(
                        "text-xs font-bold font-mono leading-none",
                        trade.profit > 0
                          ? "text-emerald-600"
                          : trade.profit < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      )}
                    >
                      {formatCurrency(trade.profit)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {formatCurrency(trade.balance, false)}
                    </p>
                  </div>
                )}

                {/* Add button on hover (empty days) */}
                {!trade && !isWeekend && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <Plus size={13} className="text-gray-400" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <span className="text-xs text-gray-400 font-medium">Leyenda:</span>
          {[
            { color: "bg-emerald-500", label: "Take Profit" },
            { color: "bg-red-500", label: "Stop Loss" },
            { color: "bg-gray-400", label: "Break Even" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-sm", color)} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Modal */}
      {selectedDate && (
        <TradeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          date={selectedDate}
          existingTrade={getTrade(selectedDate)}
          onSave={(trade) => setTrade(selectedDate, trade)}
          onDelete={() => deleteTrade(selectedDate)}
        />
      )}
    </div>
  );
}
