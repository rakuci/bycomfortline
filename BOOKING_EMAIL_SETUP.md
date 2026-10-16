# Booking emails: Resend + Cloudflare Workers (no Workers Paid plan required)

This website uses **Resend** to deliver booking enquiries automatically from the
Cloudflare Worker `bycomfortline`. It does **not** use Cloudflare Email Sending.

**From:** `ComfortLine Bookings <bookings@comfortline.by>`
**To:** `info@comfortline.by`
**API endpoint:** `POST https://bycomfortline.com/api/booking`
**Worker source:** `src/worker.mjs`
**Required Cloudflare Worker secret:** `RESEND_API_KEY`

The Resend sender uses the already-owned `comfortline.by` domain so
`bycomfortline.com` needs **no new Resend DNS records** provided that
`comfortline.by` is verified for *Sending* within the selected Resend team.

## Step 1 — Check the existing verified Resend domain

1. Sign in to [Resend](https://resend.com/domains).
2. Select the same team/account already used for comfortline.by.
3. Open **Domains** and check that **comfortline.by** is verified for
   **Sending**. If it is already verified, do not change any DNS records.
4. If not verified, follow Resend's DNS instructions for comfortline.by
   at its authoritative DNS host, not bycomfortline.com's DNS.

**Important:** The sender is `bookings@comfortline.by`, not
`bookings@bycomfortline.com`. The sender address does not necessarily
require a separate inbox for outgoing mail. The recipient
`info@comfortline.by` must be capable of receiving incoming mail.

## Step 2 — Create an API key dedicated to this site

1. In Resend, select **API Keys** (or https://resend.com/api-keys).
2. Click **Create API Key**.
3. Use name **bycomfortline-worker-bookings**.
4. Set permission to **Sending access** (not Full access).
5. Restrict it to **comfortline.by** if the interface offers domain restriction.
6. Create the key and copy its value beginning with `re_`.

Do not paste the key into ChatGPT, email, GitHub, `wrangler.jsonc`,
frontend JavaScript, or any website source file. Resend may not show
the full token again after leaving this page.

## Step 3 — Put the API key in Cloudflare as a secret

1. Visit https://dash.cloudflare.com → **Workers & Pages**.
2. Open Worker **bycomfortline** → **Settings**.
3. Open **Variables and Secrets** → **Add**.
4. Choose **Type: Secret** (not Text / plaintext).
5. Enter **Variable name:** `RESEND_API_KEY`.
6. Paste the Resend API key into **Value**.
7. Click **Deploy** / **Save and Deploy** to apply.

This makes the key accessible to the Worker as
`env.RESEND_API_KEY`, without storing the key in GitHub.
If using multiple deployment environments, add the secret to the
production environment that serves bycomfortline.com.

## Step 4 — Confirm the GitHub deployment

1. Cloudflare → **Workers & Pages** → **bycomfortline** → **Deployments**.
2. Confirm the latest GitHub production build from `main` has succeeded.
3. The `wrangler.jsonc` configuration should now contain:
   - `main: ./src/worker.mjs`
   - `assets.directory: ./dist` with `ASSETS` binding
   - `assets.run_worker_first: ["/api/*"]`
   - **No** Cloudflare `send_email` binding.
4. If the dashboard-created secret changed the deployed version, make
   sure the latest version includes both the Worker source and the secret.

## Step 5 — Perform a real end-to-end test

1. Open **https://bycomfortline.com/en/** (or any localized route page).
2. Select origin, destination, a future date, passengers, and vehicle.
3. Open the booking popup and fill in the contact details.
4. Click **Send booking enquiry** once.
5. The Worker makes a server-to-server HTTPS request to
   `https://api.resend.com/emails` using the secret.
6. On a successful Resend API response, the browser redirects to
   `/<language>/thank-you/?ref=CL-...`.
7. In **Resend → Emails**, check for a message with subject
   `ComfortLine booking enquiry CL-...` addressed to
   `info@comfortline.by` and inspect its delivery status.
8. Open the actual **info@comfortline.by** inbox and check that the
   email arrived. Delivery and receipt should both be tested.

If the form shows a red error:
- **Worker secret missing:** Confirm `RESEND_API_KEY` exists as a
  *Secret*, and that the production Worker has been deployed with it.
- **401 / 403 at Resend:** Check API key validity and domain restriction.
- **Unverified sender:** Check `comfortline.by` is verified for sending
  in the same Resend team where the API key was created.
- **429:** Resend rate limit or account limit reached.
- **Form error with a deployment failure:** Inspect Worker deployment
  logs and check `wrangler.jsonc` no longer has a paid `send_email` binding.

Important distinctions:
- **Resend accepted** means the email API accepted the send request.
  It does not independently guarantee delivery to the inbox.
- The thank-you URL includes a unique reference but is not proof
  of an operator-confirmed transfer booking.
- Do not repeatedly click Submit when receiving a timeout:
  check Resend activity first, since the send may have been accepted.
- Public forms can be abused. Cloudflare Turnstile and rate limits
  are recommended when traffic increases.

## Helpful documentation

- Resend email sending: https://resend.com/docs/api-reference/emails/send-email
- Resend API keys: https://resend.com/api-keys
- Resend domains: https://resend.com/domains
- Cloudflare Worker secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare static asset bindings: https://developers.cloudflare.com/workers/static-assets/binding/
