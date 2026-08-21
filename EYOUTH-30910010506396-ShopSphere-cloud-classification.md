# Cloud service classification - ShopSphere

Student ID: EYOUTH-30910010506396

| Service | Classification | Reason |
|---|---|---|
| Frontend hosting (Vercel, React build) | PaaS | We deploy source code and Vercel handles the build, runtime, CDN, and scaling - we never manage a server. |
| Backend hosting (Vercel serverless functions, Express) | PaaS | We deploy an application and Vercel provisions and scales the execution environment automatically; we manage code, not infrastructure. |
| Database (Supabase PostgreSQL) | PaaS | Supabase provisions, patches, and backs up the Postgres instance for us; we manage schema and data through Prisma, not the underlying server. |
