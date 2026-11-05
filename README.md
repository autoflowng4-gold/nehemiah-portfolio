# Nehemiah portfolio — Stage 2

Stage 1 extended with the supplied fixed tree video, original portrait after the introduction, email/password accounts, private visitor messaging and an owner inbox. No GitHub push or deployment is performed.

## Local setup
1. Install Bun, then run `bun install`.
2. Copy `.env.example` to `.env` and enter your backend's public URL and publishable key. Never use a privileged key in a VITE variable.
3. Run `bun run dev` (Vite). Run `bun run test` for input and route tests.
4. For production use `bun run build`. This TanStack Start site includes its framework SSR runtime; it is not a plain static HTML export.

## Separate packages
The frontend ZIP contains the runnable site source and media. The backend ZIP contains PostgreSQL schema migrations, RLS policies, role provisioning, and setup/test instructions. The backend is managed auth/database/realtime infrastructure, not a separate Node server. Apply backend migrations in filename order before using chat.

## Configuration and deployment
- Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Framework authenticated middleware: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` if used. The chat itself uses browser requests with database-enforced authorization.
- Configure auth Site URL to your production origin and explicitly allow `/auth` and `/reset-password` on production and local development origins. Keep email verification enabled. Verify delivery and password recovery from a real mailbox.
- Lovable Cloud: account settings are in More → Users → Auth settings; redirect settings are under Advanced. Other hosted instances must configure equivalent email/password, redirect and email-sender settings.
- For Vercel, use a TanStack Start-compatible runtime adapter. The bundled Lovable configuration currently targets its hosting runtime; migration to a Vercel adapter and deployment are not verified here. Do not deploy it as a static-only site.

## Content and media
Text is in `src/content/portfolio.ts`. Media uses CDN pointers in preview; downloadable frontend replaces those pointers with local media URLs. Missing work history, contact details, additional skills and implemented AutoFlowNG features remain explicit placeholders. No CV has been invented.

## Privacy and owner setup
Visitors have one persistent conversation. Their display name and messages are stored; email remains in managed Auth. Visitors can request account/conversation deletion by sending Nehemiah a message. A trusted operator must provision the real owner account before requests can be processed. See backend setup instructions; there is no public owner signup or hardcoded owner email.

## Verification
See `STAGE_2_VERIFICATION.md` for checks performed and blockers. Do not treat the site as production-ready until real owner access, confirmation email and recovery have been verified.
