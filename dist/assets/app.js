(() => {
  const subjects = {
    ru: "Запрос трансфера ComfortLine",
    pl: "Zapytanie o transfer ComfortLine",
    lt: "ComfortLine pervežimo užklausa",
    lv: "ComfortLine transfēra pieprasījums",
  };

  (function setMinimumDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.querySelectorAll('input[type="datetime-local"]').forEach((input) => {
      input.min = now.toISOString().slice(0, 16);
    });
  })();

  document.querySelectorAll(".booking-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const lang = form.dataset.lang || "ru";
      const labels = [...form.querySelectorAll("label")].map((label) =>
        label.querySelector("span")?.textContent?.trim() || ""
      );
      const values = [
        data.get("from"),
        data.get("to"),
        data.get("date"),
        data.get("passengers"),
        data.get("phone"),
      ];
      const body = labels
        .map((label, index) => label + ": " + (values[index] || "—"))
        .join("\\n");
      window.location.href =
        "mailto:" + form.dataset.email +
        "?subject=" + encodeURIComponent(subjects[lang]) +
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
