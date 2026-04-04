/*
 * Data Service — Trading Journal Pro
 * Abstracción de datos completamente separada del UI
 * Diseñada para ser reemplazada fácilmente por Supabase en el futuro
 * 
 * Estructura:
 * - Todas las operaciones son async
 * - Mock temporal usa localStorage
 * - Fácil de reemplazar por llamadas a Supabase sin tocar el UI
 */

export interface Trade {
  id: string;
  account_id: string;
  date: string; // "YYYY-MM-DD"
  result: "TP" | "SL" | "BE" | null;
  profit: number;
  instrument: string;
  notes: string;
  imageUrl?: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  initial_balance: number;
  color: string;
  created_at: string;
  active: boolean;
}

// ============================================================================
// TRADES API
// ============================================================================

/**
 * Obtener todos los trades
 * Futuro: SELECT * FROM trades
 */
export async function getTrades(): Promise<Trade[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem("trading-journal-trades");
      const trades = data ? JSON.parse(data) : [];
      resolve(trades);
    }, 50); // Simular latencia de red
  });
}

/**
 * Obtener trades de una cuenta específica
 * Futuro: SELECT * FROM trades WHERE account_id = ?
 */
export async function getTradesByAccount(accountId: string): Promise<Trade[]> {
  const trades = await getTrades();
  return trades.filter((t) => t.account_id === accountId);
}

/**
 * Obtener trades de una fecha específica
 * Futuro: SELECT * FROM trades WHERE date = ?
 */
export async function getTradesByDate(date: string): Promise<Trade[]> {
  const trades = await getTrades();
  return trades.filter((t) => t.date === date);
}

/**
 * Obtener un trade por ID
 * Futuro: SELECT * FROM trades WHERE id = ?
 */
export async function getTradeById(id: string): Promise<Trade | null> {
  const trades = await getTrades();
  return trades.find((t) => t.id === id) || null;
}

/**
 * Crear un nuevo trade
 * Futuro: INSERT INTO trades (account_id, date, result, profit, instrument, notes, created_at) VALUES (...)
 */
export async function createTrade(trade: Omit<Trade, "id" | "created_at">): Promise<Trade> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTrade: Trade = {
        ...trade,
        id,
        created_at: new Date().toISOString(),
      };

      const trades = JSON.parse(localStorage.getItem("trading-journal-trades") || "[]");
      trades.push(newTrade);
      localStorage.setItem("trading-journal-trades", JSON.stringify(trades));

      resolve(newTrade);
    }, 50);
  });
}

/**
 * Actualizar un trade existente
 * Futuro: UPDATE trades SET ... WHERE id = ?
 */
export async function updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trades = JSON.parse(localStorage.getItem("trading-journal-trades") || "[]");
      const index = trades.findIndex((t: Trade) => t.id === id);

      if (index === -1) {
        resolve(null);
        return;
      }

      const updatedTrade = {
        ...trades[index],
        ...updates,
        id, // preserve id
        created_at: trades[index].created_at, // preserve created_at
      };

      trades[index] = updatedTrade;
      localStorage.setItem("trading-journal-trades", JSON.stringify(trades));

      resolve(updatedTrade);
    }, 50);
  });
}

/**
 * Eliminar un trade
 * Futuro: DELETE FROM trades WHERE id = ?
 */
export async function deleteTrade(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trades = JSON.parse(localStorage.getItem("trading-journal-trades") || "[]");
      const filtered = trades.filter((t: Trade) => t.id !== id);

      if (filtered.length === trades.length) {
        resolve(false); // No se encontró
        return;
      }

      localStorage.setItem("trading-journal-trades", JSON.stringify(filtered));
      resolve(true);
    }, 50);
  });
}

// ============================================================================
// ACCOUNTS API
// ============================================================================

/**
 * Obtener todas las cuentas
 * Futuro: SELECT * FROM accounts
 */
export async function getAccounts(): Promise<Account[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem("trading-journal-accounts");
      const accounts = data ? JSON.parse(data) : [];
      resolve(accounts);
    }, 50);
  });
}

/**
 * Obtener una cuenta por ID
 * Futuro: SELECT * FROM accounts WHERE id = ?
 */
export async function getAccountById(id: string): Promise<Account | null> {
  const accounts = await getAccounts();
  return accounts.find((a) => a.id === id) || null;
}

/**
 * Crear una nueva cuenta
 * Futuro: INSERT INTO accounts (name, initial_balance, color, created_at, active) VALUES (...)
 */
export async function createAccount(account: Omit<Account, "id" | "created_at">): Promise<Account> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newAccount: Account = {
        ...account,
        id,
        created_at: new Date().toISOString(),
      };

      const accounts = JSON.parse(localStorage.getItem("trading-journal-accounts") || "[]");
      accounts.push(newAccount);
      localStorage.setItem("trading-journal-accounts", JSON.stringify(accounts));

      resolve(newAccount);
    }, 50);
  });
}

/**
 * Actualizar una cuenta
 * Futuro: UPDATE accounts SET ... WHERE id = ?
 */
export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = JSON.parse(localStorage.getItem("trading-journal-accounts") || "[]");
      const index = accounts.findIndex((a: Account) => a.id === id);

      if (index === -1) {
        resolve(null);
        return;
      }

      const updatedAccount = {
        ...accounts[index],
        ...updates,
        id, // preserve id
        created_at: accounts[index].created_at, // preserve created_at
      };

      accounts[index] = updatedAccount;
      localStorage.setItem("trading-journal-accounts", JSON.stringify(accounts));

      resolve(updatedAccount);
    }, 50);
  });
}

/**
 * Eliminar una cuenta
 * Futuro: DELETE FROM accounts WHERE id = ?
 */
export async function deleteAccount(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accounts = JSON.parse(localStorage.getItem("trading-journal-accounts") || "[]");
      const filtered = accounts.filter((a: Account) => a.id !== id);

      if (filtered.length === accounts.length) {
        resolve(false); // No se encontró
        return;
      }

      localStorage.setItem("trading-journal-accounts", JSON.stringify(filtered));

      // También eliminar todos los trades asociados
      const trades = JSON.parse(localStorage.getItem("trading-journal-trades") || "[]");
      const filteredTrades = trades.filter((t: Trade) => t.account_id !== id);
      localStorage.setItem("trading-journal-trades", JSON.stringify(filteredTrades));

      resolve(true);
    }, 50);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Inicializar datos por defecto si no existen
 */
export async function initializeDefaultData(): Promise<void> {
  const accounts = await getAccounts();
  const trades = await getTrades();

  if (accounts.length === 0) {
    await createAccount({
      name: "Cuenta Principal",
      initial_balance: 1000,
      color: "#10b981",
      active: true,
    });
  }

  if (trades.length === 0) {
    // Sin trades por defecto
  }
}

/**
 * Limpiar todos los datos (para desarrollo/testing)
 */
export async function clearAllData(): Promise<void> {
  localStorage.removeItem("trading-journal-trades");
  localStorage.removeItem("trading-journal-accounts");
}
