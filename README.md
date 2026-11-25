# Payday Peace AI

Independent, mobile-first paycheck and bill planning SaaS for US consumers.

## MVP scope
- Supabase email/password authentication
- Paycheck schedule and paycheck-to-bill planning
- Bill and expense tracking
- Personal cash-flow dashboard
- Optional authenticated AI planning assistant
- Freemium subscription-ready architecture (payments are not enabled yet)

## Stack
Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase Auth/Postgres, OpenAI API.

## Local development
Requires Node.js 20.9+.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Configure a **new Supabase project dedicated to Payday Peace AI** and run the SQL migration in `supabase/migrations`. Never reuse OneCore credentials or databases.


## Deployment layout

- **Frontend:** Vercel, linked to this repository's `main` branch.
- **Backend API:** Render web service running `node server.js`.
- **Database and authentication:** the dedicated Payday Peace AI Supabase project.

### Vercel environment variables

- `NEXT_PUBLIC_API_BASE_URL`: the Render API base URL.
- `NEXT_PUBLIC_SUPABASE_URL`: the Payday Peace AI Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the Supabase publishable key (safe for browser use).

### Render environment variables

- `SUPABASE_URL`: the Payday Peace AI Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY`: the Supabase publishable key.
- `FRONTEND_ORIGIN`: the exact production Vercel origin, e.g. `https://payday-peace-ai.vercel.app`.
- `OPENAI_API_KEY`: required to enable AI assistant responses; add it as a secret in Render, never in Vercel's public variables.
- `OPENAI_MODEL`: optional; defaults to `gpt-4o-mini`.

The Render API exposes `GET /health` for health checks and authenticated `POST /api/assistant` for AI requests. User data is queried using the caller's Supabase access token and owner-scoped RLS; no service-role key is used.

## Environment
See `.env.example`. Only the Supabase publishable/anon key belongs in the browser. Keep OpenAI and any future payment secrets server-side.

## Current release status
MVP source scaffold. Live Supabase, AI, payments, email delivery and production deployment require separate credentials and acceptance testing. No real subscriptions are being charged yet.

## Safety
Payday Peace is a cash-flow planning and record-keeping tool, not a bank, lender, investment adviser, tax adviser or credit-repair service. It does not connect to bank accounts or move money.
