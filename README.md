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

## Environment
See `.env.example`. Only the Supabase publishable/anon key belongs in the browser. Keep OpenAI and any future payment secrets server-side.

## Current release status
MVP source scaffold. Live Supabase, AI, payments, email delivery and production deployment require separate credentials and acceptance testing. No real subscriptions are being charged yet.

## Safety
Payday Peace is a cash-flow planning and record-keeping tool, not a bank, lender, investment adviser, tax adviser or credit-repair service. It does not connect to bank accounts or move money.
