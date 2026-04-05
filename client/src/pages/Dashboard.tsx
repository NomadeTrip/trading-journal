/**
 * Dashboard Page — Trading Journal Pro (Multi-Account)
 * Design: Swiss International Style — análisis anual con gráficos Recharts
 * Equity curve, drawdown, profit factor, tabla mensual, comparación multicuenta
 */

import { useState, useMemo, useEffect } from "react";
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
  Legend,
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
import { useJournal } from "@/contexts/JournalContext";
import AccountManager from "@/components/AccountManager";
import ExportData from "@/components/ExportData";

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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg, "dark:bg-gray-700")}>
          {icon}
        </div>
        {badge && (
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", badge.color)}>
            {badge.text}
          </span>
        )}
      </div>
      <p className={cn("text-2xl font-bold font-mono tracking-tight", valueColor)}>{value}</p>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const EquityTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-gray-950 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="font-bold font-mono">
            {entry.name}: {formatCurrency(entry.value, false)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="font-bold font-mono">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { getAllAccounts, getYearMetrics, getAccount, getAccountBalance, getTradesByAccount } = useJournal();
  const currentYear = new Date().getFullYear();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [yearDropdown, setYearDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  const accounts = getAllAccounts();

  // Seleccionar automáticamente la primera cuenta cuando se carguen los datos
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = getAccount(selectedAccountId);
  const metrics = useMemo(() => getYearMetrics(selectedAccountId, selectedYear), [selectedAccountId, selectedYear, getYearMetrics]);

  const years = useMemo(() => {
    const ys = new Set<number>();
    ys.add(currentYear);
    accounts.forEach((acc) => {
      const createdYear = parseInt(acc.createdAt.split("-")[0]);
      for (let y = createdYear; y <= currentYear; y++) ys.add(y);
    });
    return Array.from(ys).sort((a, b) => b - a);
  }, [accounts, currentYear]);

  // Equity curve data
  const equityData = useMemo(() => {
    const map = new Map<string, number>();
    metrics.equityCurve.forEach((p) => map.set(p.date, p.balance));
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, balance]) => ({
        date: date.slice(5),
        balance,
      }));
  }, [metrics.equityCurve]);

  // Monthly data
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

  // Get unique instruments for filter
  const instruments = useMemo(() => {
    const allTrades = getTradesByAccount(selectedAccountId);
    const yearTrades = allTrades.filter((t) => t.date.startsWith(String(selectedYear)));
    const unique = new Set(yearTrades.map((t) => t.instrument));
    return Array.from(unique).sort();
  }, [selectedAccountId, selectedYear, getTradesByAccount]);

  // Comparison data (all accounts)
  const comparisonData = useMemo(() => {
    return accounts.map((acc) => {
      const accMetrics = getYearMetrics(acc.id, selectedYear);
      return {
        id: acc.id,
        name: acc.name,
        color: acc.color,
        profit: accMetrics.totalProfit,
        winrate: accMetrics.winrate,
        trades: accMetrics.tradeCount,
        balance: getAccountBalance(acc.id),
      };
    });
  }, [accounts, selectedYear, getYearMetrics, getAccountBalance]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard de Rendimiento
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Análisis anual completo de tu operativa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AccountManager selectedAccountId={selectedAccountId} onSelectAccount={setSelectedAccountId} />
          {/* Instrument filter */}
          {instruments.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={selectedInstrument || ""}
                onChange={(e) => setSelectedInstrument(e.target.value || null)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 transition-colors"
              >
                <option value="">Todos los instrumentos</option>
                {instruments.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Export button */}
          <ExportData accountId={selectedAccountId} year={selectedYear} />
          {/* Year selector */}
          <div className="relative">
            <button
              onClick={() => setYearDropdown((v) => !v)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 transition-colors shadow-sm"
            >
              {selectedYear}
              <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
            </button>
            {yearDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setSelectedYear(y); setYearDropdown(false); }}
                    className={cn(
                      "block w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                      y === selectedYear ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero card */}
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
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedAccount?.color || "#10b981" }}
              />
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                {selectedAccount?.name} {selectedYear}
              </p>
            </div>
            <p
              className={cn(
                "text-4xl font-bold font-mono tracking-tight",
                metrics.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatCurrency(metrics.totalProfit)}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {metrics.tradeCount} trades · Winrate {metrics.winrate.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">Balance actual</p>
            <p className="text-white text-2xl font-bold font-mono">
              {formatCurrency(metrics.currentBalance, false)}
            </p>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Winrate total"
          value={`${metrics.winrate.toFixed(1)}%`}
          sub={`${metrics.tradeCount} trades totales`}
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
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Equity Curve</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Crecimiento de la cuenta</p>
            </div>
          </div>
          {equityData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={equityData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedAccount?.color || "#10b981"} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={selectedAccount?.color || "#10b981"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
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
                  y={selectedAccount?.initialBalance || 0}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={selectedAccount?.color || "#10b981"}
                  strokeWidth={2}
                  fill="url(#equityGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: selectedAccount?.color || "#10b981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin datos suficientes</p>
              </div>
            </div>
          )}
        </div>

        {/* Best / Worst month */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Extremos del año</h3>
          <div className="flex-1 space-y-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Mejor mes
                </span>
              </div>
              {metrics.bestMonth ? (
                <>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatCurrency(metrics.bestMonth.totalProfit)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                    {MONTHS_SHORT[metrics.bestMonth.month - 1]} {metrics.bestMonth.year} ·{" "}
                    {metrics.bestMonth.tradeCount} trades
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">Sin datos</p>
              )}
            </div>

            <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={16} className="text-red-500 dark:text-red-400" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Peor mes
                </span>
              </div>
              {metrics.worstMonth ? (
                <>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 font-mono">
                    {formatCurrency(metrics.worstMonth.totalProfit)}
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                    {MONTHS_SHORT[metrics.worstMonth.month - 1]} {metrics.worstMonth.year} ·{" "}
                    {metrics.worstMonth.tradeCount} trades
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Rentabilidad Mensual</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Profit/pérdida por mes en USD</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
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

      {/* Comparison section */}
      {accounts.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Comparación de Cuentas</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Rendimiento {selectedYear} de todas tus cuentas</p>
            </div>
            <button
              onClick={() => setShowComparison((v) => !v)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              {showComparison ? "Ocultar" : "Ver"}
            </button>
          </div>
          {showComparison && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Cuenta
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Trades
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Winrate
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((acc) => (
                    <tr
                      key={acc.id}
                      className={cn(
                        "border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors",
                        acc.trades === 0 && "opacity-40"
                      )}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: acc.color }}
                          />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{acc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-400">
                        {acc.trades > 0 ? acc.trades : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-mono font-semibold",
                          acc.profit > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : acc.profit < 0
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {acc.trades > 0 ? formatCurrency(acc.profit) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-400">
                        {acc.trades > 0 ? `${acc.winrate.toFixed(0)}%` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-gray-700 dark:text-gray-300 font-semibold">
                        {formatCurrency(acc.balance, false)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}