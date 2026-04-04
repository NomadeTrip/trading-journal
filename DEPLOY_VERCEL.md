# Guía de Despliegue en Vercel — Trading Journal Pro

## Requisitos Previos

1. **Cuenta de Vercel** — Crea una en [vercel.com](https://vercel.com)
2. **Repositorio Git** — El proyecto debe estar en GitHub, GitLab o Bitbucket
3. **Credenciales de Supabase** — Ya configuradas en `.env.local`

---

## Paso 1: Preparar el Proyecto

El proyecto ya está configurado para Vercel:

- ✅ `vercel.json` con redirecciones SPA
- ✅ `package.json` sin dependencias de servidor
- ✅ Build script: `pnpm run build` (genera `dist/`)
- ✅ Variables de entorno configuradas

---

## Paso 2: Subir a GitHub

```bash
# Inicializar repositorio (si no lo has hecho)
cd /home/ubuntu/trading-journal
git init
git add .
git commit -m "Trading Journal Pro - Initial commit"

# Crear repositorio en GitHub y agregar remoto
git remote add origin https://github.com/TU_USUARIO/trading-journal.git
git push -u origin main
```

---

## Paso 3: Conectar Vercel

### Opción A: Desde la Dashboard de Vercel

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New"** → **"Project"**
3. Selecciona tu repositorio `trading-journal`
4. Vercel detectará automáticamente:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`

### Opción B: Desde la CLI

```bash
npm install -g vercel
vercel
```

---

## Paso 4: Configurar Variables de Entorno

En la dashboard de Vercel, ve a **Settings** → **Environment Variables** y agrega:

```
VITE_SUPABASE_URL=https://wimxfneaghsjmgailhhr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_yNSl2u2B2X-Z6Js9KBC0MA_rR0baQds
```

**Importante**: Estas variables deben estar disponibles en **Production**, **Preview** y **Development**.

---

## Paso 5: Configurar Supabase

### Crear Tablas en Supabase

1. Ve a [supabase.com](https://supabase.com) → Tu proyecto
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de `SETUP_SUPABASE.sql`:

```sql
-- Crear tabla accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_balance DECIMAL(15, 2) NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Crear tabla trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('TP', 'SL', 'BE')),
  profit DECIMAL(15, 2) NOT NULL,
  instrument TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para accounts
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para trades
CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);
```

### Habilitar Autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Ve a **URL Configuration** y agrega tu dominio de Vercel:
   - Site URL: `https://tu-proyecto.vercel.app`
   - Redirect URLs: `https://tu-proyecto.vercel.app/`

---

## Paso 6: Deploy

Una vez configurado todo:

1. Haz clic en **Deploy** en Vercel
2. Espera a que termine el build (2-3 minutos)
3. Tu app estará disponible en `https://tu-proyecto.vercel.app`

---

## Paso 7: Verificar Funcionamiento

1. Abre tu dominio de Vercel
2. Crea una cuenta (email + contraseña)
3. Crea una cuenta de trading
4. Agrega un trade
5. Verifica que los datos se sincronicen con Supabase

---

## Solución de Problemas

### "Blank page" al cargar

- Abre la consola del navegador (F12)
- Busca errores de CORS o autenticación
- Verifica que las variables de entorno estén correctas en Vercel

### "Cannot find module '@supabase/supabase-js'"

- Ejecuta `pnpm install` localmente
- Haz push a GitHub
- Redeploy en Vercel

### Errores de autenticación

- Verifica que las URLs de Supabase estén correctas
- Asegúrate de que la clave anon_key sea pública
- Revisa las políticas RLS en Supabase

---

## Próximos Pasos

1. **Dominio personalizado** — En Vercel, ve a Settings → Domains y agrega tu dominio
2. **SSL automático** — Vercel lo proporciona gratis
3. **Monitoreo** — Usa Vercel Analytics para ver métricas de uso
4. **CI/CD** — Los pushes a main se despliegan automáticamente

---

## Comandos Útiles

```bash
# Probar build localmente
pnpm run build
pnpm run preview

# Ver logs de Vercel
vercel logs

# Redeploy
vercel --prod
```

---

¡Tu Trading Journal Pro está listo para producción! 🚀
