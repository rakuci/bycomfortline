// Cloudflare Worker: static assets plus secure Resend-powered booking enquiries.
// Uses the verified Resend sending domain comfortline.by, not Cloudflare Email Sending.
// Set the RESEND_API_KEY as a Cloudflare Worker Secret; never commit it to GitHub.
const RECIPIENT = "info@comfortline.by";
const SENDER = "ComfortLine Bookings <bookings@comfortline.by>";
const RESEND_SEND_URL = "https://api.resend.com/emails";
const ALLOWED_LANGUAGES = new Set(["en", "ru", "pl", "lt", "lv"]);

const FIELD_RULES = {
  fromPreset: { required: true, max: 160 },
  to: { required: true, max: 160 },
  pickupAddress: { max: 220 },
  dropAddress: { max: 220 },
  date: { required: true, max: 22 },
  passengers: { required: true, max: 2 },
  carClass: { required: true, max: 30 },
  luggage: { max: 2 },
  childSeats: { max: 2 },
  flight: { max: 60 },
  customerName: { required: true, max: 120 },
  phone: { required: true, max: 50 },
  customerEmail: { max: 190 },
  notes: { max: 1200 },
  website: { max: 120 } // Honeypot, never a real field.
};

const FIELD_LABELS = {
  fromPreset: "Departure",
  to: "Destination",
  pickupAddress: "Pickup address",
  dropAddress: "Drop-off address",
  date: "Departure date and time",
  passengers: "Passengers",
  carClass: "Vehicle class",
  luggage: "Suitcases",
  childSeats: "Child seats",
  flight: "Flight number",
  customerName: "Customer name",
  phone: "Phone",
  customerEmail: "Customer email",
  notes: "Additional notes"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function validateBooking(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const lang = body.lang;
  const incoming = body.fields;
  if (!ALLOWED_LANGUAGES.has(lang) || !incoming || typeof incoming !== "object" || Array.isArray(incoming)) return null;

  const fields = {};
  for (const [name, rules] of Object.entries(FIELD_RULES)) {
    const value = incoming[name] ?? "";
    if (typeof value !== "string" || value.length > rules.max) return null;
    fields[name] = value.trim();
    if (rules.required && !fields[name]) return null;
  }
  // Stop automated bots that indiscriminately fill all form inputs.
  if (fields.website) return { bot: true };
  if (fields.fromPreset === fields.to) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fields.date) || Number.isNaN(Date.parse(fields.date))) return null;
  if (!/^[1-8]$/.test(fields.passengers)) return null;
  if (!["sedan", "minivan", "premium"].includes(fields.carClass)) return null;
  if (!/^\d{0,2}$/.test(fields.luggage) || Number(fields.luggage || 0) > 25) return null;
  if (!/^\d{0,2}$/.test(fields.childSeats) || Number(fields.childSeats || 0) > 8) return null;
  if (fields.customerName.length < 2 || fields.phone.replace(/\D/g, "").length < 6) return null;
  if (fields.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.customerEmail)) return null;

  return { lang, fields };
}

function bookingText({ lang, fields }, reference) {
  const lines = [
    "New ComfortLine booking enquiry",
    "Reference: " + reference,
    "Website: bycomfortline.com",
    "Language: " + lang,
    "Received (UTC): " + new Date().toISOString(),
    "",
    ...Object.entries(FIELD_LABELS).map(([field, label]) => label + ": " + (fields[field] || "—")),
    "",
    "STATUS: Enquiry received by email. Transfer booking and price are not yet confirmed.",
    "Reply to the customer using their contact details above."
  ];
  return lines.join("\n");
}

async function submitBooking(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (!origin || origin !== url.origin || request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return json({ success: false, code: "forbidden" }, 403);
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ success: false, code: "invalid_content_type" }, 415);
  }
  if (Number(request.headers.get("Content-Length") || 0) > 12000) {
    return json({ success: false, code: "too_large" }, 413);
  }

  let parsed;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ success: false, code: "too_large" }, 413);
    parsed = JSON.parse(raw);
  } catch (_) {
    return json({ success: false, code: "invalid_payload" }, 400);
  }

  const booking = validateBooking(parsed);
  if (booking?.bot) {
    // Bots filling the honeypot get no email. Never claim the email was submitted.
    return json({ success: false, code: "invalid_payload" }, 400);
  }
  if (!booking) return json({ success: false, code: "invalid_payload" }, 400);
  if (!env.RESEND_API_KEY || typeof env.RESEND_API_KEY !== "string") {
    console.error("Missing RESEND_API_KEY Worker secret.");
    return json({ success: false, code: "email_unavailable" }, 503);
  }

  const reference = "CL-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" + crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  const payload = {
    from: SENDER,
    to: [RECIPIENT],
    subject: "ComfortLine booking enquiry " + reference,
    text: bookingText(booking, reference),
    ...(booking.fields.customerEmail ? { reply_to: booking.fields.customerEmail } : {})
  };

  try {
    const response = await fetch(RESEND_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Idempotency-Key": reference
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Avoid logging message content, email addresses, or the API key.
      console.error("Resend rejected booking email:", response.status);
      return json({
        success: false,
        code: response.status === 429 ? "rate_limited" : "email_unavailable"
      }, response.status === 429 ? 429 : 503);
    }

    const result = await response.json().catch(() => null);
    if (typeof result?.id !== "string" || !result.id.trim()) {
      console.error("Resend email accepted but returned no ID.");
      return json({ success: false, code: "email_unavailable" }, 503);
    }

    console.log("Resend accepted booking email", reference, result.id);
    return json({ success: true, reference }, 200);
  } catch (error) {
    console.error("Resend booking email request failed:", error?.name || "unknown");
    return json({ success: false, code: "email_unavailable" }, 503);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/booking") {
      if (request.method !== "POST") {
        return new Response(null, { status: 405, headers: { "Allow": "POST", "Cache-Control": "no-store" } });
      }
      return submitBooking(request, env);
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ success: false, code: "not_found" }, 404);
    }
    return env.ASSETS.fetch(request);
  }
};
