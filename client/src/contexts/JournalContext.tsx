/*
 * JournalContext — Trading Journal Pro (Multi-Account)
 * Design: Swiss International Style meets Financial Dashboard
 * Manages multiple trading accounts with dynamic balance calculation
 * 
 * IMPORTANTE: Este contexto ahora usa el servicio de datos (dataService.ts)
 * para abstraer completamente la lógica de datos del UI.
 * Esto permite reemplazar fácilmente el backend sin tocar el UI.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import * as dataService from "@/services/dataService";

export type TradeResult = "TP" | "SL" | "BE" | null;

// Tipos de UI (camelCase para compatibilidad con el código existente)
export interface TradingAccount {
  id: string;
  name: string;
  initialBalance: number;
  createdAt: string;
  color: string;
  active: boolean;
}

export interface TradeEntry {
  id: string;
  date: string;
  accountId: string;
  result: TradeResult;
  profit: number;
  instrument: string;
  notes: string;
  imageUrl: string;
  createdAt: string;
}

export interface JournalData {
  accounts: Record<string, TradingAccount>;
  trades: Record<string, TradeEntry>;
}

interface JournalContextType {
  data: JournalData;
  loading: boolean;
  
  // Account management
  createAccount: (name: string, initialBalance: number, color: string) => Promise<string>;
  updateAccount: (accountId: string, updates: Partial<TradingAccount>) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  getAccount: (accountId: string) => TradingAccount | undefined;
  getAllAccounts: () => TradingAccount[];
  
  // Trade management
  setTrade: (date: string, accountId: string, trade: Omit<TradeEntry, "id" | "date" | "accountId">) => Promise<void>;
  updateTrade: (tradeId: string, updates: Partial<Omit<TradeEntry, "id" | "date" | "accountId" | "createdAt">>) => Promise<void>;
  deleteTrade: (tradeId: string) => Promise<void>;
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

export const ACCOUNT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const JournalContext = createContext<JournalContextType | null>(null);

// Helper: Convertir formato dataService a formato UI
function convertAccount(acc: dataService.Account): TradingAccount {
  return {
    id: acc.id,
    name: acc.name,
    initialBalance: acc.initial_balance,
    createdAt: acc.created_at,
    color: acc.color,
    active: acc.active,
  };
}

function convertTrade(trade: dataService.Trade): TradeEntry {
  return {
    id: trade.id,
    date: trade.date,
    accountId: trade.account_id,
    result: trade.result,
    profit: trade.profit,
    instrument: trade.instrument,
    notes: trade.notes,
    imageUrl: trade.imageUrl || "",
    createdAt: trade.created_at,
  };
}

// Helper: Convertir formato UI a formato dataService
function unconvertAccount(acc: TradingAccount): dataService.Account {
  return {
    id: acc.id,
    name: acc.name,
    initial_balance: acc.initialBalance,
    created_at: acc.createdAt,
    color: acc.color,
    active: acc.active,
  };
}

function unconvertTrade(trade: TradeEntry): dataService.Trade {
  return {
    id: trade.id,
    date: trade.date,
    account_id: trade.accountId,
    result: trade.result,
    profit: trade.profit,
    instrument: trade.instrument,
    notes: trade.notes,
    imageUrl: trade.imageUrl,
    created_at: trade.createdAt,
  };
}

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<JournalData>({ accounts: {}, trades: {} });
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Inicializar datos por defecto si es necesario
        await dataService.initializeDefaultData();
        
        // Cargar cuentas y trades
        const [accounts, trades] = await Promise.all([
          dataService.getAccounts(),
          dataService.getTrades(),
        ]);

        // Convertir a formato UI
        const accountsMap: Record<string, TradingAccount> = {};
        for (const acc of accounts) {
          accountsMap[acc.id] = convertAccount(acc);
        }

        const tradesMap: Record<string, TradeEntry> = {};
        for (const trade of trades) {
          tradesMap[trade.id] = convertTrade(trade);
        }

        setData({ accounts: accountsMap, trades: tradesMap });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Account management
  const createAccount = useCallback(async (name: string, initialBalance: number, color: string) => {
    const newAccount = await dataService.createAccount({
      name,
      initial_balance: initialBalance,
      color,
      active: true,
    });

    setData((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [newAccount.id]: convertAccount(newAccount),
      },
    }));

    return newAccount.id;
  }, []);

  const updateAccount = useCallback(async (accountId: string, updates: Partial<TradingAccount>) => {
    const updateData: Partial<dataService.Account> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.initialBalance) updateData.initial_balance = updates.initialBalance;
    if (updates.color) updateData.color = updates.color;
    if (updates.active !== undefined) updateData.active = updates.active;

    const updated = await dataService.updateAccount(accountId, updateData);
    if (updated) {
      setData((prev) => ({
        ...prev,
        accounts: {
          ...prev.accounts,
          [accountId]: convertAccount(updated),
        },
      }));
    }
  }, []);

  const deleteAccount = useCallback(async (accountId: string) => {
    const deleted = await dataService.deleteAccount(accountId);
    if (deleted) {
      setData((prev) => {
        const newAccounts = { ...prev.accounts };
        delete newAccounts[accountId];

        const newTrades = Object.fromEntries(
          Object.entries(prev.trades).filter(([_, trade]) => trade.accountId !== accountId)
        );

        return { ...prev, accounts: newAccounts, trades: newTrades };
      });
    }
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
    async (date: string, accountId: string, trade: Omit<TradeEntry, "id" | "date" | "accountId">) => {
      const newTrade = await dataService.createTrade({
        date,
        account_id: accountId,
        result: trade.result,
        profit: trade.profit,
        instrument: trade.instrument,
        notes: trade.notes,
        imageUrl: trade.imageUrl,
      });

      setData((prev) => ({
        ...prev,
        trades: {
          ...prev.trades,
          [newTrade.id]: convertTrade(newTrade),
        },
      }));
    },
    []
  );

  const updateTrade = useCallback(
    async (tradeId: string, updates: Partial<Omit<TradeEntry, "id" | "date" | "accountId" | "createdAt">>) => {
      const updateData: Partial<dataService.Trade> = {};
      if (updates.result !== undefined) updateData.result = updates.result;
      if (updates.profit !== undefined) updateData.profit = updates.profit;
      if (updates.instrument) updateData.instrument = updates.instrument;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.imageUrl) updateData.imageUrl = updates.imageUrl;

      const updated = await dataService.updateTrade(tradeId, updateData);
      if (updated) {
        setData((prev) => ({
          ...prev,
          trades: {
            ...prev.trades,
            [tradeId]: convertTrade(updated),
          },
        }));
      }
    },
    []
  );

  const deleteTrade = useCallback(async (tradeId: string) => {
    const deleted = await dataService.deleteTrade(tradeId);
    if (deleted) {
      setData((prev) => {
        const newTrades = { ...prev.trades };
        delete newTrades[tradeId];
        return { ...prev, trades: newTrades };
      });
    }
  }, []);

  const getTrade = useCallback(
    (tradeId: string) => data.trades[tradeId],
    [data.trades]
  );

  // Queries
  const getTradesByDate = useCallback(
    (date: string) => {
      return Object.values(data.trades)
        .filter((t) => t.date === date)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
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

  // Metrics
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

  const getAccountMetrics = useCallback(
    (accountId: string, year?: number, month?: number): AccountMetrics => {
      const account = data.accounts[accountId];
      if (!account) {
        return {
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
      }

      let trades = getTradesByAccount(accountId);

      if (year && month) {
        trades = getMonthTrades(accountId, year, month);
      } else if (year) {
        const yearPrefix = `${year}-`;
        trades = trades.filter((t) => t.date.startsWith(yearPrefix));
      }

      const tpCount = trades.filter((t) => t.result === "TP").length;
      const slCount = trades.filter((t) => t.result === "SL").length;
      const beCount = trades.filter((t) => t.result === "BE").length;
      const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
      const currentBalance = account.initialBalance + totalProfit;
      const returnPct = (totalProfit / account.initialBalance) * 100;
      const winrate = trades.length > 0 ? (tpCount / trades.length) * 100 : 0;

      return {
        accountId,
        accountName: account.name,
        currentBalance,
        initialBalance: account.initialBalance,
        totalProfit,
        returnPct,
        tradeCount: trades.length,
        tpCount,
        slCount,
        beCount,
        winrate,
      };
    },
    [data.accounts, getTradesByAccount, getMonthTrades]
  );

  const getYearMetrics = useCallback(
    (accountId: string, year: number): YearMetrics => {
      const baseMetrics = getAccountMetrics(accountId, year);
      const trades = getTradesByAccount(accountId).filter((t) => t.date.startsWith(`${year}-`));

      // Calculate months
      const monthsMap: Record<number, TradeEntry[]> = {};
      for (let m = 1; m <= 12; m++) {
        monthsMap[m] = getMonthTrades(accountId, year, m);
      }

      const months: MonthMetrics[] = [];
      for (let m = 1; m <= 12; m++) {
        const monthTrades = monthsMap[m];
        if (monthTrades.length > 0) {
          const metrics = getAccountMetrics(accountId, year, m);
          months.push({
            ...metrics,
            year,
            month: m,
          });
        }
      }

      // Best and worst month
      let bestMonth: MonthMetrics | null = null;
      let worstMonth: MonthMetrics | null = null;

      for (const m of months) {
        if (!bestMonth || m.totalProfit > bestMonth.totalProfit) bestMonth = m;
        if (!worstMonth || m.totalProfit < worstMonth.totalProfit) worstMonth = m;
      }

      // Profit factor
      const wins = trades.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
      const losses = Math.abs(trades.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
      const profitFactor = losses > 0 ? wins / losses : wins > 0 ? 999 : 0;

      // Max drawdown
      let maxDrawdown = 0;
      let peak = baseMetrics.initialBalance;
      let runningBalance = baseMetrics.initialBalance;

      for (const trade of trades) {
        runningBalance += trade.profit;
        if (runningBalance > peak) peak = runningBalance;
        const drawdown = ((peak - runningBalance) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }

      // Avg win/loss
      const wins_list = trades.filter((t) => t.profit > 0).map((t) => t.profit);
      const losses_list = trades.filter((t) => t.profit < 0).map((t) => Math.abs(t.profit));
      const avgWin = wins_list.length > 0 ? wins_list.reduce((a, b) => a + b, 0) / wins_list.length : 0;
      const avgLoss = losses_list.length > 0 ? losses_list.reduce((a, b) => a + b, 0) / losses_list.length : 0;

      // Equity curve
      const equityCurve: { date: string; balance: number }[] = [];
      let balance = baseMetrics.initialBalance;
      const sortedTrades = [...trades].sort((a, b) => a.date.localeCompare(b.date));

      for (const trade of sortedTrades) {
        balance += trade.profit;
        equityCurve.push({ date: trade.date, balance });
      }

      return {
        ...baseMetrics,
        year,
        months,
        profitFactor,
        maxDrawdown,
        avgWin,
        avgLoss,
        bestMonth,
        worstMonth,
        equityCurve,
      };
    },
    [getAccountMetrics, getTradesByAccount, getMonthTrades]
  );

  const getAllAccountsYearMetrics = useCallback(
    (year: number) => {
      const result: Record<string, YearMetrics> = {};
      for (const accountId of Object.keys(data.accounts)) {
        result[accountId] = getYearMetrics(accountId, year);
      }
      return result;
    },
    [data.accounts, getYearMetrics]
  );

  return (
    <JournalContext.Provider
      value={{
        data,
        loading,
        createAccount,
        updateAccount,
        deleteAccount,
        getAccount,
        getAllAccounts,
        setTrade,
        updateTrade,
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
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournal must be used within JournalProvider");
  }
  return context;
}
