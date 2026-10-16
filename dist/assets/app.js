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

  document.querySelectorAll(".quick-booking").forEach((quick) => {
    quick.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!quick.reportValidity()) return;
      const details = document.querySelector(".booking-form");
      if (!details) return;
      for (const name of ["fromPreset", "date", "passengers", "carClass"]) {
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
      const fields = [...form.querySelectorAll("label")].map((label) => {
        const control = label.querySelector("input, select, textarea");
        if (!control || !control.name) return null;
        const labelText = label.querySelector("span")?.textContent?.trim() || control.name;
        const fieldValue = control.tagName === "SELECT"
          ? control.selectedOptions[0]?.textContent?.trim()
          : control.value.trim();
        return `${labelText}: ${fieldValue || "—"}`;
      }).filter(Boolean);
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
