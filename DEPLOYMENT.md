# Directors Command System - Deployment Guide

## Pre-Deployment Checklist ✅

### Critical Issues Fixed
- ✅ Financial Position Dashboard added (Receivables - Expenses = Net Amount)
- ✅ Payment overpayment validation added
- ✅ All CRUD operations validated
- ✅ Data integrity verified
- ✅ Financial calculations verified

### System Status
**Status**: ✅ **READY FOR DEPLOYMENT**

All critical audit findings have been addressed.

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file (for local) or configure environment variables in your deployment platform:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1"

# Supabase (if using Supabase Auth)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Next.js
NODE_ENV="production"
```

**⚠️ Security Note**: Never commit `.env` files to version control. Use environment variable management in your deployment platform.

---

## Build & Test

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Database Migrations
```bash
# Ensure database is set up
npx prisma migrate deploy
```

**Note**: For first-time setup, you may need to run:
```bash
npx prisma migrate dev
```

### 4. Seed Database (Optional)
```bash
# Seed initial data (users, staff, students, expenses)
npx prisma db seed

# Seed fee structures and payments
npx ts-node --require dotenv/config prisma/seed-fees.ts
```

### 5. Build for Production
```bash
npm run build
```

### 6. Test Production Build Locally
```bash
npm start
```

Visit `http://localhost:3000` to verify the application works.

---

## Deployment Platforms

### Vercel (Recommended)

**Why Vercel**: Optimized for Next.js, automatic deployments, built-in analytics.

#### Steps:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   
   Or connect your GitHub repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables (see above)

4. **Database Setup**:
   - Ensure your PostgreSQL database is accessible from Vercel
   - If using Supabase, database is already configured
   - Run migrations: `npx prisma migrate deploy` (via Vercel CLI or GitHub Actions)

5. **Post-Deployment**:
   ```bash
   # Run migrations
   vercel env pull .env.local
   npx prisma migrate deploy
   
   # Optional: Seed database
   npx prisma db seed
   ```

#### Vercel Configuration

Create `vercel.json` (optional):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Environment variables: Add in Netlify dashboard

---

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.js` (if exists):
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

Build and run:
```bash
docker build -t dcs-apex .
docker run -p 3000:3000 --env-file .env.local dcs-apex
```

---

## Post-Deployment Tasks

### 1. Verify Database Connection
- Test login functionality
- Verify data loads correctly
- Check database queries

### 2. Verify Critical Features
- ✅ Financial Position Dashboard displays correctly
- ✅ Payment recording works
- ✅ Fee assignment works
- ✅ Expense tracking works
- ✅ All CRUD operations function

### 3. Security Checklist
- ✅ Environment variables are secure (not exposed in client code)
- ✅ Authentication works
- ✅ Protected routes redirect correctly
- ✅ Database credentials are secure

### 4. Performance Checks
- ✅ Pages load within acceptable time (< 3 seconds)
- ✅ Database queries are optimized
- ✅ Images/assets load correctly

### 5. Monitoring Setup
- Set up error tracking (Sentry, LogRocket, etc.)
- Set up analytics (Vercel Analytics, Google Analytics)
- Monitor database performance

---

## Database Migrations in Production

**Important**: Always run migrations before deploying code changes that require schema updates.

```bash
# Using Prisma
npx prisma migrate deploy

# Or via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

**Backup Strategy**: Always backup your database before running migrations in production.

---

## Rollback Plan

If issues occur after deployment:

1. **Quick Rollback** (Vercel):
   - Go to Deployments
   - Click on previous working deployment
   - Click "Promote to Production"

2. **Database Rollback**:
   ```bash
   # Revert last migration
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

3. **Code Rollback**:
   - Revert to previous Git commit
   - Redeploy

---

## Support & Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DATABASE_URL is correct
   - Check database is accessible
   - Verify network/firewall settings

2. **Build Errors**:
   - Check Node.js version (requires Node 20+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

3. **Runtime Errors**:
   - Check server logs
   - Verify environment variables
   - Check database migrations are applied

---

## Maintenance

### Regular Tasks
- Monitor error logs
- Review database performance
- Update dependencies (monthly)
- Backup database (daily/weekly)

### Updates
1. Pull latest changes
2. Install dependencies: `npm install`
3. Run migrations: `npx prisma migrate deploy`
4. Build and test: `npm run build && npm start`
5. Deploy

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build succeeds
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Financial calculations verified
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Documentation updated

---

**Last Updated**: January 11, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
