# EYOUTH-30910010506396-ShopSphere

Full-stack e-commerce app. React frontend, Express backend, PostgreSQL, MongoDB.

## Stack

React, Vite, React Query, Tailwind CSS
Node.js, Express, Prisma, MongoDB (Mongoose)
JWT auth, Jest, Supertest, React Testing Library, MSW, Docker

## Setup

Start databases:
```
docker compose up -d
```

Backend:
```
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Runs on http://localhost:5000

Frontend:
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Runs on http://localhost:3000

## Environment variables

backend/.env
- DATABASE_URL, MONGO_URI, JWT_SECRET
- SMTP_HOST/PORT/USER/PASS/FROM (optional, for welcome emails; logs instead if empty)

frontend/.env
- VITE_API_URL (defaults to http://localhost:5000/api)

## Testing

```
cd backend && npm test
cd frontend && npm test
```

## Notes

- Seed script creates an admin user, a customer user, sample categories and products.
- Product images are stored under backend/uploads and linked by URL.
- Reviews and activity logs live in MongoDB, everything else in PostgreSQL.
