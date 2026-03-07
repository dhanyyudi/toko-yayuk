# Supabase Keep Alive (GitHub Actions)

Configure these in **GitHub → Settings → Secrets and variables → Actions**:

- Secret: `SUPABASE_ANON_KEY`
- Secret or variable: `SUPABASE_URL`

Fallback names supported by workflow:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (secret)
- `NEXT_PUBLIC_SUPABASE_URL` (secret)

## Supabase values

Get values from **Supabase → Project Settings → API**:

- `SUPABASE_URL` format: `https://<project-ref>.supabase.co`
- `SUPABASE_ANON_KEY`: anon public key

> Security note: never commit real project values or API keys to the repository.

## Robust ping behavior

Workflow tries endpoints in order:

1. `GET /rest/v1/` with `Accept: application/openapi+json`
2. fallback `GET /auth/v1/settings`

If either endpoint returns `2xx`, the keep-alive job succeeds.
