# Tasty Bite production setup

This repository intentionally contains **no fake production credentials and no fake menu**.

## 1. PostgreSQL
Create the production PostgreSQL database in Neon or Supabase and put its pooled/production connection string in `DATABASE_URL`.

## 2. Prisma migration
Run `npm run db:migrate`. The checked-in SQL migration creates the production tables, relations, checks and indexes.

## 3. Real menu/prices
Fill `data/menu.production.json` with the shop's real categories/products/prices, then run `npm run menu:import`. The importer refuses to run while the menu is empty.

## 4. Admin
Set a real `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` (12+ chars), and a random `AUTH_SECRET` (32+ chars). Run `npm run db:seed`. Passwords are stored as bcrypt hashes.

## 5. WhatsApp/SMS
Set Twilio production credentials and an approved sender. `MESSAGE_CHANNEL=whatsapp` uses WhatsApp; `sms` uses SMS. The app does not pretend a message was sent when credentials are absent.

## 6. Final build
Run `npm run production:check`, then `npm run build`. Test: menu -> cart -> COD checkout -> DB order -> confirmation -> tracking -> admin login/status update.

## 7. Vercel
Create a Vercel project, add the same production environment variables, deploy, then set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain and redeploy.

### Still required from the business owner
- PostgreSQL connection string
- Tasty Bite real menu, prices and item images
- Admin email/password (do not send passwords in public/shared chats)
- Twilio Account SID/Auth Token + approved WhatsApp/SMS sender
- Final domain name
