# Fix Database Connection Error

The build is failing because Prisma can't connect to the database. This is likely a connection string issue.

---

## Error Details

```
Error: P1001: Can't reach database server at `db.serwpembqbajljdvgrxk.supabase.co:5432`
```

This suggests:
1. ⚠️ DATABASE_URL might be incomplete
2. ⚠️ Using direct connection instead of connection pooler (for serverless/Vercel)

---

## Fix: Use Connection Pooling URL

For Vercel/serverless deployments, you **must** use Supabase's **connection pooling URL** (port 6543), not the direct connection (port 5432).

### ❌ Direct Connection (Won't work on Vercel)
```
postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:5432/postgres
```

### ✅ Connection Pooling URL (Correct for Vercel)
```
postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:6543/postgres?pgbouncer=true
```

**Key differences:**
- Port: `6543` (connection pooler) instead of `5432` (direct)
- Query parameter: `?pgbouncer=true` (enables connection pooling)

---

## How to Get Connection Pooling URL from Supabase

### Option 1: Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: `serwpembqbajljdvgrxk`
3. Go to: **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **Connection pooling** tab (NOT "Direct connection")
6. Select **Transaction mode** (recommended)
7. Copy the connection string

### Option 2: Construct Manually

**Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

**Your values:**
```
postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:6543/postgres?pgbouncer=true
```

---

## Steps to Fix

### Step 1: Get Connection Pooling URL

1. Go to Supabase Dashboard
2. Settings → Database
3. Connection pooling → Transaction mode
4. Copy the connection string

### Step 2: Update DATABASE_URL in Vercel

1. Go to: **Vercel** → **Your Project** → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Replace with connection pooling URL:
   ```
   postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:6543/postgres?pgbouncer=true
   ```
5. **Important**: Make sure it includes:
   - Port `6543` (NOT 5432)
   - `?pgbouncer=true` at the end
6. Select all environments (Production, Preview, Development)
7. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Select **Production**
4. ✅ Use build cache (optional)
5. Click **Redeploy**

---

## Why Connection Pooling?

### Direct Connection (Port 5432)
- ❌ Limited to ~100 connections
- ❌ Not suitable for serverless
- ❌ Can cause connection errors
- ❌ Doesn't work well with Vercel

### Connection Pooling (Port 6543)
- ✅ Handles many concurrent connections
- ✅ Perfect for serverless/Vercel
- ✅ More reliable
- ✅ Recommended by Supabase for serverless

---

## Alternative: Transaction Pooling URL

If transaction mode doesn't work, try **Session mode**:

```
postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

But **Transaction mode** is recommended for Prisma.

---

## Complete Environment Variables Checklist

After fixing, verify all 3 variables in Vercel:

| Variable | Value | Status |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:6543/postgres?pgbouncer=true` | ⚠️ **FIX THIS** |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://serwpembqbajljdvgrxk.supabase.co` | ✅ Correct |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_bYWBI9rk5ltORr0Lkde5nA_UUipqAtG` | ✅ Correct |

---

## Quick Fix Summary

**Change DATABASE_URL from:**
```
❌ postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:5432/postgres
```

**To:**
```
✅ postgresql://postgres:J35u5chr15t15l0rd@db.serwpembqbajljdvgrxk.supabase.co:6543/postgres?pgbouncer=true
```

**Key changes:**
- Port: `5432` → `6543`
- Add: `?pgbouncer=true`

---

## After Fixing

1. ✅ Update DATABASE_URL in Vercel
2. ✅ Redeploy
3. ✅ Monitor build logs
4. ✅ Should see: "Prisma migrations applied successfully"
5. ✅ Build should complete successfully

---

**Status**: ⚠️ **ACTION REQUIRED** - Update DATABASE_URL to use connection pooling (port 6543)
