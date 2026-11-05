# Pauzos — GitHub Pages website and Supabase payment backend
Prepared 6 November 2026. Production domain remains pauzos.com on GitHub Pages. Hostinger DNS changes are unnecessary. The GitHub Actions workflow publishes **public/** only; backend code and project notes are not part of the Pages artifact.

## Layout
- public/: complete static site, local responsive light/dark screenshots, checkout, pricing, robots and sitemap.
- public/api-config.js: public Supabase function URL, no secrets.
- supabase/functions/pauzos-api/: server price catalogue, Razorpay order and signature verification, license/account activation and signed webhook handler.
- supabase/config.toml: public function gateway configuration. Checkout uses explicit allowed origins; payment proof is verified server-side. CORS is not payment authentication.
- tests/: frontend recovery, price rollover, payment validation and function routing/CORS tests. Run `node --test tests/*.test.mjs` with a current Node version.
- supabase/migrations/: cutover permission hardening. Do not run before the backend is ready, since it disables the old insecure client activation RPC.

## Deployment order
1. Authenticate Supabase CLI with a project-scoped management token. Database keys cannot deploy functions. Never commit tokens or paste them into chat.
2. Set function secrets RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_TEST_KEY_ID and RAZORPAY_TEST_KEY_SECRET using existing local CSVs. Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ALLOWED_ORIGINS may be set to the comma-separated production origins; defaults are pauzos.com, www.pauzos.com and anandnowhere.github.io over HTTPS.
3. From this checkout deploy `supabase functions deploy pauzos-api --project-ref suidnqsvuxaoqoyuqpys --use-api`. Verify JWT is false per config because anonymous visitors may buy; the service-role secret stays inside the function.
4. Verify GET `/functions/v1/pauzos-api/api/pricing?currency=AED`, CORS preflight from https://pauzos.com, test order creation and user-completed test payment. Never use a real card for automated tests.
5. Configure a Razorpay live webhook to `/functions/v1/pauzos-api/api/webhook` for payment.captured and order.paid, and store the matching RAZORPAY_WEBHOOK_SECRET in Supabase. Until this is configured, closed-checkout automatic activation is not proven. The handler verifies the raw payload signature, then independently checks gateway records before granting a license.
6. Apply the permission migration at cutover. It removes public payment-record access and execution of the legacy unverified activation RPC. Preserve application sign-in/license-read permissions separately.
7. Merge the prepared branch into main only after backend verification. Existing Pages workflow uploads public/. Keep CNAME pauzos.com. Confirm GitHub Actions success, live assets, quotes, test checkout and live checkout configuration without charging money.
8. Complete a deliberate owner-run live purchase and email/app login acceptance test before declaring full end-to-end payment verification.

## Localization
The static site uses the server price catalogue and server date. With GitHub Pages there is no trusted IP-country signal passed to Supabase; detection uses browser timezone/region and defaults to USD when unknown. It does not call a third-party location service or ask for precise location. Currency selectors remain hidden as requested. This is a best-effort preference, not proof of residence. Prices remain fixed per currency; January 2027 price increase is enforced server-side.

## Rollback and retained limitations
Previous GitHub main: 0657c8588eb156990b604d9ac673ed62fcda046f. Preserve the old files in repository history. Do not restore the insecure public activation RPC as an ordinary rollback; disable purchases temporarily if backend repair is necessary. Existing local Websites Data edits were preserved untouched.

The website's captures use genuine application UI with identical illustrative reminders in both themes. Existing downloadable application binaries are unchanged. Two-device enforcement inside the app and live activation email delivery remain acceptance gaps. Automated accessibility checks do not certify complete accessibility. Full local audit evidence is retained in the workspace deliverables/audits folder.

## Current state
Prepared and tested locally; Supabase deployment and GitHub main publication are pending management access. Supabase function endpoint returned 404 on 6 November 2026. Do not mistake a prepared source branch for a production deployment.
