# Tasty Bite — Phase 1 + 2 Production Build

Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma ORM, PostgreSQL, JWT-style secure admin cookie, Zod validation, Twilio SMS/WhatsApp integration point.

## Included
- Mobile-first menu, cart, COD checkout, pickup/delivery
- Server-side validation and server-side price recalculation
- PostgreSQL persistence through Prisma
- Unique order numbers and live tracking page (5-second polling)
- Twilio SMS or WhatsApp confirmation when real credentials are configured
- Protected `/admin/orders` screen for operational order-status updates
- Tasty Bite branding/logo

## Production setup
1. `npm install`
2. Copy `.env.example` to `.env` and set a real PostgreSQL URL (Neon/Supabase supported).
3. Set a strong `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run dev`
7. For Vercel, add the same environment variables in Project Settings and deploy.

## Messaging
Set Twilio credentials and `MESSAGE_CHANNEL=whatsapp` or `sms`. WhatsApp production messaging requires a provider-approved WhatsApp sender/template configuration where applicable. No fake provider credentials are included.

## Before public launch
Replace seeded sample menu/prices with Tasty Bite's actual approved menu, configure the real production database and domain, configure the real messaging sender, and test checkout/confirmation on the deployed HTTPS domain. Phase 1 + 2 are COD only; online payment is intentionally not included because it belongs to Phase 4 of the supplied project plan.

## Production launch
See `PRODUCTION_SETUP.md`. This build does not seed demo food or fake credentials. Use `npm run db:migrate`, `npm run menu:import`, `npm run db:seed`, `npm run production:check`, then `npm run build` after real environment values are configured.
