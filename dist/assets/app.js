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


  // Free-text location inputs with an optional, searchable list of regional suggestions.
  // Suggestions are examples only; any typed city, airport or address is accepted.
  const locationPickers = [...document.querySelectorAll("[data-location-picker]")];
  const normalizeLocation = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();

  function closeLocation(picker) {
    const list = picker.querySelector(".location-suggestions");
    if (list) list.hidden = true;
    const toggle = picker.querySelector(".location-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function showLocation(picker, query = "") {
    locationPickers.forEach((item) => {
      if (item !== picker) closeLocation(item);
    });
    const searched = normalizeLocation(query);
    let visibleCount = 0;
    picker.querySelectorAll(".location-group").forEach((group) => {
      let visibleInGroup = 0;
      group.querySelectorAll(".location-choice").forEach((choice) => {
        const isMatch = !searched || normalizeLocation(choice.dataset.search || choice.textContent).includes(searched);
        choice.hidden = !isMatch;
        if (isMatch) {
          visibleInGroup += 1;
          visibleCount += 1;
        }
      });
      group.hidden = visibleInGroup === 0;
    });
    picker.querySelector(".location-empty").hidden = visibleCount !== 0;
    picker.querySelector(".location-suggestions").hidden = false;
    picker.querySelector(".location-open").setAttribute("aria-expanded", "true");
  }

  locationPickers.forEach((picker) => {
    const input = picker.querySelector('input[type="text"]');
    const toggle = picker.querySelector(".location-open");
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const wasOpen = !picker.querySelector(".location-suggestions").hidden;
      if (wasOpen) closeLocation(picker);
      else showLocation(picker); // Show the whole list, even if a place is already selected.
    });
    input.addEventListener("input", () => showLocation(picker, input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        showLocation(picker, input.value);
        picker.querySelector(".location-choice:not([hidden])")?.focus();
      } else if (event.key === "Escape") {
        closeLocation(picker);
      }
    });
    picker.addEventListener("click", (event) => {
      const option = event.target.closest(".location-choice");
      if (!option) return;
      event.preventDefault();
      input.value = option.dataset.value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      closeLocation(picker);
      input.focus({ preventScroll: true });
    });
    picker.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLocation(picker);
        input.focus({ preventScroll: true });
      }
    });
  });
  document.addEventListener("click", (event) => {
    locationPickers.forEach((picker) => {
      if (!picker.contains(event.target)) closeLocation(picker);
    });
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
