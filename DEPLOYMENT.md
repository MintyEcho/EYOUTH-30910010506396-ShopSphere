# Deployment guide - Task 1: Production Deployment

Student ID: EYOUTH-30910010506396

## 1. Production database - Supabase (PostgreSQL)

1. Create a project at https://supabase.com
2. Go to Project Settings > Database > Connection string
3. Copy the "Transaction" pooled connection string (port 6543) and the "Direct" connection string (port 5432)
4. You will use these as `DATABASE_URL` and `DIRECT_URL`

## 2. Production MongoDB - MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Add a database user and allow network access from anywhere (0.0.0.0/0), or Vercel's IP ranges if you want it tighter
3. Copy the connection string, use it as `MONGO_URI`

## 3. Backend - Vercel

1. Push the repo to GitHub (see naming rule below)
2. In Vercel, "Add New Project", import the repo, set the **root directory** to `backend`
3. Framework preset: Vercel auto-detects Express (zero config) from `backend/src/app.js` / `backend/src/index.js` - no `vercel.json` needed for the backend
4. Add environment variables in Vercel's dashboard (Project Settings > Environment Variables) - do NOT put any of these in the code or commit a `.env` file:
   - `DATABASE_URL`, `DIRECT_URL` (from Supabase)
   - `MONGO_URI` (from Atlas)
   - `JWT_SECRET`
   - `CORS_ORIGIN` (fill in after the frontend is deployed, see step 4)
   - `SMTP_*` if you want real welcome emails
5. Deploy. Run the migration once against the production database from your machine:
   ```
   cd backend
   DATABASE_URL="<supabase direct url>" DIRECT_URL="<supabase direct url>" npx prisma migrate deploy
   ```
6. Note the deployed URL, e.g. `https://eyouth-30910010506396-shopsphere-backend.vercel.app`

## 4. Frontend - Vercel

1. "Add New Project" again, same repo, root directory `frontend`
2. Add environment variable `VITE_API_URL` = `<backend url from step 3>/api`
3. Deploy. Note the deployed URL, e.g. `https://eyouth-30910010506396-shopsphere-frontend.vercel.app`
4. Go back to the backend project's environment variables, set `CORS_ORIGIN` to this frontend URL, redeploy the backend

## 5. Known limitation - image uploads

Multer's disk storage does not persist on Vercel's serverless filesystem - uploaded images will not survive between requests in production. For this project, either:
- swap `backend/src/middlewares/upload.js` to upload to an object store (Vercel Blob, S3, Cloudinary), or
- note this limitation in the submission if image upload in production is out of scope for Task 1

## 6. Naming rule

Rename the GitHub repository itself to `EYOUTH-30910010506396-ShopSphere` (Settings > repository name). Both Vercel projects and this repo should carry that name so the deliverable is traceable back to the student ID.

## 7. Verify the four protections are ACTIVE on the deployed backend

The rubric checks behavior, not code. Run these against your live backend URL (not localhost) after deploying:

**HTTPS** - Vercel serves everything over HTTPS by default. Just confirm the URL you were given starts with `https://` and loads without a certificate warning.

**Helmet** - check the response headers:
```
curl -I https://<your-backend>.vercel.app/
```
Look for `x-content-type-options: nosniff` and similar headers Helmet adds. If they're missing, Helmet isn't active on the deployed instance (e.g. stale deploy).

**CORS** - from a browser console on a domain that is NOT your frontend's origin, or with curl:
```
curl -I -H "Origin: https://not-your-frontend.example.com" https://<your-backend>.vercel.app/api/products
```
The `access-control-allow-origin` header should NOT reflect that origin - only your actual `CORS_ORIGIN` value should be allowed.

**Rate limiting** - hit an API route more than 300 times in 15 minutes (or temporarily lower `max` in `app.js` to something like 5 for a quick manual test, redeploy, test, then set it back):
```
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code}\n" https://<your-backend>.vercel.app/api/products; done
```
Once the limit is hit you should see `429` responses.

## 8. Health check and uptime monitoring

The backend exposes `GET /api/health`, which checks both Postgres and MongoDB and returns:
```
200 { "status": "ok", "checks": { "postgres": "ok", "mongo": "ok" } }
```
or `503` with `"status": "degraded"` if either database is unreachable.

1. Confirm it responds from the public URL:
   ```
   curl https://<your-backend>.vercel.app/api/health
   ```
2. Go to https://uptimerobot.com, create a free account
3. Add New Monitor > HTTP(s) > paste the health-check URL above > set check interval (e.g. 5 minutes)
4. Confirm UptimeRobot shows the monitor as "Up" after its first check

## 9. Visibility checklist

Before submitting Task 1, confirm each of these actually loads for someone who did not build it:
- [ ] Frontend URL loads and lists products (data pulled from the live backend, not mock data)
- [ ] Backend root URL (`/`) returns `{"status":"API running"}`
- [ ] `/api/health` returns 200 with both checks `ok`
- [ ] Register/login works end-to-end against Supabase
- [ ] A new product/order actually persists (proves writes work, not just reads)
- [ ] Admin dashboard stats load (confirms both Postgres and Mongo are reachable in production)
- [ ] Helmet headers, CORS restriction, and rate-limit 429s all confirmed per section 7
- [ ] UptimeRobot monitor registered and reporting "Up"
- [ ] No `.env` file or secret value committed anywhere in the repo (`git log -p | grep -i "DATABASE_URL\|SECRET"` should return nothing from actual values)
- [ ] Repo, and both Vercel project names, follow `EYOUTH-30910010506396-ShopSphere`
