# Deployment Guide

## Production Architecture
For a stable and cost-effective production environment, we recommend the following stack:

### 1. Database → Neon or Supabase
Both providers offer managed PostgreSQL instances with excellent free tiers.
- **Setup**: Create a new project and copy the Connection String.
- **Prisma**: Ensure your `DATABASE_URL` in production uses the pooled connection string (typically ending in `?pgbouncer=true`).

### 2. Backend → Render or Railway
- **Config**: Connect your GitHub repository.
- **Build Command**: `cd roommate-server && npm install && npx prisma generate && npm run build`
- **Start Command**: `node dist/server.js` (or similar depending on your build output).

### 3. Frontend → Vercel or Netlify
- **Config**: Vercel automatically detects Vite projects.
- **Root Directory**: `roommate-app`
- **Build Command**: `npm run build`
- **Environment Variable**: Set `VITE_API_URL` to your production backend URL.

## Environment Variables Checklist
| Variable | Value (Example) |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://...` |
| `JWT_ACCESS_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Long random string |
| `VITE_API_URL` | `https://api.yourdomain.com` |

## Production Tips
- **Keep Secrets Secret**: Never commit your `.env` files.
- **HTTPS**: Ensure your backend allows CORS only from your production frontend domain.
- **Versioning**: Always run `npx prisma migrate deploy` in your CI/CD pipeline before starting the new server version.
