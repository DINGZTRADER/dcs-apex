# Environment Variables Reference

Complete guide for all environment variables needed for the Directors Command System.

---

## Required Environment Variables

### 1. DATABASE_URL (Required)

**Full PostgreSQL connection string for Supabase database**

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Used by:**
- Prisma ORM for database connections
- Database migrations (`npx prisma migrate`)
- Database seeding (`npx prisma db seed`)
- Server Actions for database queries

**⚠️ Important**: Must include:
- Protocol: `postgresql://`
- Username: `[user]`
- Password: `[password]`
- Host: `[host]`
- Port: `5432`
- Database: `postgres`

---

### 2. NEXT_PUBLIC_SUPABASE_URL (Required)

**Supabase project URL**

```
https://serwpembqbajljdvgrxk.supabase.co
```

**Used by:**
- Supabase client initialization
- Authentication (login/signup)
- Supabase API calls

**Note:** 
- Must start with `https://`
- Uses `.supabase.co` (NOT `.supabase.com`)
- This is the public API URL

---

### 3. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (Required)

**Supabase publishable/anonymous key**

```
sb_publishable_your_key_here
```

**Used by:**
- Supabase client for authenticated requests
- Public API access

**Note:**
- This is the publishable key (safe for client-side)
- Starts with `sb_publishable_`
- Used in browser/client code

---

## Optional Environment Variables

### NODE_ENV (Optional)

**Node.js environment**

```
production
```

**Values:**
- `development` - Development mode
- `production` - Production mode
- `test` - Testing mode

**Default:** Automatically set by deployment platforms

---

## Complete .env File Example

For local development, create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://serwpembqbajljdvgrxk.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sb_publishable_your_key_here"

# Node Environment (optional)
NODE_ENV="development"
```

---

## For Vercel Deployment

### Setting Environment Variables in Vercel

1. **Go to your project** → Settings → Environment Variables
2. **Add each variable:**
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://[user]:[password]@[host]:[port]/[database]`
   - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

3. **Repeat for:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### After Adding Variables

- **New deployment required** - Vercel will automatically trigger a new deployment
- Variables are encrypted and stored securely
- They're available at build time and runtime

---

## Security Notes

### ✅ Safe to Commit
- `.env.example` (without real values)
- Documentation files

### ❌ Never Commit
- `.env` files with real credentials
- `.env.local` files
- Any file containing passwords or tokens

### ✅ Already Protected
Your `.gitignore` already excludes:
- `.env*` files
- `*.env` files
- Environment variable files

---

## Verification

### Check if Variables are Set (Local)

```bash
# Windows PowerShell
Get-Content .env | Select-String -Pattern "DATABASE_URL|SUPABASE"
```

### Check if Variables are Working

```bash
# Test database connection
npx prisma db pull

# Test Supabase connection
npm run dev
# Then check browser console for errors
```

---

## Troubleshooting

### "Missing DATABASE_URL"
- Verify `.env` file exists in project root
- Check variable name is exactly `DATABASE_URL`
- Ensure value includes full connection string

### "Connection refused"
- Check database URL is correct
- Verify Supabase database is running
- Check password is correct
- Verify host and port are correct

### "Missing Supabase environment variables"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Verify `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is set
- Check variable names match exactly (case-sensitive)
- Restart development server after adding variables

---

## Getting Supabase Credentials

If you need to find your Supabase credentials:

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: `serwpembqbajljdvgrxk`
3. **Go to**: Settings → API
4. **Find**:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
5. **Go to**: Settings → Database
6. **Find Connection String**: `DATABASE_URL` (use the "Connection pooling" or "Direct connection" string)

---

## Quick Reference

| Variable | Required | Example Value |
|----------|----------|---------------|
| `DATABASE_URL` | ✅ Yes | `postgresql://user:pass@host:port/db` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ✅ Yes | `sb_publishable_xxx` |
| `NODE_ENV` | ⚪ Optional | `production` |

---

**Last Updated**: January 11, 2025  
**Status**: ✅ Ready for Deployment
