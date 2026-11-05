# Stage 2 verification

## Passed
- Stage 1 content sections and dark cyan/blue identity retained.
- Actual supplied video compressed from 11 MB to a web-friendly muted H.264 clip; fixed full-viewport media rectangle unchanged after scrolling from introduction to Projects.
- Original supplied portrait placed immediately after opening introduction; face and supplied blue ring preserved.
- Chromium desktop 1280×1800 and narrow mobile 360×800 checked; no mobile horizontal overflow. Menu opens/closes; controls remain accessible. Reduced-motion removes video and keeps poster. Data-saving uses the same still fallback.
- Automatic preview build/typecheck reports `build OK` after changes.
- Vitest: 2 files, 3 tests passed (routing and account/message validation).
- Changed chat/account files lint: zero errors, one fast-refresh warning for the shared auth hook export.
- Two independently authenticated temporary visitors and a temporary owner: sign-in, message send, reload persistence, visitor isolation, visitor inbox denial, owner reply and visitor readback, sign-out and later sign-in all passed through the actual UI.
- Real JWT/RLS checks: cross-conversation reads empty; cross-conversation sends, forged sender, self-owner grants and cross-read marking blocked. Conversation ownership update changes no row. Temporary accounts/conversations removed after testing.
- Database advisor: anonymous function grants tightened. Three intentional signed-in SECURITY DEFINER RPC warnings remain: access-checked start conversation, mark read and role check. No anonymous chat tables or role writes.

## Not verified / pending
- Real signup confirmation email delivery and password-reset email/recovery require a real mailbox and hosted redirect configuration. Reset UI is implemented; no delivery claim is made.
- Real owner privileges await Nehemiah's verified account identity. A temporary test owner is not Nehemiah and was removed. Provision instructions are in BACKEND_SETUP.md.
- Physical Android browser behaviour, tablet sizes, offline network loss and slow-network playback have not been exhaustively tested.
- No GitHub push, Vercel adapter conversion, deployment, custom domain or production security certification performed.
- Real contact details, experience/CV, expanded biography/skills and implemented AutoFlowNG features still await confirmation. No CV generated.

## Changed/created source
Portfolio components/content, root and index, global CSS, tree media pointers, auth provider, account form, chat UI, auth/reset/inbox pages, validation and tests, README/environment example, backend setup and architecture notes. Database migrations create conversations/messages/owner roles, access-checked functions, indexes, triggers, grants, RLS and realtime publication membership; a second migration tightens function grants.

## Download boundary
Frontend archive contains runnable site source plus local media. Backend archive contains ordered SQL migrations and setup/verification instructions. A TanStack SSR runtime stays with the site; the chat backend is managed database/Auth/Realtime, not a fabricated separate web server. Secrets, installed packages, build output and repository metadata are excluded.