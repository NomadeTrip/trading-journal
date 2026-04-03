/**
 * JournalContext — Trading Journal Pro
 * Design: Swiss International Style meets Financial Dashboard
 * Manages all trade data, persisted via localStorage
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type TradeResult = "TP" | "SL" | "BE" | null;

export interface TradeEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  result: TradeResult;
  profit: number; // positive = gain, negative = loss
  balance: number; // account balance after trade
  notes: string;
  imageUrl: string; // base64 or URL of trade screenshot
}

export interface JournalData {
  initialBalance: number;
  trades: Record<string, TradeEntry>; // keyed by "YYYY-MM-DD"
}

interface JournalContextType {
  data: JournalData;
  setInitialBalance: (balance: number) => void;
  setTrade: (date: string, trade: Omit<TradeEntry, "id" | "date">) => void;
  deleteTrade: (date: string) => void;
  getTrade: (date: string) => TradeEntry | undefined;
  getMonthTrades: (year: number, month: number) => TradeEntry[];
  getMonthMetrics: (year: number, month: number) => MonthMetrics;
  getYearMetrics: (year: number) => YearMetrics;
  getAllYearMetrics: () => YearMetrics[];
}

export interface MonthMetrics {
  year: number;
  month: number;
  trades: TradeEntry[];
  totalProfit: number;
  winrate: number;
  tradeCount: number;
  tpCount: number;
  slCount: number;
  beCount: number;
  initialBalance: number;
  finalBalance: number;
  returnPct: number;
}

export interface YearMetrics {
  year: number;
  months: MonthMetrics[];
  totalProfit: number;
  totalTrades: number;
  winrate: number;
  profitFactor: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  bestMonth: MonthMetrics | null;
  worstMonth: MonthMetrics | null;
  equityCurve: { date: string; balance: number }[];
}

const STORAGE_KEY = "trading-journal-data-v1";

const defaultData: JournalData = {
  initialBalance: 1000,
  trades: {},
};

const JournalContext = createContext<JournalContextType | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<JournalData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setInitialBalance = useCallback((balance: number) => {
    setData((prev) => ({ ...prev, initialBalance: balance }));
  }, []);

  const setTrade = useCallback(
    (date: string, trade: Omit<TradeEntry, "id" | "date">) => {
      setData((prev) => ({
        ...prev,
        trades: {
          ...prev.trades,
          [date]: {
            ...trade,
            id: date,
            date,
          },
        },
      }));
    },
    []
  );

  const deleteTrade = useCallback((date: string) => {
    setData((prev) => {
      const newTrades = { ...prev.trades };
      delete newTrades[date];
      return { ...prev, trades: newTrades };
    });
  }, []);

  const getTrade = useCallback(
    (date: string) => data.trades[date],
    [data.trades]
  );

  const getMonthTrades = useCallback(
    (year: number, month: number): TradeEntry[] => {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return Object.values(data.trades)
        .filter((t) => t.date.startsWith(prefix))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [data.trades]
  );

  const getMonthMetrics = useCallback(
    (year: number, month: number): MonthMetrics => {
      const trades = getMonthTrades(year, month);
      const tpCount = trades.filter((t) => t.result === "TP").length;
      const slCount = trades.filter((t) => t.result === "SL").length;
      const beCount = trades.filter((t) => t.result === "BE").length;
      const tradeCount = trades.length;
      const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
      const winrate = tradeCount > 0 ? (tpCount / tradeCount) * 100 : 0;

      // Find initial balance for this month
      // It's the balance before the first trade of the month
      // or the global initial balance if no prior trades
      const allTradesSorted = Object.values(data.trades).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      const firstTradeOfMonth = trades[0];
      let monthInitialBalance = data.initialBalance;
      if (firstTradeOfMonth) {
        const priorTrades = allTradesSorted.filter(
          (t) => t.date < firstTradeOfMonth.date
        );
        if (priorTrades.length > 0) {
          monthInitialBalance = priorTrades[priorTrades.length - 1].balance;
        }
      }

      const finalBalance =
        trades.length > 0
          ? trades[trades.length - 1].balance
          : monthInitialBalance;

      const returnPct =
        monthInitialBalance > 0
          ? ((finalBalance - monthInitialBalance) / monthInitialBalance) * 100
          : 0;

      return {
        year,
        month,
        trades,
        totalProfit,
        winrate,
        tradeCount,
        tpCount,
        slCount,
        beCount,
        initialBalance: monthInitialBalance,
        finalBalance,
        returnPct,
      };
    },
    [getMonthTrades, data.trades, data.initialBalance]
  );

  const getYearMetrics = useCallback(
    (year: number): YearMetrics => {
      const months: MonthMetrics[] = [];
      for (let m = 1; m <= 12; m++) {
        months.push(getMonthMetrics(year, m));
      }

      const allTrades = months.flatMap((m) => m.trades);
      const totalProfit = allTrades.reduce((sum, t) => sum + t.profit, 0);
      const totalTrades = allTrades.length;
      const tpCount = allTrades.filter((t) => t.result === "TP").length;
      const winrate = totalTrades > 0 ? (tpCount / totalTrades) * 100 : 0;

      const wins = allTrades.filter((t) => t.profit > 0).map((t) => t.profit);
      const losses = allTrades
        .filter((t) => t.profit < 0)
        .map((t) => Math.abs(t.profit));
      const totalWins = wins.reduce((s, v) => s + v, 0);
      const totalLosses = losses.reduce((s, v) => s + v, 0);
      const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;
      const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
      const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

      // Equity curve
      const allTradesSorted = allTrades.sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      const equityCurve: { date: string; balance: number }[] = [
        { date: `${year}-01-01`, balance: data.initialBalance },
      ];
      allTradesSorted.forEach((t) => {
        equityCurve.push({ date: t.date, balance: t.balance });
      });

      // Max drawdown
      let maxDrawdown = 0;
      let peak = data.initialBalance;
      equityCurve.forEach((p) => {
        if (p.balance > peak) peak = p.balance;
        const dd = peak > 0 ? ((peak - p.balance) / peak) * 100 : 0;
        if (dd > maxDrawdown) maxDrawdown = dd;
      });

      const activeMonths = months.filter((m) => m.tradeCount > 0);
      const bestMonth =
        activeMonths.length > 0
          ? activeMonths.reduce((best, m) =>
              m.totalProfit > best.totalProfit ? m : best
            )
          : null;
      const worstMonth =
        activeMonths.length > 0
          ? activeMonths.reduce((worst, m) =>
              m.totalProfit < worst.totalProfit ? m : worst
            )
          : null;

      return {
        year,
        months,
        totalProfit,
        totalTrades,
        winrate,
        profitFactor,
        maxDrawdown,
        avgWin,
        avgLoss,
        bestMonth,
        worstMonth,
        equityCurve,
      };
    },
    [getMonthMetrics, data.initialBalance]
  );

  const getAllYearMetrics = useCallback((): YearMetrics[] => {
    const years = new Set<number>();
    Object.keys(data.trades).forEach((date) => {
      years.add(parseInt(date.split("-")[0]));
    });
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years)
      .sort()
      .map((y) => getYearMetrics(y));
  }, [data.trades, getYearMetrics]);

  return (
    <JournalContext.Provider
      value={{
        data,
        setInitialBalance,
        setTrade,
        deleteTrade,
        getTrade,
        getMonthTrades,
        getMonthMetrics,
        getYearMetrics,
        getAllYearMetrics,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used within JournalProvider");
  return ctx;
}
