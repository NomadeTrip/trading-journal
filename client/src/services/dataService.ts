import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export interface Trade {
  id: string;
  account_id: string;
  date: string;
  result: 'TP' | 'SL' | 'BE' | null;
  profit: number;
  instrument: string;
  notes: string;
  commission: number;
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

export async function getTrades(): Promise<Trade[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;

  return (data || []).map((trade: any) => ({
    id: trade.id,
    account_id: trade.account_id,
    date: trade.date,
    result: trade.result,
    profit: trade.profit,
    instrument: trade.instrument,
    notes: trade.notes,
    commission: trade.commission || 0,
    imageUrl: trade.image_url,
    created_at: trade.created_at,
  }));
}

export async function getTradesByAccount(accountId: string): Promise<Trade[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .eq('account_id', accountId)
    .order('date', { ascending: false });

  if (error) throw error;

  return (data || []).map((trade: any) => ({
    id: trade.id,
    account_id: trade.account_id,
    date: trade.date,
    result: trade.result,
    profit: trade.profit,
    instrument: trade.instrument,
    notes: trade.notes,
    commission: trade.commission || 0,
    imageUrl: trade.image_url,
    created_at: trade.created_at,
  }));
}

export async function getTradesByDate(date: string): Promise<Trade[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((trade: any) => ({
    id: trade.id,
    account_id: trade.account_id,
    date: trade.date,
    result: trade.result,
    profit: trade.profit,
    instrument: trade.instrument,
    notes: trade.notes,
    commission: trade.commission || 0,
    imageUrl: trade.image_url,
    created_at: trade.created_at,
  }));
}

export async function getTradeById(id: string): Promise<Trade | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    id: data.id,
    account_id: data.account_id,
    date: data.date,
    result: data.result,
    profit: data.profit,
    instrument: data.instrument,
    notes: data.notes,
    commission: data.commission || 0,
    imageUrl: data.image_url,
    created_at: data.created_at,
  };
}

export async function createTrade(trade: Omit<Trade, 'id' | 'created_at'>): Promise<Trade> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const id = `trade-${nanoid()}`;
  const { data, error } = await supabase
    .from('trades')
    .insert([
      {
        id,
        user_id: user.id,
        account_id: trade.account_id,
        date: trade.date,
        result: trade.result,
        profit: trade.profit,
        instrument: trade.instrument,
        notes: trade.notes,
        commission: trade.commission || 0,
        image_url: trade.imageUrl,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    account_id: data.account_id,
    date: data.date,
    result: data.result,
    profit: data.profit,
    instrument: data.instrument,
    notes: data.notes,
    commission: data.commission || 0,
    imageUrl: data.image_url,
    created_at: data.created_at,
  };
}

export async function updateTrade(id: string, updates: Partial<Omit<Trade, 'id' | 'created_at'>>): Promise<Trade | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const updateData: any = {};
  if (updates.result !== undefined) updateData.result = updates.result;
  if (updates.profit !== undefined) updateData.profit = updates.profit;
  if (updates.instrument !== undefined) updateData.instrument = updates.instrument;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.commission !== undefined) updateData.commission = updates.commission;
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;

  const { data, error } = await supabase
    .from('trades')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    id: data.id,
    account_id: data.account_id,
    date: data.date,
    result: data.result,
    profit: data.profit,
    instrument: data.instrument,
    notes: data.notes,
    commission: data.commission || 0,
    imageUrl: data.image_url,
    created_at: data.created_at,
  };
}

export async function deleteTrade(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

// ============================================================================
// ACCOUNTS API
// ============================================================================

export async function getAccounts(): Promise<Account[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((acc: any) => ({
    id: acc.id,
    name: acc.name,
    initial_balance: acc.initial_balance,
    color: acc.color,
    created_at: acc.created_at,
    active: acc.active,
  }));
}

export async function getAccountById(id: string): Promise<Account | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    initial_balance: data.initial_balance,
    color: data.color,
    created_at: data.created_at,
    active: data.active,
  };
}

export async function createAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const id = `account-${nanoid()}`;
  const { data, error } = await supabase
    .from('accounts')
    .insert([
      {
        id,
        user_id: user.id,
        name: account.name,
        initial_balance: account.initial_balance,
        color: account.color,
        active: account.active,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    initial_balance: data.initial_balance,
    color: data.color,
    created_at: data.created_at,
    active: data.active,
  };
}

export async function updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<Account | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.initial_balance !== undefined) updateData.initial_balance = updates.initial_balance;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.active !== undefined) updateData.active = updates.active;

  const { data, error } = await supabase
    .from('accounts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    initial_balance: data.initial_balance,
    color: data.color,
    created_at: data.created_at,
    active: data.active,
  };
}

export async function deleteAccount(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function initializeDefaultData(): Promise<void> {
  const accounts = await getAccounts();

  if (accounts.length === 0) {
    await createAccount({
      name: 'Cuenta Principal',
      initial_balance: 1000,
      color: '#10b981',
      active: true,
    });
  }
}

export async function clearAllData(): Promise<void> {
  // No-op: datos en Supabase no se pueden limpiar fácilmente
  // Esta función se mantiene por compatibilidad
}
