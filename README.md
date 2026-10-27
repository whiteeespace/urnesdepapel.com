# Urnes de Papel

Bilingual (FR/EN) site for Urnes de Papel, handmade biodegradable funeral urns. Built with Next.js 16, Payload CMS 3 (admin at `/admin`) and next-intl. Deploys to Vercel.

The project brief, the client's source documents and the open questions are in [docs/brief.md](docs/brief.md).

## Stack

- **Next.js 16** (App Router, Turbopack, `proxy.ts`), React 19, TypeScript (strict)
- **Payload CMS 3**, running inside the same Next.js app on Postgres. It provides the admin, localized content, image uploads and the request inbox.
- **next-intl 4** for routing and UI strings, with localized URLs (`/fr/tarifs` ↔ `/en/pricing`)
- **SCSS modules**, with shared tokens in `src/styles/global.scss` and mixins in `src/styles/_mixins.scss`
- **react-hook-form + zod** for the request form. The same schema validates in the browser and in the server action.

## Getting started

Requires Node 24 (`nvm use`) and a local Postgres (Postgres.app works).

```bash
createdb urnesdepapel
cp .env.example .env        # then set PAYLOAD_SECRET (openssl rand -hex 32)
npm install
npm run seed                # loads the urns, prices and page copy in FR and EN
npm run dev
```

- Site: http://localhost:3000 (redirects to `/fr` or `/en` from the browser language)
- Admin: http://localhost:3000/admin (the first visit asks you to create the first admin user)

In development, Payload syncs the database schema automatically. After changing a collection or global, run `npm run generate:types`. Before deploying, run `npm run payload migrate:create <name>`.

## Where things live

| What | Where |
|---|---|
| Pages (folder names are the French slugs) | `src/app/(frontend)/[locale]/` |
| Payload admin and REST API | `src/app/(payload)/` (generated, do not edit) |
| Collections: urns, collections (models), options and prices, requests, images, users | `src/payload/collections/` |
| Page copy and site settings (globals) | `src/payload/globals/` |
| URL slugs per language | `src/i18n/routing.ts` |
| UI strings (buttons, labels, errors) | `src/messages/fr.json`, `src/messages/en.json` |
| Seed data | `content/urns.json`, `src/seed/` |
| Clickable design prototype | `design/prototype.html` |
| Title typeface source | `scripts/title-font/` |

**Title typeface (Urnes Titling):** the logo only contains U, R, N, E, S, D, P, A and L. `scripts/title-font/glyphs.py` builds the remaining capitals from parts of those letters (for example I from the L's stem, O from the D's bowl, V from the A turned over), along with French accents and basic punctuation. Lowercase maps to the same capitals, and digits fall back to Source Serif. To change a letter, edit its construction and rebuild:

```bash
python3 -m venv .venv-font && .venv-font/bin/pip install -r scripts/title-font/requirements.txt
.venv-font/bin/python scripts/title-font/review.py K M   # review sheets in public/_specimen (git-ignored)
.venv-font/bin/python scripts/title-font/build.py        # writes src/app/(frontend)/[locale]/_fonts/urnes-titling.woff2
```

**What the client edits in the admin:** urns, collections, prices, every page text in both languages, photos, contact details, and the address that receives requests. UI labels such as button text live in `src/messages`.

**Requests:** the form saves each request in the admin (*Demandes*) and emails the address set in *Réglages du site → Recevoir les demandes à*. Without `RESEND_API_KEY`, the email is printed to the server console instead.

## Deploying to Vercel

1. Import the repo into Vercel.
2. From Vercel's Storage tab, add **Neon Postgres** and **Vercel Blob**. This sets `DATABASE_URL` (rename it from `POSTGRES_URL` if needed) and `BLOB_READ_WRITE_TOKEN`.
3. Add these environment variables:
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.urnesdepapel.com`)
   - optionally `RESEND_API_KEY` and `EMAIL_FROM`
4. Deploy. `vercel.json` runs `npm run ci`, which applies migrations and then builds.
5. Seed production once from your machine, with `DATABASE_URL` pointing at Neon: `npm run seed`. Then create the admin user at `/admin`.

Content edits in the admin refresh the public pages immediately, through on-demand revalidation.
