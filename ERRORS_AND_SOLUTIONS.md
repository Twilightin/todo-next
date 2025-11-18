# Next.js + Supabase Todo App: Common Errors & Solutions

This document summarizes the main errors encountered and their solutions during the development and migration of your Next.js + Supabase todo app.

---

## 1. Import Path Errors (`@/` Symbol)

**Error:**
```
Module not found: Can't resolve '@/components/ui/button'
Module not found: Can't resolve '@/components/ui/input'
```
**Cause:**
- The `@/` alias was not resolving due to missing or misconfigured `jsconfig.json` or Turbopack/Next.js 16 not supporting it by default.

**Solution:**
- Add `baseUrl` to `jsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"]
      }
    }
  }
  ```
- If error persists, use **relative import paths** with explicit file extensions:
  ```js
  import { Input } from "../components/ui/input.js";
  import { Button } from "../components/ui/button.js";
  ```

---

## 2. API Route Import Error (Module not found)

**Error:**
```
Module not found: Can't resolve '@/lib/db'
Module not found: Can't resolve '../../../lib/server.js'
```
**Cause:**
- Turbopack/Next.js 16 requires explicit relative paths and correct file extensions.
- Your file was `server.ts`, not `server.js`.

**Solution:**
- Use relative path without extension (Next.js will resolve `.ts`):
  ```js
  import { createClient } from '../../../lib/server';
  ```

---

## 3. Supabase Connection Issues

**Error:**
- App can't connect to Supabase, or can only connect via JS SDK, not via `pg`.
- Data visible in debug page, but not in `/api/todos` route.

**Cause:**
- Supabase JS SDK works, but direct SQL (`pg`) may fail due to env var issues or SSL/policy.
- `.env.local` had multiple or commented `POSTGRES_URL` lines, or was missing the correct Supabase connection string.

**Solution:**
- Ensure `.env.local` only has one valid `POSTGRES_URL`:
  ```bash
  POSTGRES_URL=postgresql://postgres:<password>@db.<project_ref>.supabase.co:5432/postgres
  ```
- Restart dev server after editing `.env.local`.
- For JS SDK, use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 4. Row Level Security (RLS) Blocking Data

**Error:**
- Supabase returns empty data or error, even though table exists.

**Cause:**
- Supabase enables RLS by default. No policy = no data for anon key.

**Solution:**
- Add a policy in Supabase SQL Editor:
  ```sql
  CREATE POLICY "Allow read" ON todos
  FOR SELECT
  TO public
  USING (true);
  ```

---

## 5. API Route Migration: From `pg` to Supabase JS SDK

**Error:**
- Data not syncing, or API route can't connect to Supabase.

**Cause:**
- API route still using `pg` pool, not Supabase JS SDK.

**Solution:**
- Refactor API route to use Supabase JS SDK:
  ```js
  import { createClient } from '../../../lib/server';
  export async function GET(req) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('todos').select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
  // ...other CRUD methods
  ```

---

## 6. Package Not Installed

**Error:**
```
Module not found: Can't resolve '@supabase/ssr'
```
**Solution:**
- Run:
  ```bash
  npm install @supabase/ssr
  ```

---

## 7. JSX Compile Error in TypeScript

**Error:**
```
Cannot use JSX unless the '--jsx' flag is provided.
```
**Solution:**
- Ensure your file uses `.tsx` extension.
- In `tsconfig.json`, add:
  ```json
  "jsx": "react-jsx"
  ```

---

## 8. Debugging Supabase Data

**How to debug:**
- Create a debug page (e.g. `/app/instruments/debug.tsx`) to print out data and error from Supabase:
  ```tsx
  import { createClient } from '../../lib/server';
  export default async function DebugSupabase() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('todos').select();
    return (
      <div>
        <pre>data: {JSON.stringify(data, null, 2)}</pre>
        <pre>error: {JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
  ```

---

## 9. General Troubleshooting Steps

- Always restart dev server after changing `.env.local` or installing packages.
- Use relative imports with extensions if alias fails.
- Check Supabase Table Editor and Policies for permissions.
- Use debug pages to print error/data for quick diagnosis.
- Use correct keys for client/server (anon for browser, service role for server if needed).

---

**Author:** GitHub Copilot  
**Date:** 2025-11-14
