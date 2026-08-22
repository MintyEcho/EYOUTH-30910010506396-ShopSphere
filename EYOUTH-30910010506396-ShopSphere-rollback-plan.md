# Rollback Plan — ShopSphere Production
Student ID: EYOUTH-30910010506396

## 1. Detection (Task 1 monitoring)
- UptimeRobot pings https://eyouth-30910010506396-shop-sphere.vercel.app/api/health every 5 minutes.
- A failed release is detected when the monitor flips to DOWN (health returns 503/degraded or the function errors), and/or when error-level entries spike in the production logs.
- Logs are read in production at: Vercel → project → Deployments → select deployment → Functions → api/index → Logs. Entries carry a timestamp and severity level.

## 2. Restore the previous working version
1. Vercel → affected project (backend/frontend) → Deployments.
2. Identify the last deployment marked Ready that predates the failed release.
3. Open its preview URL and confirm /api/health returns 200 ok.
4. Click ⋯ → Redeploy / Promote to Production.
5. Confirm the production URL serves the restored version and UptimeRobot returns to UP.
6. Investigate the failed release on a branch (never on main) and re-release through the CI/CD pipeline.