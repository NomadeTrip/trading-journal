/**
 * Dashboard Page — Trading Journal Pro
 * Design: Swiss International Style — análisis anual con gráficos Recharts
 * Equity curve, drawdown, profit factor, tabla mensual
 */

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Activity,
  Target,
  BarChart2,
  Percent,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournal, MonthMetrics } from "@/contexts/JournalContext";

const MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

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

function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg?: string;
  valueColor?: string;
  badge?: { text: string; color: string };
}

function KpiCard({ label, value, sub, icon, iconBg = "bg-gray-100", valueColor = "text-gray-900", badge }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        {badge && (
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", badge.color)}>
            {badge.text}
          </span>
        )}
      </div>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", valueColor)}>{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// Custom tooltip for equity chart
const EquityTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="font-bold font-mono text-emerald-400">
          {formatCurrency(payload[0].value, false)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for monthly bar chart
const MonthlyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#111827] text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className={cn("font-bold font-mono", val >= 0 ? "text-emerald-400" : "text-red-400")}>
          {formatCurrency(val)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { getYearMetrics, data } = useJournal();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearDropdown, setYearDropdown] = useState(false);

  // Available years (current + past 4)
  const years = useMemo(() => {
    const ys = new Set<number>();
    Object.keys(data.trades).forEach((d) => ys.add(parseInt(d.split("-")[0])));
    ys.add(currentYear);
    return Array.from(ys).sort((a, b) => b - a);
  }, [data.trades, currentYear]);

  const metrics = useMemo(() => getYearMetrics(selectedYear), [getYearMetrics, selectedYear]);

  // Equity curve data — deduplicate by date, take last balance per date
  const equityData = useMemo(() => {
    const map = new Map<string, number>();
    metrics.equityCurve.forEach((p) => map.set(p.date, p.balance));
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, balance]) => ({
        date: date.slice(5), // "MM-DD"
        balance,
      }));
  }, [metrics.equityCurve]);

  // Monthly profit bar data
  const monthlyData = useMemo(
    () =>
      metrics.months.map((m, i) => ({
        month: MONTHS_SHORT[i],
        profit: m.totalProfit,
        returnPct: m.returnPct,
        trades: m.tradeCount,
      })),
    [metrics.months]
  );

  const activeMonths = metrics.months.filter((m) => m.tradeCount > 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard de Rendimiento
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Análisis anual completo de tu operativa
          </p>
        </div>
        {/* Year selector */}
        <div className="relative">
          <button
            onClick={() => setYearDropdown((v) => !v)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors shadow-sm"
          >
            {selectedYear}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {yearDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 overflow-hidden">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => { setSelectedYear(y); setYearDropdown(false); }}
                  className={cn(
                    "block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors",
                    y === selectedYear ? "font-bold text-emerald-600 bg-emerald-50" : "text-gray-700"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero equity card */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 shadow-lg"
        style={{ minHeight: 220 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663512383588/fyY6iefdcqSxHg2dGsb8Wg/hero-equity-chart-A5PUivGBbN6GxhDvuNkdGr.webp)`,
          }}
        />
        <div className="absolute inset-0 bg-[#111827]/75" />
        <div className="relative z-10 p-6 flex items-end justify-between h-full" style={{ minHeight: 220 }}>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Rendimiento {selectedYear}
            </p>
            <p
              className={cn(
                "text-4xl font-bold font-mono tracking-tight",
                metrics.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatCurrency(metrics.totalProfit)}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {metrics.totalTrades} trades · Winrate {metrics.winrate.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">Balance actual</p>
            <p className="text-white text-2xl font-bold font-mono">
              {equityData.length > 0
                ? formatCurrency(equityData[equityData.length - 1].balance, false)
                : formatCurrency(data.initialBalance, false)}
            </p>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Winrate total"
          value={`${metrics.winrate.toFixed(1)}%`}
          sub={`${metrics.totalTrades} trades totales`}
          icon={<Target size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          valueColor={metrics.winrate >= 50 ? "text-emerald-600" : "text-red-500"}
          badge={
            metrics.winrate >= 50
              ? { text: "Positivo", color: "bg-emerald-50 text-emerald-600" }
              : { text: "Negativo", color: "bg-red-50 text-red-500" }
          }
        />
        <KpiCard
          label="Profit Factor"
          value={metrics.profitFactor === 999 ? "∞" : metrics.profitFactor.toFixed(2)}
          sub="Ganancias / Pérdidas"
          icon={<Activity size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
          valueColor={metrics.profitFactor >= 1 ? "text-blue-600" : "text-red-500"}
          badge={
            metrics.profitFactor >= 1.5
              ? { text: "Excelente", color: "bg-blue-50 text-blue-600" }
              : metrics.profitFactor >= 1
              ? { text: "Aceptable", color: "bg-amber-50 text-amber-600" }
              : { text: "Mejorar", color: "bg-red-50 text-red-500" }
          }
        />
        <KpiCard
          label="Máx. Drawdown"
          value={`${metrics.maxDrawdown.toFixed(1)}%`}
          sub="Caída máxima desde pico"
          icon={<AlertTriangle size={20} className="text-amber-600" />}
          iconBg="bg-amber-50"
          valueColor={metrics.maxDrawdown > 20 ? "text-red-500" : metrics.maxDrawdown > 10 ? "text-amber-600" : "text-emerald-600"}
        />
        <KpiCard
          label="Promedio ganancia"
          value={formatCurrency(metrics.avgWin, false)}
          sub={`Pérd. prom: ${formatCurrency(metrics.avgLoss, false)}`}
          icon={<DollarSign size={20} className="text-gray-600" />}
          iconBg="bg-gray-100"
          valueColor="text-gray-800"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Equity Curve</h3>
              <p className="text-xs text-gray-400">Crecimiento de la cuenta</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-500 rounded" />
              <span className="text-xs text-gray-400">Balance</span>
            </div>
          </div>
          {equityData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={equityData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                  width={65}
                />
                <Tooltip content={<EquityTooltip />} />
                <ReferenceLine
                  y={data.initialBalance}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#equityGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin datos suficientes</p>
                <p className="text-xs mt-1">Registra trades para ver la curva</p>
              </div>
            </div>
          )}
        </div>

        {/* Best / Worst month */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-900">Extremos del año</h3>
          <div className="flex-1 space-y-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Mejor mes
                </span>
              </div>
              {metrics.bestMonth ? (
                <>
                  <p className="text-lg font-bold text-emerald-700 font-mono">
                    {formatCurrency(metrics.bestMonth.totalProfit)}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {MONTHS_SHORT[metrics.bestMonth.month - 1]} {metrics.bestMonth.year} ·{" "}
                    {metrics.bestMonth.tradeCount} trades
                  </p>
                  <p className="text-xs text-emerald-500 font-mono">
                    {formatPct(metrics.bestMonth.returnPct)} retorno
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Sin datos</p>
              )}
            </div>

            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={16} className="text-red-500" />
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Peor mes
                </span>
              </div>
              {metrics.worstMonth ? (
                <>
                  <p className="text-lg font-bold text-red-600 font-mono">
                    {formatCurrency(metrics.worstMonth.totalProfit)}
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    {MONTHS_SHORT[metrics.worstMonth.month - 1]} {metrics.worstMonth.year} ·{" "}
                    {metrics.worstMonth.tradeCount} trades
                  </p>
                  <p className="text-xs text-red-400 font-mono">
                    {formatPct(metrics.worstMonth.returnPct)} retorno
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Sin datos</p>
              )}
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={16} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ratio G/P
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800 font-mono">
                {metrics.avgLoss > 0
                  ? (metrics.avgWin / metrics.avgLoss).toFixed(2)
                  : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Avg win {formatCurrency(metrics.avgWin, false)} · Avg loss {formatCurrency(metrics.avgLoss, false)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Rentabilidad Mensual</h3>
            <p className="text-xs text-gray-400">Profit/pérdida por mes en USD</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={55}
            />
            <Tooltip content={<MonthlyTooltip />} />
            <ReferenceLine y={0} stroke="#e5e7eb" />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.profit > 0
                      ? "#10b981"
                      : entry.profit < 0
                      ? "#ef4444"
                      : "#d1d5db"
                  }
                  fillOpacity={entry.trades === 0 ? 0.2 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly summary table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Resumen Mensual</h3>
          <p className="text-xs text-gray-400">Detalle de rendimiento por mes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Mes
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Trades
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Profit
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Retorno %
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Winrate
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Balance final
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.months.map((m, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-gray-50 hover:bg-gray-50/50 transition-colors",
                    m.tradeCount === 0 && "opacity-40"
                  )}
                >
                  <td className="px-5 py-3 font-semibold text-gray-700">
                    {MONTHS_SHORT[i]}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">
                    {m.tradeCount > 0 ? m.tradeCount : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono font-semibold",
                      m.totalProfit > 0
                        ? "text-emerald-600"
                        : m.totalProfit < 0
                        ? "text-red-500"
                        : "text-gray-400"
                    )}
                  >
                    {m.tradeCount > 0 ? formatCurrency(m.totalProfit) : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono",
                      m.returnPct > 0
                        ? "text-emerald-600"
                        : m.returnPct < 0
                        ? "text-red-500"
                        : "text-gray-400"
                    )}
                  >
                    {m.tradeCount > 0 ? (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-semibold",
                          m.returnPct > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : m.returnPct < 0
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {formatPct(m.returnPct)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">
                    {m.tradeCount > 0 ? `${m.winrate.toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700 font-semibold">
                    {m.tradeCount > 0 ? formatCurrency(m.finalBalance, false) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {activeMonths.length > 0 && (
              <tfoot>
                <tr className="bg-[#111827]">
                  <td className="px-5 py-3 font-bold text-white text-xs uppercase tracking-wider">
                    Total {selectedYear}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-300">
                    {metrics.totalTrades}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono font-bold",
                      metrics.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {formatCurrency(metrics.totalProfit)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-300">
                    —
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono font-bold",
                      metrics.winrate >= 50 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {metrics.winrate.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-white">
                    {equityData.length > 0
                      ? formatCurrency(equityData[equityData.length - 1].balance, false)
                      : "—"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
