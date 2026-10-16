// Cloudflare Worker: static assets plus secure Resend-powered booking enquiries.
// Uses the verified Resend sending domain comfortline.by, not Cloudflare Email Sending.
// Set the RESEND_API_KEY as a Cloudflare Worker Secret; never commit it to GitHub.
const RECIPIENT = "info@comfortline.by";
const SENDER = "byComfortLine <bookings@comfortline.by>";
const RESEND_SEND_URL = "https://api.resend.com/emails";
const ALLOWED_LANGUAGES = new Set(["en", "ru", "pl", "lt", "lv"]);

const FIELD_RULES = {
  fromPreset: { required: true, max: 160 },
  to: { required: true, max: 160 },
  pickupAddress: { max: 220 },
  dropAddress: { max: 220 },
  date: { required: true, max: 22 },
  passengers: { required: true, max: 2 },
  adults: { max: 2 },
  children: { max: 2 },
  infants: { max: 2 },
  pets: { max: 2 },
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
  fromPreset: "Откуда",
  to: "Куда",
  pickupAddress: "Адрес подачи",
  dropAddress: "Адрес прибытия",
  date: "Дата и время поездки",
  passengers: "Пассажиры",
  adults: "Взрослые",
  children: "Дети",
  infants: "Младенцы",
  pets: "Питомцы",
  carClass: "Класс автомобиля",
  luggage: "Чемоданы",
  childSeats: "Детские кресла",
  flight: "Номер рейса",
  customerName: "Имя клиента",
  phone: "Телефон",
  customerEmail: "Email клиента",
  notes: "Пожелания к поездке"
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
  const hasPassengerBreakdown = ["adults", "children", "infants"].some(name =>
    Object.prototype.hasOwnProperty.call(incoming, name));
  if (!hasPassengerBreakdown) {
    // Continue accepting in-flight requests from users who opened the previous form.
    fields.adults = fields.passengers;
    fields.children = "0";
    fields.infants = "0";
  }
  if (!Object.prototype.hasOwnProperty.call(incoming, "pets")) fields.pets = "0";
  for (const name of ["adults", "children", "infants", "pets"]) {
    if (!/^(?:0|[1-9][0-9]?)$/.test(fields[name]) || Number(fields[name]) > 8) return null;
  }
  if (Number(fields.adults) < 1 ||
      Number(fields.adults) + Number(fields.children) + Number(fields.infants) !== Number(fields.passengers)) return null;
  if (!["any", "comfort", "business", "premium", "sedan", "minivan"].includes(fields.carClass)) return null;
  if (!/^\d{0,2}$/.test(fields.luggage) || Number(fields.luggage || 0) > 25) return null;
  if (!/^\d{0,2}$/.test(fields.childSeats) || Number(fields.childSeats || 0) > 8) return null;
  if (fields.customerName.length < 2) return null;
  const phoneDigits = fields.phone.replace(/\D/g, "");
  if (phoneDigits.length < 6 || phoneDigits.length > 16 || !/^[+\d()\s.-]+$/.test(fields.phone)) {
    return { invalid: "phone" };
  }
  if (fields.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.customerEmail)) return null;

  return { lang, fields };
}

function bookingText({ lang, fields }, reference) {
  const carLabels = { any: "Любой", comfort: "Комфорт", business: "Бизнес", premium: "Премиум", sedan: "Седан", minivan: "Минивэн / микроавтобус" };
  const lines = [
    "byComfortLine — новая заявка на трансфер",
    "Отправитель: byComfortLine",
    "Номер заявки: " + reference,
    "Сайт: bycomfortline.com",
    "Язык сайта при оформлении: " + lang.toUpperCase(),
    "Получена (UTC): " + new Date().toISOString(),
    "",
    ...Object.entries(FIELD_LABELS).map(([field, label]) => label + ": " +
      (field === "carClass" ? (carLabels[fields.carClass] || fields.carClass) : (fields[field] || "—"))),
    "",
    "СТАТУС: Заявка получена по электронной почте. Поездка и стоимость ещё не подтверждены.",
    "Свяжитесь с клиентом по контактным данным выше для подтверждения наличия автомобиля и стоимости."
  ];
  return lines.join("\n");
}

// Email clients (including Gmail) render inline-styled tables more reliably
// than page CSS. Keep the text version as a fallback for accessibility.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function bookingHtml({ lang, fields }, reference) {
  const h = escapeHtml;
  const safe = (value) => h(value).replace(/\r\n?|\n/g, "<br>");
  const date = fields.date.replace("T", " · ");
  const received = new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  const fieldRow = (label, value, important = false) => value === "" || value == null
    ? ""
    : '<tr><td valign="top" style="width:42%;padding:13px 16px;border-bottom:1px solid #e9eff0;color:#637784;font:13px/1.55 Arial,Helvetica,sans-serif;">' +
      h(label) +
      '</td><td valign="top" style="padding:13px 16px;border-bottom:1px solid #e9eff0;color:#132d3b;font:' +
      (important ? "bold " : "") +
      '14px/1.55 Arial,Helvetica,sans-serif;overflow-wrap:anywhere;">' +
      safe(value) + '</td></tr>';
  const section = (heading, rows) =>
    '<tr><td style="padding:24px 26px 0;"><div style="font:bold 16px/1.4 Arial,Helvetica,sans-serif;color:#162c3b;margin-bottom:12px;">' +
      h(heading) + '</div><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e1e9e9;border-radius:12px;border-collapse:separate;border-spacing:0;background-color:#ffffff;">' +
      rows + '</table></td></tr>';

  const trip = [
    fieldRow("Дата и время поездки", date, true),
    fieldRow("Пассажиры", fields.passengers, true),
    fieldRow("Взрослые", fields.adults),
    fieldRow("Дети", fields.children),
    fieldRow("Младенцы", fields.infants),
    fieldRow("Питомцы", fields.pets),
    fieldRow("Класс автомобиля", ({ any: "Любой", comfort: "Комфорт", business: "Бизнес", premium: "Премиум", sedan: "Седан", minivan: "Минивэн / микроавтобус" })[fields.carClass] || fields.carClass),
    fieldRow("Чемоданы", fields.luggage),
    fieldRow("Детские кресла", fields.childSeats),
    fieldRow("Адрес подачи", fields.pickupAddress),
    fieldRow("Адрес прибытия", fields.dropAddress),
    fieldRow("Номер рейса", fields.flight)
  ].join("");
  const contact = [
    fieldRow("Имя клиента", fields.customerName, true),
    fieldRow("Телефон", fields.phone, true),
    fieldRow("Email клиента", fields.customerEmail)
  ].join("");
  const notes = fields.notes
    ? section("Дополнительные пожелания", fieldRow("Комментарий", fields.notes))
    : "";
  const preheader = h(fields.fromPreset + " → " + fields.to + " · " + reference);
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>byComfortLine — заявка на трансфер</title></head>' +
    '<body style="margin:0;padding:0;background-color:#f1f5f4;color:#132d3b;">' +
    '<div style="display:none;font-size:1px;color:#f1f5f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">' +
      preheader + '</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;background-color:#f1f5f4;"><tr><td align="center" style="padding:32px 14px;">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;width:100%;border-collapse:separate;border-spacing:0;background-color:#ffffff;border-radius:18px;overflow:hidden;">' +
        '<tr><td style="background-color:#102a3a;padding:26px 28px;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>' +
            '<td style="font:bold 22px/1.25 Arial,Helvetica,sans-serif;color:#ffffff;letter-spacing:0.5px;">COMFORT<span style="color:#dbb475;">LINE</span></td>' +
            '<td align="right" style="font:11px/1.5 Arial,Helvetica,sans-serif;color:#d8e4e6;letter-spacing:1px;">ЗАЯВКА НА ТРАНСФЕР</td>' +
          '</tr></table>' +
        '</td></tr>' +
        '<tr><td style="padding:27px 26px 9px;">' +
          '<div style="font:bold 26px/1.25 Arial,Helvetica,sans-serif;color:#132d3b;">Новая заявка на трансфер</div>' +
          '<div style="padding-top:8px;color:#647983;font:13px/1.6 Arial,Helvetica,sans-serif;">' +
            'Отправитель: byComfortLine · Сайт: bycomfortline.com · Язык заявки: ' + h(lang.toUpperCase()) +
          '</div>' +
        '</td></tr>' +
        '<tr><td style="padding:14px 26px 0;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-radius:14px;background-color:#eaf7f2;border-collapse:separate;border-spacing:0;">' +
            '<tr><td valign="top" width="46%" style="padding:20px 16px;">' +
              '<div style="font:bold 10px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1.2px;color:#54766c;">ОТКУДА</div>' +
              '<div style="font:bold 21px/1.35 Arial,Helvetica,sans-serif;color:#122e3b;overflow-wrap:anywhere;">' + h(fields.fromPreset) + '</div>' +
            '</td><td align="center" valign="middle" width="8%" style="font:bold 24px/1 Arial,Helvetica,sans-serif;color:#bc9362;">&#8594;</td>' +
            '<td valign="top" width="46%" style="padding:20px 16px;">' +
              '<div style="font:bold 10px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1.2px;color:#54766c;">КУДА</div>' +
              '<div style="font:bold 21px/1.35 Arial,Helvetica,sans-serif;color:#122e3b;overflow-wrap:anywhere;">' + h(fields.to) + '</div>' +
            '</td></tr></table>' +
        '</td></tr>' +
        '<tr><td style="padding:17px 26px 0;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fff8e9;border:1px solid #f3dfb8;border-collapse:separate;border-spacing:0;border-radius:11px;"><tr>' +
            '<td style="padding:13px 16px;font:12px/1.55 Arial,Helvetica,sans-serif;color:#715b37;">' +
              '<span style="font-weight:bold;color:#5a4321;">Номер заявки:</span> ' + h(reference) +
              '<br><span style="font-weight:bold;color:#5a4321;">Получена (UTC):</span> ' + h(received) +
            '</td></tr></table>' +
        '</td></tr>' +
        section("Детали поездки", trip) +
        section("Контакты клиента", contact) +
        notes +
        '<tr><td style="padding:23px 26px 28px;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-left:4px solid #d2ad72;background-color:#fbf6ed;"><tr><td style="padding:14px 17px;font:13px/1.65 Arial,Helvetica,sans-serif;color:#5f5d51;">' +
            '<strong style="color:#443f30;">Ожидает подтверждения</strong><br>' +
            'Это новая заявка, а не подтверждённое бронирование. Свяжитесь с клиентом для уточнения возможности поездки и стоимости.' +
          '</td></tr></table>' +
        '</td></tr>' +
        '<tr><td style="padding:19px 26px;background-color:#102a3a;color:#b7c9cc;font:12px/1.6 Arial,Helvetica,sans-serif;">' +
          'Отправитель: byComfortLine · <a href="https://bycomfortline.com" style="color:#e5c389;text-decoration:none;">bycomfortline.com</a> · Индивидуальные трансферы' +
        '</td></tr>' +
      '</table>' +
    '</td></tr></table></body></html>';
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
  if (booking?.invalid === "phone") {
    return json({ success: false, code: "invalid_phone", field: "phone" }, 422);
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
    subject: "byComfortLine — новая заявка на трансфер № " + reference,
    text: bookingText(booking, reference),
    html: bookingHtml(booking, reference),
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
