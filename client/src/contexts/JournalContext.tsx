/**
 * JournalContext — Trading Journal Pro (Multi-Account)
 * Design: Swiss International Style meets Financial Dashboard
 * Manages multiple trading accounts with dynamic balance calculation
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type TradeResult = "TP" | "SL" | "BE" | null;

export interface TradingAccount {
  id: string;
  name: string;
  initialBalance: number;
  createdAt: string; // "YYYY-MM-DD"
  color: string; // hex color for UI
  active: boolean;
}

export interface TradeEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  accountId: string; // which account this trade belongs to
  result: TradeResult;
  profit: number; // positive = gain, negative = loss
  instrument: string; // e.g., "EUR/USD", "NASDAQ", "BTC/USD"
  notes: string;
  imageUrl: string; // base64 or URL of trade screenshot
  createdAt: string; // timestamp for ordering multiple trades per day
}

export interface JournalData {
  accounts: Record<string, TradingAccount>; // keyed by account id
  trades: Record<string, TradeEntry>; // keyed by trade id
}

interface JournalContextType {
  data: JournalData;
  
  // Account management
  createAccount: (name: string, initialBalance: number, color: string) => string;
  updateAccount: (accountId: string, updates: Partial<TradingAccount>) => void;
  deleteAccount: (accountId: string) => void;
  getAccount: (accountId: string) => TradingAccount | undefined;
  getAllAccounts: () => TradingAccount[];
  
  // Trade management
  setTrade: (date: string, accountId: string, trade: Omit<TradeEntry, "id" | "date" | "accountId">) => void;
  deleteTrade: (tradeId: string) => void;
  getTrade: (tradeId: string) => TradeEntry | undefined;
  
  // Queries
  getTradesByDate: (date: string) => TradeEntry[];
  getTradesByAccount: (accountId: string) => TradeEntry[];
  getMonthTrades: (accountId: string, year: number, month: number) => TradeEntry[];
  
  // Metrics
  getAccountBalance: (accountId: string) => number;
  getAccountMetrics: (accountId: string, year?: number, month?: number) => AccountMetrics;
  getYearMetrics: (accountId: string, year: number) => YearMetrics;
  getAllAccountsYearMetrics: (year: number) => Record<string, YearMetrics>;
}

export interface AccountMetrics {
  accountId: string;
  accountName: string;
  currentBalance: number;
  initialBalance: number;
  totalProfit: number;
  returnPct: number;
  tradeCount: number;
  tpCount: number;
  slCount: number;
  beCount: number;
  winrate: number;
}

export interface YearMetrics extends AccountMetrics {
  year: number;
  months: MonthMetrics[];
  profitFactor: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  bestMonth: MonthMetrics | null;
  worstMonth: MonthMetrics | null;
  equityCurve: { date: string; balance: number }[];
}

export interface MonthMetrics extends AccountMetrics {
  year: number;
  month: number;
}

const STORAGE_KEY = "trading-journal-data-v2";
export const ACCOUNT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const defaultData: JournalData = {
  accounts: {
    "default-account": {
      id: "default-account",
      name: "Cuenta Principal",
      initialBalance: 1000,
      createdAt: new Date().toISOString().split("T")[0],
      color: ACCOUNT_COLORS[0],
      active: true,
    },
  },
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

  // Account management
  const createAccount = useCallback((name: string, initialBalance: number, color: string) => {
    const id = `account-${Date.now()}`;
    setData((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [id]: {
          id,
          name,
          initialBalance,
          createdAt: new Date().toISOString().split("T")[0],
          color,
          active: true,
        },
      },
    }));
    return id;
  }, []);

  const updateAccount = useCallback((accountId: string, updates: Partial<TradingAccount>) => {
    setData((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [accountId]: {
          ...prev.accounts[accountId],
          ...updates,
          id: accountId, // preserve id
        },
      },
    }));
  }, []);

  const deleteAccount = useCallback((accountId: string) => {
    setData((prev) => {
      const newAccounts = { ...prev.accounts };
      delete newAccounts[accountId];
      
      // Also delete all trades for this account
      const newTrades = Object.fromEntries(
        Object.entries(prev.trades).filter(([_, trade]) => trade.accountId !== accountId)
      );
      
      return { ...prev, accounts: newAccounts, trades: newTrades };
    });
  }, []);

  const getAccount = useCallback(
    (accountId: string) => data.accounts[accountId],
    [data.accounts]
  );

  const getAllAccounts = useCallback(
    () => Object.values(data.accounts).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [data.accounts]
  );

  // Trade management
  const setTrade = useCallback(
    (date: string, accountId: string, trade: Omit<TradeEntry, "id" | "date" | "accountId" | "createdAt">) => {
      const id = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        trades: {
          ...prev.trades,
          [id]: {
            ...trade,
            id,
            date,
            accountId,
            createdAt,
          },
        },
      }));
    },
    []
  );

  const deleteTrade = useCallback((tradeId: string) => {
    setData((prev) => {
      const newTrades = { ...prev.trades };
      delete newTrades[tradeId];
      return { ...prev, trades: newTrades };
    });
  }, []);

  const getTrade = useCallback(
    (tradeId: string) => data.trades[tradeId],
    [data.trades]
  );

  // Queries
  const getTradesByDate = useCallback(
    (date: string) => 
      Object.values(data.trades)
        .filter((t) => t.date === date)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [data.trades]
  );

  const getTradesByAccount = useCallback(
    (accountId: string) =>
      Object.values(data.trades)
        .filter((t) => t.accountId === accountId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data.trades]
  );

  const getMonthTrades = useCallback(
    (accountId: string, year: number, month: number): TradeEntry[] => {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return Object.values(data.trades)
        .filter((t) => t.accountId === accountId && t.date.startsWith(prefix))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [data.trades]
  );

  // Calculate current balance for an account
  const getAccountBalance = useCallback(
    (accountId: string): number => {
      const account = data.accounts[accountId];
      if (!account) return 0;
      
      const trades = getTradesByAccount(accountId);
      const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
      return account.initialBalance + totalProfit;
    },
    [data.accounts, getTradesByAccount]
  );

  // Account metrics for a specific period
  const getAccountMetrics = useCallback(
    (accountId: string, year?: number, month?: number): AccountMetrics => {
      const account = data.accounts[accountId];
      if (!account) return {
        accountId,
        accountName: "Unknown",
        currentBalance: 0,
        initialBalance: 0,
        totalProfit: 0,
        returnPct: 0,
        tradeCount: 0,
        tpCount: 0,
        slCount: 0,
        beCount: 0,
        winrate: 0,
      };

      let trades: TradeEntry[];
      if (year !== undefined && month !== undefined) {
        trades = getMonthTrades(accountId, year, month);
      } else {
        trades = getTradesByAccount(accountId);
      }

      const tpCount = trades.filter((t) => t.result === "TP").length;
      const slCount = trades.filter((t) => t.result === "SL").length;
      const beCount = trades.filter((t) => t.result === "BE").length;
      const tradeCount = trades.length;
      const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
      const winrate = tradeCount > 0 ? (tpCount / tradeCount) * 100 : 0;

      // For period metrics, calculate initial balance at start of period
      let periodInitialBalance = account.initialBalance;
      if (year !== undefined && month !== undefined && trades.length > 0) {
        const firstTradeOfPeriod = trades[0];
        const priorTrades = getTradesByAccount(accountId).filter(
          (t) => t.date < firstTradeOfPeriod.date
        );
        if (priorTrades.length > 0) {
          periodInitialBalance = account.initialBalance + priorTrades.reduce((s, t) => s + t.profit, 0);
        }
      }

      const currentBalance = periodInitialBalance + totalProfit;
      const returnPct =
        periodInitialBalance > 0
          ? ((currentBalance - periodInitialBalance) / periodInitialBalance) * 100
          : 0;

      return {
        accountId,
        accountName: account.name,
        currentBalance,
        initialBalance: periodInitialBalance,
        totalProfit,
        returnPct,
        tradeCount,
        tpCount,
        slCount,
        beCount,
        winrate,
      };
    },
    [data.accounts, getTradesByAccount, getMonthTrades]
  );

  // Year metrics for an account
  const getYearMetrics = useCallback(
    (accountId: string, year: number): YearMetrics => {
      const months: MonthMetrics[] = [];
      for (let m = 1; m <= 12; m++) {
        const metrics = getAccountMetrics(accountId, year, m);
        months.push({
          ...metrics,
          year,
          month: m,
        });
      }

      const allTrades = getTradesByAccount(accountId);
      const yearTrades = allTrades.filter((t) => t.date.startsWith(String(year)));
      const totalProfit = yearTrades.reduce((sum, t) => sum + t.profit, 0);
      const totalTrades = yearTrades.length;
      const tpCount = yearTrades.filter((t) => t.result === "TP").length;
      const winrate = totalTrades > 0 ? (tpCount / totalTrades) * 100 : 0;

      const wins = yearTrades.filter((t) => t.profit > 0).map((t) => t.profit);
      const losses = yearTrades.filter((t) => t.profit < 0).map((t) => Math.abs(t.profit));
      const totalWins = wins.reduce((s, v) => s + v, 0);
      const totalLosses = losses.reduce((s, v) => s + v, 0);
      const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;
      const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
      const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

      // Equity curve
      const account = data.accounts[accountId];
      const equityCurve: { date: string; balance: number }[] = [
        { date: `${year}-01-01`, balance: account?.initialBalance || 0 },
      ];
      yearTrades.forEach((t) => {
        const priorProfit = yearTrades
          .filter((tr) => tr.date <= t.date)
          .reduce((s, tr) => s + tr.profit, 0);
        equityCurve.push({
          date: t.date,
          balance: (account?.initialBalance || 0) + priorProfit,
        });
      });

      // Max drawdown
      let maxDrawdown = 0;
      let peak = account?.initialBalance || 0;
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
        accountId,
        accountName: account?.name || "Unknown",
        currentBalance: (account?.initialBalance || 0) + totalProfit,
        initialBalance: account?.initialBalance || 0,
        year,
        months,
        totalProfit,
        tradeCount: totalTrades,
        winrate,
        profitFactor,
        maxDrawdown,
        avgWin,
        avgLoss,
        bestMonth,
        worstMonth,
        equityCurve,
        tpCount: tpCount,
        slCount: yearTrades.filter((t) => t.result === "SL").length,
        beCount: yearTrades.filter((t) => t.result === "BE").length,
        returnPct: (account?.initialBalance || 0) > 0
          ? (((account?.initialBalance || 0) + totalProfit - (account?.initialBalance || 0)) / (account?.initialBalance || 0)) * 100
          : 0,
      };
    },
    [getTradesByAccount, data.accounts, getAccountMetrics]
  );

  // All accounts year metrics
  const getAllAccountsYearMetrics = useCallback(
    (year: number): Record<string, YearMetrics> => {
      const result: Record<string, YearMetrics> = {};
      Object.keys(data.accounts).forEach((accountId) => {
        result[accountId] = getYearMetrics(accountId, year);
      });
      return result;
    },
    [data.accounts, getYearMetrics]
  );

  return (
    <JournalContext.Provider
      value={{
        data,
        createAccount,
        updateAccount,
        deleteAccount,
        getAccount,
        getAllAccounts,
        setTrade,
        deleteTrade,
        getTrade,
        getTradesByDate,
        getTradesByAccount,
        getMonthTrades,
        getAccountBalance,
        getAccountMetrics,
        getYearMetrics,
        getAllAccountsYearMetrics,
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
