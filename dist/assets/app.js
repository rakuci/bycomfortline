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

  document.querySelectorAll(".language-menu").forEach((menu) => {
    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) menu.removeAttribute("open");
    });
  });
})();
