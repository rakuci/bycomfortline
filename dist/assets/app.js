(() => {

  const subjects = {
    en: "ComfortLine private transfer enquiry",
    ru: "Запрос трансфера ComfortLine",
    pl: "Zapytanie o transfer ComfortLine",
    lt: "ComfortLine pervežimo užklausa",
    lv: "ComfortLine transfēra pieprasījums"
  };

  (function setMinimumDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDate = now.toISOString().slice(0, 16);
    document.querySelectorAll('input[type="datetime-local"]').forEach((input) => {
      input.min = minDate;
    });
  })();

  function getControl(form, field) {
    return form.elements.namedItem(field);
  }


  const bookingDialog = document.getElementById("booking-dialog");
  const destinationDialog = document.getElementById("destination-dialog");
  const destinationSearch = destinationDialog?.querySelector(".destination-search");
  let activeLocationInput = null;

  const normalizeLocation = (value) => String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();

  function filterDestinationOptions(text = "") {
    if (!destinationDialog) return;
    const term = normalizeLocation(text);
    let count = 0;
    destinationDialog.querySelectorAll(".destination-group").forEach((group) => {
      let groupCount = 0;
      group.querySelectorAll(".destination-option").forEach((option) => {
        const match = !term || normalizeLocation(option.dataset.search || option.textContent).includes(term);
        option.hidden = !match;
        if (match) { count += 1; groupCount += 1; }
      });
      group.hidden = groupCount === 0;
    });
    const custom = destinationDialog.querySelector("[data-custom-destination]");
    custom.hidden = !text.trim();
    const empty = destinationDialog.querySelector(".destination-empty");
    empty.hidden = count > 0;
  }

  function openDestinationPicker(input) {
    if (!destinationDialog || !input) return;
    activeLocationInput = input;
    const label = input.closest(".location-form-field")?.querySelector("label")?.textContent?.trim();
    destinationDialog.querySelector("#destination-dialog-title").textContent = label || "Location";
    destinationSearch.value = "";
    filterDestinationOptions("");
    destinationDialog.showModal();
    destinationSearch.focus();
  }

  document.querySelectorAll("[data-location-picker]").forEach((picker) => {
    const input = picker.querySelector("input");
    const button = picker.querySelector(".location-open");
    input.addEventListener("click", () => openDestinationPicker(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        openDestinationPicker(input);
      }
    });
    button.addEventListener("click", () => openDestinationPicker(input));
  });

  function acceptDestination(value) {
    if (!activeLocationInput || !value.trim()) return;
    activeLocationInput.value = value.trim();
    activeLocationInput.dispatchEvent(new Event("change", { bubbles: true }));
    const input = activeLocationInput;
    destinationDialog.close();
    input.focus({ preventScroll: true });
  }

  if (destinationDialog) {
    destinationDialog.querySelector("[data-close-destination]").addEventListener("click", () => destinationDialog.close());
    destinationSearch.addEventListener("input", () => filterDestinationOptions(destinationSearch.value));
    destinationDialog.querySelector("[data-custom-destination]").addEventListener("click", () => acceptDestination(destinationSearch.value));
    destinationDialog.addEventListener("click", (event) => {
      const option = event.target.closest(".destination-option");
      if (option) { acceptDestination(option.dataset.value || ""); return; }
      if (event.target === destinationDialog) destinationDialog.close();
    });
    destinationSearch.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        const first = destinationDialog.querySelector(".destination-option:not([hidden])");
        if (first) { event.preventDefault(); first.focus(); }
      } else if (event.key === "Enter" && destinationSearch.value.trim()) {
        event.preventDefault();
        const matches = destinationDialog.querySelectorAll(".destination-option:not([hidden])");
        if (matches.length === 1) acceptDestination(matches[0].dataset.value || "");
        else acceptDestination(destinationSearch.value);
      }
    });
  }

  document.querySelectorAll("[data-open-booking]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      bookingDialog?.showModal();
    });
  });
  bookingDialog?.querySelector("[data-close-booking]")?.addEventListener("click", () => bookingDialog.close());
  bookingDialog?.addEventListener("click", (event) => {
    if (event.target === bookingDialog) bookingDialog.close();
  });
  document.querySelectorAll(".quick-booking").forEach((quick) => {
    quick.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!quick.reportValidity()) return;
      const details = document.querySelector(".booking-form");
      if (!details || !bookingDialog) return;
      for (const name of ["fromPreset", "to", "date", "passengers", "carClass"]) {
        const source = getControl(quick, name);
        const target = getControl(details, name);
        if (source && target) target.value = source.value;
      }
      bookingDialog.showModal();
      getControl(details, "pickupAddress")?.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll(".booking-form").forEach((form) => {
    let sending = false;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;

      const lang = form.dataset.lang || "en";
      const sendButton = form.querySelector(".booking-prepare");
      const message = form.querySelector(".booking-status");
      const originalButtonMarkup = sendButton?.innerHTML || "";
      const payload = Object.fromEntries(new FormData(form).entries());
      const lines = [...form.querySelectorAll("input[name], select[name], textarea[name]")]
        .filter((control) => control.name !== "website")
        .map((control) => {
          const label = control.id ? form.querySelector('label[for="' + control.id + '"]') : null;
          const labelText = label?.textContent?.trim() ||
            control.closest("label")?.querySelector("span")?.textContent?.trim() ||
            control.name;
          const fieldValue = control.tagName === "SELECT"
            ? control.selectedOptions[0]?.textContent?.trim()
            : control.value.trim();
          return labelText + ": " + (fieldValue || "—");
        });

      sending = true;
      if (message) { message.hidden = false; message.classList.remove("booking-error"); message.textContent = form.dataset.sending || "Sending…"; }
      if (sendButton) { sendButton.disabled = true; sendButton.textContent = form.dataset.sending || "Sending…"; }

      let accepted = false;
      try {
        const response = await fetch("/api/booking", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, fields: payload })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || !/^CL-[0-9]{8}-[A-F0-9]{10}$/.test(result.reference)) {
          throw new Error(result?.code || "email_dispatch_failed");
        }

        accepted = true; // Server confirms the mail service accepted the email for delivery.
        const reference = result.reference;
        const subject = subjects[lang] || subjects.en;
        const enquiry = { reference, subject, summary: lines.join("\n"), createdAt: new Date().toISOString(), emailAccepted: true };
        try {
          sessionStorage.setItem("comfortline-enquiry:" + reference, JSON.stringify(enquiry));
          if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: "booking_enquiry_email_accepted", enquiry_reference: reference, enquiry_language: lang });
          }
          window.location.assign("/" + lang + "/thank-you/?ref=" + encodeURIComponent(reference));
        } catch (_) {
          // The email was already accepted. Never ask for a retry when storage is blocked.
          if (message) {
            message.hidden = false;
            message.textContent = (form.dataset.storageSuccess || "Enquiry emailed. Reference: ") + reference;
          }
        }
      } catch (_) {
        // No success response: keep every field visible and allow another attempt.
        if (message) {
          message.hidden = false;
          message.classList.add("booking-error");
          message.textContent = form.dataset.sendError || "Email sending failed. Please try again.";
        }
      } finally {
        sending = false;
        if (!accepted && sendButton) { sendButton.disabled = false; sendButton.innerHTML = originalButtonMarkup; }
      }
    });
  });

  const thankyou = document.querySelector("[data-booking-thankyou]");
  if (thankyou) {
    const ref = new URLSearchParams(window.location.search).get("ref") || "";
    let draft = null;
    try { if (ref) draft = JSON.parse(sessionStorage.getItem("comfortline-enquiry:" + ref) || "null"); }
    catch (error) { draft = null; }
    const refNode = thankyou.querySelector("[data-inquiry-reference]");
    const details = thankyou.querySelector("[data-inquiry-summary]");
    const actions = thankyou.querySelector(".thanks-actions");
    const missing = thankyou.querySelector(".thanks-missing");
    const confirmation = thankyou.querySelector("[data-inquiry-confirmation]");
    if (refNode) refNode.textContent = ref || "—";
    if (draft?.reference === ref && draft.emailAccepted === true) {
      if (confirmation) confirmation.hidden = false;
      if (missing) missing.hidden = true;
      const text = draft.subject + "\nReference: " + ref + "\n\n" + draft.summary;
      if (details) details.textContent = draft.summary;
      const wa = thankyou.querySelector("[data-inquiry-whatsapp]");
      const em = thankyou.querySelector("[data-inquiry-email]");
      if (wa) wa.href = "https://wa.me/375291552776?text=" + encodeURIComponent(text);
      if (em) em.href = "mailto:info@comfortline.by?subject=" + encodeURIComponent(draft.subject + " " + ref) + "&body=" + encodeURIComponent(text);
      [wa, em].forEach(link => link?.addEventListener("click", () => {
        if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: "booking_enquiry_send_intent", enquiry_reference: ref, channel: link === wa ? "whatsapp" : "email" });
      }));
    } else {
      if (details?.parentElement) details.parentElement.hidden = true;
      if (actions) actions.hidden = true;
      if (missing) missing.hidden = false;
    }
    const copy = thankyou.querySelector("[data-copy-reference]");
    copy?.addEventListener("click", async () => {
      if (!ref) return;
      try { await navigator.clipboard.writeText(ref); }
      catch (error) { window.prompt("Copy reference:", ref); }
    });
  }
  const navigationMenus = [...document.querySelectorAll(".language-menu, .mobile-nav")];
  navigationMenus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      navigationMenus.forEach((other) => {
        if (other !== menu) other.open = false;
      });
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => { menu.open = false; });
    });
  });

  document.addEventListener("click", (event) => {
    navigationMenus.forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    navigationMenus.forEach((menu) => {
      if (menu.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    });
  });
})();
