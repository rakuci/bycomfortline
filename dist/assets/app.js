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
      if (!details) return;
      for (const name of ["fromPreset", "to", "date", "passengers", "carClass"]) {
        const source = getControl(quick, name);
        const target = getControl(details, name);
        if (source && target) target.value = source.value;
      }
      const section = document.getElementById("contact");
      if (section) {
        section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        if (window.history?.replaceState) window.history.replaceState(null, "", "#contact");
      }
      getControl(details, "pickupAddress")?.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll(".booking-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lang = form.dataset.lang || "en";
      const fields = [...form.querySelectorAll("input[name], select[name], textarea[name]")].map((control) => {
        const label = control.id ? form.querySelector('label[for="' + control.id + '"]') : null;
        const labelText = label?.textContent?.trim() ||
          control.closest("label")?.querySelector("span")?.textContent?.trim() || control.name;
        const fieldValue = control.tagName === "SELECT"
          ? control.selectedOptions[0]?.textContent?.trim()
          : control.value.trim();
        return `${labelText}: ${fieldValue || "—"}`;
      });
      const body = fields.join("\n");
      const subject = subjects[lang] || subjects.en;
      if (event.submitter?.dataset.send === "whatsapp") {
        window.open("https://wa.me/375291552776?text=" + encodeURIComponent(subject + "\n\n" + body), "_blank", "noopener,noreferrer");
        return;
      }
      window.location.href = "mailto:" + form.dataset.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  });

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
