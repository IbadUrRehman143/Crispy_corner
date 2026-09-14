# Tordher Bites — Final Fixes

- Fixed customer signup Prisma validation bug: plaintext `password` is no longer passed to Prisma; only bcrypt `passwordHash` is stored.
- Added password show/hide controls to Login, Signup Password, and Confirm Password.
- Rebranded customer-facing app to **Tordher Bites**.
- Added a clear Tordher Bites logo image (`public/tordher-bites-logo.svg`) and browser icon (`app/icon.svg`).
- Logo is used in header, footer, customer authentication and staff login branding.
- Changed new order number prefix from `TB-` to `TDB-` and updated tracking hints.
- Polished checkout sizing, cards, sticky desktop summary, mobile stacking and auth responsiveness.
- Preserved English / Urdu / Pashto language system and global back navigation.
- Responsive rules cover mobile, tablet/iPad, laptop and desktop layouts.

## Run after extracting

```powershell
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Do not use `npm audit fix --force` as part of normal setup.
