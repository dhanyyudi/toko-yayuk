This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Keep Alive workflow setup (GitHub Actions)

If `.github/workflows/supabase-keep-alive.yml` fails, configure these repository settings:

- **Required** secret: `SUPABASE_ANON_KEY`
- **Required** variable or secret: `SUPABASE_URL`

Fallback names also supported by the workflow:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (secret)
- `NEXT_PUBLIC_SUPABASE_URL` (secret)

### How to add in GitHub

1. Open repository **Settings** → **Secrets and variables** → **Actions**.
2. Add secret `SUPABASE_ANON_KEY` with your Supabase anon/public API key.
3. Add variable `SUPABASE_URL` with your project URL.
4. Re-run the workflow from **Actions** → **Supabase Keep Alive** → **Run workflow**.

### Where to get these values in Supabase

1. Open your project dashboard.
2. Go to **Project Settings** → **API**.
3. Copy:
   - **Project URL** → use as `SUPABASE_URL` (format: `https://<project-ref>.supabase.co`)
   - **anon public** key → use as `SUPABASE_ANON_KEY`

If you only know your **project ID** (project ref), you can build the URL directly:

- Project ID: `xqbrqstkgizyhqzjdfxk`
- `SUPABASE_URL`: `https://xqbrqstkgizyhqzjdfxk.supabase.co`

> Note: The anon key cannot be derived from project ID. You must copy it from **Project Settings → API** (or **Connect → App Frameworks**).

Tip: In your screenshot, the project URL is already visible on the main project page and should match this format.

### Robust behavior

The workflow now avoids dependency on a specific table (like `products`):

1. It first pings `GET /rest/v1/` with OpenAPI accept header.
2. If that fails, it falls back to `GET /auth/v1/settings`.

So as long as your Supabase URL and anon key are valid, the keep-alive job can still pass even if table names change.
