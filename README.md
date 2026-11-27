# Iligan Cheesecake House — website

The official website of **Iligan Cheesecake House**, a cheesecake café & restaurant in Iligan City. *Because Life is so Cheesy!*

Built with **Next.js 16** (App Router, Cache Components), **React 19**, **Tailwind CSS 4** and **Supabase**.

## What's inside

**Public site**
- Home, Menu (search, category filter, sold-out badges), Black Card, VIP Rooms & Events, Contact.
- `/card` — the "One Tap, Whole Access" page that the calling-card QR opens.
- Inquiry form, VIP Room booking request (blocks Mondays and already-booked slots), Black Card application.
- Chef VIP Special Menu prices are only sent to signed-in Black Card members.
- Motion: opening screen, scroll reveals, marquees, 3D tilt cards, a flipping Black Card, hero parallax, gallery lightbox, count-ups. All of it respects `prefers-reduced-motion`.

**Black Card member area** (`/account`)
- Sign in with mobile number (or card number) + 4-digit PIN.
- Digital card with a live QR that changes every 25 seconds, so screenshots can't be reused.
- Voucher balance (3 × ₱400), activity, upcoming bookings, room booking at member rates, change PIN.

**Admin** (`/admin`)
- Dashboard, Counter (scan or type a card; free drink, ₱400 voucher with member PIN, birthday slice), Reservations (7-day room grid, confirm or decline), Black Card members (approve applications, register in store, reset PIN, renew, suspend), Inquiries, Menu (dine-in prices, sold out, hide), Website & staff (offer text, announcement bar, calling-card QR download, staff accounts).

## Getting started

```bash
npm install
npm run setup     # creates .env.local with fresh secrets + demo logins, and seeds data
npm run dev
```

The demo owner login and demo member login are written to `.env.local` (never committed).

### Data store
- With `SUPABASE_URL` and `SUPABASE_SECRET_KEY` set, the site uses the Supabase database. Run `npm run setup` once to create the owner account and demo member there.
- Without them, it falls back to a local file at `data/db.json`. This is for offline development only, because serverless hosts don't keep files.

Supabase tables: `staff`, `members`, `applications`, `bookings`, `inquiries`, `activity`, `menu_overrides`, `settings`. Row-level security is on with no public policies, so only the server, using the secret key, can read or write.

## Still waiting on the client
- New logo files.
- Dine-in price list and drink sizes (from the calling-card menu). These can also be entered in **Admin → Menu**.
- Sir Angelo's phone number and Messenger link.
- Full Black Card perks and terms; Seminar Room photo.
