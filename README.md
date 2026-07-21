# OpsPro - Mini ERP + CRM Portal

Full-stack case-study implementation for a wholesale/distribution operations portal.

## Stack

- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL, Zod, JWT, bcrypt
- Frontend: React, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, lucide-react
- Deployment target: Vercel frontend, Render backend, Neon PostgreSQL

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | Admin@1234 |
| Sales | sales@demo.com | Sales@1234 |
| Warehouse | warehouse@demo.com | Whouse@1234 |
| Accounts | accounts@demo.com | Accounts@1234 |

## Local Setup

Prerequisites: Node.js 20+, PostgreSQL, Git.

```bash
npm install
```

Backend:

```bash
cd backend
cp .env.example .env
# Fill DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api/v1`
- Health check: `http://localhost:3001/health`

## Environment Variables

Backend variables live in `backend/.env` and production service settings:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: long random secret for token signing
- `JWT_EXPIRES_IN`: default `15d`
- `PORT`: default `3001`
- `NODE_ENV`: `development` or `production`
- `ALLOWED_ORIGINS`: comma-separated frontend origins for CORS

Frontend variables live in `frontend/.env` and Vercel settings:

- `VITE_API_URL`: backend API base URL, for example `http://localhost:3001/api/v1`

## Architecture

The repo is a monorepo with `backend`, `frontend`, and `docs`.

The backend exposes versioned REST endpoints under `/api/v1`. Each module owns its route, schema, and service layer. Prisma models cover users, customers, follow-ups, products, stock movements, challans, and challan items. Challan confirmation runs in a database transaction: it checks stock first, deducts product stock, writes OUT movements, and then marks the challan confirmed.

The frontend is a protected admin-style SPA. It uses a shared OpsPro shell, persisted JWT auth, TanStack Query for server state, role-aware navigation, and the stock-density stripe component across dashboard, products, and challan creation.

## API Documentation

Import these files into Postman:

- `docs/OpsPro-ERP-CRM.postman_collection.json`
- `docs/OpsPro-Local.postman_environment.json`
- `docs/OpsPro-Production.postman_environment.json`

Run one of the Login requests first. The test script stores `token` automatically for the rest of the collection.

## Deployment

1. Push the repo to GitHub.
2. Create a Neon PostgreSQL project and copy the pooled connection string.
3. Create a Render Web Service:
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm run start`
   - Add backend environment variables.
4. Run production migrations and seed:
   ```bash
   cd backend
   DATABASE_URL="<neon-url>" npx prisma migrate deploy
   DATABASE_URL="<neon-url>" npm run seed
   ```
5. Create a Vercel project:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set `VITE_API_URL=https://your-render-service.onrender.com/api/v1`
6. Update Render `ALLOWED_ORIGINS` with the final Vercel URL and redeploy.

AWS deployment is optional for this case study and treated as a bonus. This implementation uses free hosting targets to avoid paid infrastructure.

## Assumptions

- Mobile numbers use Indian `+91XXXXXXXXXX` format.
- GST number is optional and validated only when provided.
- Accounts users are read-only.
- Warehouse users can manage products and stock, and can view customers/challans.
- Only draft challans can be edited or confirmed.
- Cancelling a confirmed challan restores stock with reversing IN movements.
- Product warehouse/location is a free-text field, not a separate warehouse table.
- Currency is INR.

## Known Limitations

- No PDF invoice export yet.
- No AWS S3 product image upload.
- No email reminders for follow-up dates.
- No field-level audit log outside stock movements.
- Render free tier may cold-start after inactivity.
