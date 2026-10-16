# Booking enquiry email: Cloudflare setup and test

The **Send booking enquiry** button in the popup submits `POST /api/booking`
to `src/worker.mjs`. A successful response from Cloudflare Email Service
means **accepted for delivery**, not that the transfer is confirmed.

The Worker sends from `bookings@bycomfortline.com` to **info@comfortline.by**,
with the route, travel date, passengers, vehicle, contact details and enquiry
reference. The recipient is fixed in the code *and* in the sending binding.

## Required one-time Cloudflare setup

1. Sign in to the Cloudflare account managing **bycomfortline.com**.
2. Go to **Compute > Email Service > Email Routing > Destination Addresses**.
   Add **info@comfortline.by** and follow the verification link sent to
   that inbox. If it is already in the list, confirm the status is Verified.
3. Go to **Compute > Email Service > Email Sending** and choose
   **Onboard Domain** for **bycomfortline.com**. Let Cloudflare add the
   DNS authentication records to authorize sending from this domain;
   wait for verification. The Worker uses
   `bookings@bycomfortline.com` as its sender. A separate mailbox at that
   address is not required to send outbound email.
4. Go to **Workers & Pages > bycomfortline > Deployments** to confirm
   the most recent GitHub deployment succeeded. The repository's
   `wrangler.jsonc` contains the `EMAIL` send binding, `ASSETS`
   binding and Worker entry point.
5. Do not put API keys, mailbox passwords or personal secrets in the
   public GitHub repository.

Official documentation:
- https://developers.cloudflare.com/email-service/get-started/send-emails/
- https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/workers/static-assets/binding/

## Test after Cloudflare is configured

1. Open **https://bycomfortline.com/en/** or another language.
2. Select a real route and departure date, then complete passenger and contact details.
3. Click **Send booking enquiry**.
4. The UI should briefly show a sending state, then redirect to
   `/<language>/thank-you/?ref=CL-...` *only if Cloudflare accepts the email*.
5. Check **info@comfortline.by** for a message with subject
   `ComfortLine booking enquiry CL-...` and matching route data and reference.
6. If it fails, the booking popup stays open and shows a translated error.
   Check that the recipient is verified, sending domain is onboarded,
   the latest Worker is deployed, and review Cloudflare Email Service
   delivery activity and Worker logs.

## Implementation notes

- The message is sent server-side using the `EMAIL.send()` binding,
  never directly from browser JavaScript.
- The API accepts same-origin JSON only, enforces length limits,
  validates required fields, and uses a hidden bot-trap field.
- A unique reference is created by the Worker only after the data validates.
- The browser redirects to the localized thank-you page **only after a
  successful mail-service response**.
- The thank-you page is not indexed and the personal travel details are
  stored only temporarily in the visitor's browser session.
- Actual reservation confirmation must still be provided by a manager.
- For high-volume public intake, consider rate limiting with Cloudflare
  WAF/Turnstile and persistent server-side reservation storage.
