# Supabase Integration Guide — Trading Journal Pro

Este documento describe cómo integrar el Trading Journal con Supabase como backend. La arquitectura actual está completamente preparada para este cambio.

## Arquitectura Actual

### Capa de Abstracción de Datos

El Trading Journal utiliza un servicio de datos completamente separado del UI:

- **`client/src/services/dataService.ts`** — Capa de abstracción que define todas las operaciones de datos
- **`client/src/contexts/JournalContext.tsx`** — Contexto React que usa el servicio de datos

### Flujo de Datos

```
UI Components (Calendar, Dashboard, etc.)
    ↓
JournalContext (useJournal hook)
    ↓
dataService.ts (async functions)
    ↓
localStorage (actual storage — reemplazar por Supabase)
```

## Funciones a Reemplazar

Todas las funciones en `dataService.ts` usan `localStorage` actualmente. Para integrar Supabase, reemplaza cada función:

### Trades API

| Función | Actual | Supabase |
|---------|--------|----------|
| `getTrades()` | localStorage | `supabase.from('trades').select()` |
| `getTradesByAccount(accountId)` | localStorage filter | `supabase.from('trades').select().eq('account_id', accountId)` |
| `getTradesByDate(date)` | localStorage filter | `supabase.from('trades').select().eq('date', date)` |
| `getTradeById(id)` | localStorage find | `supabase.from('trades').select().eq('id', id).single()` |
| `createTrade(trade)` | localStorage push | `supabase.from('trades').insert([trade]).select().single()` |
| `updateTrade(id, updates)` | localStorage update | `supabase.from('trades').update(updates).eq('id', id).select().single()` |
| `deleteTrade(id)` | localStorage filter | `supabase.from('trades').delete().eq('id', id)` |

### Accounts API

| Función | Actual | Supabase |
|---------|--------|----------|
| `getAccounts()` | localStorage | `supabase.from('accounts').select()` |
| `getAccountById(id)` | localStorage find | `supabase.from('accounts').select().eq('id', id).single()` |
| `createAccount(account)` | localStorage push | `supabase.from('accounts').insert([account]).select().single()` |
| `updateAccount(id, updates)` | localStorage update | `supabase.from('accounts').update(updates).eq('id', id).select().single()` |
| `deleteAccount(id)` | localStorage filter | `supabase.from('accounts').delete().eq('id', id)` |

## Estructura de Base de Datos Supabase

### Tabla `accounts`

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initial_balance DECIMAL NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  user_id TEXT NOT NULL -- Para multi-usuario en el futuro
);
```

### Tabla `trades`

```sql
CREATE TABLE trades (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  result TEXT CHECK (result IN ('TP', 'SL', 'BE', NULL)),
  profit DECIMAL NOT NULL,
  instrument TEXT NOT NULL,
  notes TEXT,
  imageUrl TEXT,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

## Pasos para Integración

### 1. Instalar Cliente Supabase

```bash
npm install @supabase/supabase-js
```

### 2. Crear Archivo de Configuración

Crear `client/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. Reemplazar Funciones en `dataService.ts`

Ejemplo: Reemplazar `getTrades()`:

```typescript
// ANTES (localStorage)
export async function getTrades(): Promise<Trade[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem("trading-journal-trades");
      const trades = data ? JSON.parse(data) : [];
      resolve(trades);
    }, 50);
  });
}

// DESPUÉS (Supabase)
import { supabase } from '@/lib/supabase';

export async function getTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*');
  
  if (error) throw error;
  return data || [];
}
```

### 4. Agregar Variables de Entorno

En `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Manejar Autenticación (Opcional)

Para multi-usuario, agregar autenticación Supabase:

```typescript
// En dataService.ts
import { supabase } from '@/lib/supabase';

// Obtener usuario actual
const { data: { user } } = await supabase.auth.getUser();

// Filtrar datos por usuario
export async function getTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user?.id);
  
  if (error) throw error;
  return data || [];
}
```

## Ventajas de Esta Arquitectura

✅ **Separación de Concerns** — UI completamente independiente de la capa de datos  
✅ **Fácil Testing** — Puedes mockear `dataService.ts` para tests  
✅ **Escalabilidad** — Cambiar backend sin tocar componentes React  
✅ **Mantenibilidad** — Toda la lógica de datos en un solo lugar  
✅ **Compatibilidad** — Funciones async permiten cualquier backend (REST, GraphQL, etc.)

## Checklist de Integración

- [ ] Crear proyecto en Supabase
- [ ] Crear tablas `accounts` y `trades`
- [ ] Instalar `@supabase/supabase-js`
- [ ] Crear `lib/supabase.ts`
- [ ] Reemplazar funciones en `dataService.ts`
- [ ] Agregar variables de entorno
- [ ] Probar en desarrollo
- [ ] Implementar autenticación (opcional)
- [ ] Migrar datos históricos (si aplica)

## Notas Importantes

1. **Tipos de Datos** — Asegúrate de que los tipos de Supabase coincidan con los tipos TypeScript en `dataService.ts`
2. **Timestamps** — Usa `created_at` como `TIMESTAMP` en Supabase
3. **IDs** — Mantén el formato de IDs consistente (ej: `trade-{timestamp}-{random}`)
4. **Cascadas** — Configura `ON DELETE CASCADE` en `trades.account_id` para eliminar trades cuando se elimina una cuenta
5. **Índices** — Crea índices en `account_id` y `date` en la tabla `trades` para mejor rendimiento

## Soporte para Offline-First (Futuro)

Si necesitas soporte offline, considera usar:

- **Supabase Realtime** — Sincronización en tiempo real
- **Offline Storage** — Guardar datos localmente y sincronizar cuando haya conexión
- **Conflict Resolution** — Manejar conflictos si hay cambios offline

La arquitectura actual permite agregar estas características sin cambios en el UI.
