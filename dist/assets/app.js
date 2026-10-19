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


  // iOS Safari's on-screen keyboard changes the visual viewport but not always
  // the CSS layout viewport. Keep dialogs inside the visible portion of screen.
  function syncMobileDialogViewport() {
    const viewport = window.visualViewport;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const root = document.documentElement;
    if (!mobile) {
      root.style.removeProperty("--booking-visual-height");
      root.style.removeProperty("--booking-visual-top");
      return;
    }
    root.style.setProperty("--booking-visual-height",
      Math.max(180, Math.floor(viewport?.height || window.innerHeight)) + "px");
    root.style.setProperty("--booking-visual-top",
      Math.max(0, Math.floor(viewport?.offsetTop || 0)) + "px");
  }
  syncMobileDialogViewport();
  window.addEventListener("resize", syncMobileDialogViewport, { passive: true });
  window.visualViewport?.addEventListener("resize", syncMobileDialogViewport, { passive: true });
  window.visualViewport?.addEventListener("scroll", syncMobileDialogViewport, { passive: true });

  const bookingDialog = document.getElementById("booking-dialog");
  function initializeLocationAutocomplete() {
    const dataNode = document.getElementById("location-autocomplete-data");
    if (!dataNode) return;
    let catalog;
    try { catalog = JSON.parse(dataNode.textContent); }
    catch (error) { console.error("Location suggestions unavailable", error); return; }
    const entries = Array.isArray(catalog.entries) ? catalog.entries : [];
    const words = catalog.text || {};
    const pickers = [...document.querySelectorAll("[data-location-picker]")];
    let activePicker = null;
    const setLocationEditing = () => {
      document.body.classList.toggle("location-is-editing",
        pickers.some(picker => picker.querySelector("input") === document.activeElement));
    };
  
    const normalize = (text) => String(text || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/ё/g,"е").replace(/ł/g,"l").replace(/æ/g,"ae")
      .replace(/[^\p{L}\p{N}]+/gu," ").trim();
  
    const candidates = (mode, value) => {
      const term = normalize(value);
      const pool = entries.filter(item => item.mode === mode);
      if (!term) {
        return pool.filter(item => item.popular).sort((a,b) => {
          const popular = mode === "to"
            ? ["minsk","grodno","brest","msq","lida","vitebsk"]
            : ["warsaw","vilnius","riga","waw","vno","rix"];
          return popular.indexOf(a.id)-popular.indexOf(b.id);
        }).slice(0,4);
      }
      const scored = pool.map(item => {
        const label = normalize(item.label);
        const all = normalize(item.terms || item.label);
        const words = all.split(" ");
        const value = normalize(item.id);
        const score = label.startsWith(term) || value.startsWith(term) ? 0
          : words.some(word => word.startsWith(term)) ? 1
          : all.includes(term) ? 2 : 99;
        return { item, score };
      }).filter(result => result.score < 99);
      scored.sort((a,b) => a.score-b.score || Number(b.item.popular)-Number(a.item.popular)
        || a.item.label.localeCompare(b.item.label));
      return scored.slice(0,5).map(result=>result.item);
    };
  
    function updatePosition(picker) {
      if (!picker || picker !== activePicker) return;
      const input = picker.querySelector("input");
      const panel = picker.querySelector(".location-suggestions");
      if (panel.hidden) return;
      const viewport = window.visualViewport;
      const topLimit = viewport?.offsetTop || 0;
      const bottomLimit = topLimit+(viewport?.height || window.innerHeight);
      const rect = input.getBoundingClientRect();
      const width = Math.min(Math.max(270,rect.width+18),window.innerWidth-24);
      const left = Math.max(12,Math.min(rect.left-9,window.innerWidth-width-12));
      const below = bottomLimit-rect.bottom-15;
      const above = rect.top-topLimit-15;
      const upward = below < 205 && above > below;
      const available = upward ? above : below;
      const height = Math.min(340,Math.max(118,available-5));
      panel.style.width = width+"px";
      panel.style.left = left+"px";
      panel.style.maxHeight = height+"px";
      panel.style.top = (upward ? Math.max(topLimit+8,rect.top-height-9) : rect.bottom+9)+"px";
      panel.classList.toggle("location-suggestions-up",upward);
    }
  
    function closePicker(picker) {
      if (!picker) return;
      const input = picker.querySelector("input");
      const panel = picker.querySelector(".location-suggestions");
      panel.hidden = true;
      panel.replaceChildren();
      input.setAttribute("aria-expanded","false");
      input.removeAttribute("aria-activedescendant");
      picker.classList.remove("is-suggesting");
      picker._activeIndex = -1;
      picker._suggestions = [];
      if (activePicker === picker) activePicker = null;
      setLocationEditing();
    }
  
    function activate(picker,index) {
      const panel = picker.querySelector(".location-suggestions");
      const opts = [...panel.querySelectorAll("[role=option]")];
      if (!opts.length) return;
      const active = (index+opts.length)%opts.length;
      opts.forEach((option,i)=>option.setAttribute("aria-selected",String(i===active)));
      picker._activeIndex = active;
      const target = opts[active];
      picker.querySelector("input").setAttribute("aria-activedescendant",target.id);
      target.scrollIntoView({block:"nearest"});
    }
  
    function choose(picker,value) {
      const input = picker.querySelector("input");
      input.value = value;
      input.dispatchEvent(new Event("change",{bubbles:true}));
      picker.querySelector(".location-clear").hidden = !input.value.trim();
      closePicker(picker);
      const nextInput = picker.closest(".quick-booking, .booking-form")?.querySelector(
        'input[name="to"]'
      );
      if (input.name === "fromPreset" && nextInput && nextInput !== input) {
        nextInput.focus();
      } else {
        input.blur();
      }
    }
  
    function render(picker,query) {
      if (activePicker && activePicker!==picker) closePicker(activePicker);
      activePicker=picker;
      picker.classList.add("is-suggesting");
      const input=picker.querySelector("input");
      const panel=picker.querySelector(".location-suggestions");
      const mode=picker.dataset.locationMode;
      if (!query.trim()) {
        closePicker(picker);
        return;
      }
      const matches=candidates(mode,query);
      picker._suggestions=matches;
      picker._activeIndex=-1;
      input.removeAttribute("aria-activedescendant");
      panel.replaceChildren();
  
      if (!query.trim()) {
        const caption=document.createElement("div");
        caption.className="location-suggestions-caption";
        caption.textContent=words.popular || "Popular places";
        panel.append(caption);
      }
      matches.forEach((item,i)=>{
        const opt=document.createElement("button");
        opt.type="button";
        opt.className="location-suggestion";
        opt.id=panel.id+"-option-"+i;
        opt.setAttribute("role","option");
        opt.setAttribute("aria-selected","false");
        const icon=document.createElement("span");
        icon.className="location-suggestion-icon";
        icon.setAttribute("aria-hidden","true");
        icon.textContent=item.type==="airport"?"✈":"⌖";
        const names=document.createElement("span");
        names.className="location-suggestion-copy";
        const heading=document.createElement("strong");
        heading.textContent=item.label;
        const supporting=document.createElement("small");
        const category=item.type==="airport" ? words.airport : words.city;
        const area=words.country?.[item.country] || item.country;
        supporting.textContent=[category,area].filter(Boolean).join(" · ");
        names.append(heading,supporting);
        opt.append(icon,names);
        opt.addEventListener("pointerdown",(event)=>event.preventDefault());
        opt.addEventListener("click",()=>choose(picker,item.label));
        panel.append(opt);
      });
  
      const customText=query.trim();
      const exact=matches.some(item=>normalize(item.label)===normalize(customText));
      if (customText && !exact) {
        const custom=document.createElement("button");
        custom.type="button";
        custom.id=panel.id+"-option-custom";
        custom.className="location-suggestion location-suggestion-custom";
        custom.setAttribute("role","option");
        custom.setAttribute("aria-selected","false");
        const icon=document.createElement("span");
        icon.className="location-suggestion-icon";
        icon.setAttribute("aria-hidden","true");
        icon.textContent="+";
        const title=document.createElement("span");
        title.className="location-suggestion-copy";
        const strong=document.createElement("strong");
        strong.textContent=words.custom || "Use entered address";
        const small=document.createElement("small");
        small.textContent=customText;
        title.append(strong,small);
        custom.append(icon,title);
        custom.addEventListener("pointerdown",(event)=>event.preventDefault());
        custom.addEventListener("click",()=>choose(picker,customText));
        panel.append(custom);
      }
  
      panel.hidden=false;
      input.setAttribute("aria-expanded","true");
      updatePosition(picker);
    }
  
    pickers.forEach((picker)=>{
      const input=picker.querySelector("input");
      const clear=picker.querySelector(".location-clear");
      clear.hidden=!input.value.trim();
      input.addEventListener("focus",()=>{
        setLocationEditing();
        if (input.value) input.select();
        closePicker(picker);
      });
      input.addEventListener("blur",()=>{
        closePicker(picker);
        document.body.classList.toggle("location-is-editing",
          pickers.some(p => p.querySelector("input") === document.activeElement));
      });
      input.addEventListener("input",()=>{
        clear.hidden=!input.value.trim();
        setLocationEditing();
        if (input.value.trim()) render(picker,input.value);
        else closePicker(picker);
      });
      input.addEventListener("keydown",(event)=>{
        if (event.key==="ArrowDown" || event.key==="ArrowUp"){
          event.preventDefault();
          if (picker!==activePicker) {
            if (!input.value.trim()) {
              const suggested=candidates(picker.dataset.locationMode,"");
              input.setAttribute("aria-expanded","true");
              const panel=picker.querySelector(".location-suggestions");
              render(picker,suggested[0]?.label || "");
            } else render(picker,input.value);
          }
          const total=picker.querySelectorAll(".location-suggestions [role=option]").length;
          if (total) activate(picker,event.key==="ArrowDown"?picker._activeIndex+1:picker._activeIndex===-1?total-1:picker._activeIndex-1);
        } else if (event.key==="Enter" && picker===activePicker) {
          const options=[...picker.querySelectorAll(".location-suggestions [role=option]")];
          if (picker._activeIndex >= 0 && options[picker._activeIndex]) {
            event.preventDefault();
            options[picker._activeIndex].click();
          } else {
            event.preventDefault();
            closePicker(picker);
            const next=picker.closest(".quick-booking, .booking-form")?.querySelector('input[name="to"]');
            if (input.name==="fromPreset" && next) next.focus();
            else input.blur();
          }
        } else if (event.key==="Escape" && picker===activePicker) {
          event.preventDefault();
          closePicker(picker);
        } else if (event.key==="Tab") closePicker(picker);
      });
      clear.addEventListener("click",()=>{
        input.value="";
        input.dispatchEvent(new Event("change",{bubbles:true}));
        input.focus({preventScroll:true});
        closePicker(picker);
        clear.hidden=true;
      });
    });
    document.addEventListener("pointerdown",(event)=>{
      if (!activePicker) return;
      const panel=activePicker.querySelector(".location-suggestions");
      if (!activePicker.contains(event.target) && !panel.contains(event.target)) closePicker(activePicker);
    },true);
    document.addEventListener("focusin",(event)=>{
      if (activePicker && !activePicker.contains(event.target)) closePicker(activePicker);
    });
    const reposition=()=>{if(activePicker) updatePosition(activePicker)};
    window.addEventListener("resize",reposition,{passive:true});
    document.addEventListener("scroll",reposition,true);
    window.visualViewport?.addEventListener("resize",reposition,{passive:true});
    window.visualViewport?.addEventListener("scroll",reposition,{passive:true});
  }
  initializeLocationAutocomplete();

  document.querySelectorAll("[data-open-booking]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      syncMobileDialogViewport();
      bookingDialog?.showModal();
    });
  });
  bookingDialog?.querySelector("[data-close-booking]")?.addEventListener("click", () => bookingDialog.close());
  bookingDialog?.addEventListener("click", (event) => {
    if (event.target === bookingDialog) bookingDialog.close();
  });
  // Passenger counts are kept as individual booking fields. Children and infants
  // count towards the maximum of eight seats; pets and suitcases are separate.
  const passengerPickers = [...document.querySelectorAll("[data-passenger-picker]")];

  function formatPassengerCount(picker, total) {
    if (picker.dataset.language === "ru" && total > 1 && total < 5) {
      return total + " пассажира";
    }
    const word = total === 1 ? picker.dataset.passengerOne : picker.dataset.passengerMany;
    return total + " " + word;
  }

  function updatePassengerPicker(picker) {
    const form = picker.closest("form");
    if (!form) return;
    const field = (name) => getControl(form, name);
    const number = (name) => Number(field(name)?.value || 0);
    const total = number("adults") + number("children") + number("infants");
    field("passengers").value = String(total);

    picker.querySelectorAll("[data-count-output]").forEach((output) => {
      const name = output.dataset.countOutput;
      output.textContent = String(number(name));
    });
    picker.querySelectorAll("[data-count-row]").forEach((row) => {
      const name = row.dataset.countRow;
      const min = name === "adults" ? 1 : 0;
      const max = name === "luggage" ? 25 : 8;
      const value = number(name);
      const minus = row.querySelector('[data-step="-1"]');
      const plus = row.querySelector('[data-step="1"]');
      if (minus) minus.disabled = value <= min;
      if (plus) plus.disabled = value >= max ||
        (["adults", "children", "infants"].includes(name) && total >= 8);
    });
    let classLabel = "";
    picker.querySelectorAll("[data-vehicle-class]").forEach((button) => {
      const selected = button.dataset.vehicleClass === field("carClass")?.value;
      button.setAttribute("aria-pressed", String(selected));
      if (selected) classLabel = button.textContent.trim();
    });
    const summary = picker.querySelector("[data-passenger-summary]");
    if (summary) summary.textContent = formatPassengerCount(picker, total) + " · " + classLabel;
  }

  function closePassengerPicker(picker, restoreFocus = false) {
    const panel = picker.querySelector(".passenger-panel");
    const toggle = picker.querySelector(".passenger-toggle");
    if (panel) panel.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle?.focus({ preventScroll: true });
  }

  passengerPickers.forEach((picker) => {
    const form = picker.closest("form");
    const panel = picker.querySelector(".passenger-panel");
    const toggle = picker.querySelector(".passenger-toggle");
    const warning = picker.querySelector(".passenger-limit-warning");
    if (!form || !panel || !toggle) return;

    toggle.addEventListener("click", () => {
      const wasOpen = !panel.hidden;
      passengerPickers.forEach((other) => closePassengerPicker(other));
      panel.hidden = wasOpen;
      toggle.setAttribute("aria-expanded", String(!wasOpen));
      if (warning) warning.hidden = true;
    });

    picker.querySelectorAll("[data-step][data-field]").forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.dataset.field;
        const field = getControl(form, name);
        if (!field) return;
        const current = Number(field.value || 0);
        const change = Number(button.dataset.step);
        const min = name === "adults" ? 1 : 0;
        const max = name === "luggage" ? 25 : 8;
        const total = ["adults", "children", "infants"].reduce(
          (sum, key) => sum + Number(getControl(form, key)?.value || 0), 0);
        if (change > 0 && ["adults", "children", "infants"].includes(name) && total >= 8) {
          if (warning) warning.hidden = false;
          return;
        }
        field.value = String(Math.max(min, Math.min(max, current + change)));
        if (warning) warning.hidden = true;
        updatePassengerPicker(picker);
      });
    });

    picker.querySelectorAll("[data-vehicle-class]").forEach((button) => {
      button.addEventListener("click", () => {
        getControl(form, "carClass").value = button.dataset.vehicleClass;
        const model = getControl(form, "vehicleModel");
        if (model?.value) {
          const matching = document.querySelector(`[data-request-model="${model.value}"]`);
          if (matching?.dataset.requestClass !== button.dataset.vehicleClass) {
            model.value = "";
            model.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
        updatePassengerPicker(picker);
      });
    });
    picker.querySelector("[data-apply-passengers]")?.addEventListener("click", () => {
      closePassengerPicker(picker, true);
    });
    picker.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closePassengerPicker(picker, true);
      }
    });
    updatePassengerPicker(picker);
  });

  document.addEventListener("click", (event) => {
    passengerPickers.forEach((picker) => {
      if (!picker.contains(event.target)) closePassengerPicker(picker);
    });
  });


  // Show actual fleet models as optional preferences. This never confirms a
  // vehicle or a price; the coordinator checks availability per route.
  const modelForm = bookingDialog?.querySelector(".booking-form");
  const modelSelect = modelForm?.elements.namedItem("vehicleModel");
  const carPicker = modelForm?.querySelector("[data-passenger-picker]");
  const modelButtons = [...document.querySelectorAll("[data-request-model]")];
  const modelKind = Object.fromEntries(modelButtons.map(button => [
    button.dataset.requestModel, button.dataset.requestClass
  ]));

  function highlightRequestedModel() {
    const selected = modelSelect?.value || "";
    modelButtons.forEach((button) => {
      const active = selected !== "" && button.dataset.requestModel === selected;
      button.setAttribute("aria-pressed", String(active));
      button.closest(".fleet-show-card")?.classList.toggle("fleet-selected", active);
    });
  }

  modelSelect?.addEventListener("change", () => {
    const matchedClass = modelKind[modelSelect.value];
    if (matchedClass && modelForm) {
      const classInput = getControl(modelForm, "carClass");
      if (classInput) classInput.value = matchedClass;
      if (carPicker) updatePassengerPicker(carPicker);
    }
    highlightRequestedModel();
  });

  modelButtons.forEach(button => button.addEventListener("click", () => {
    if (!modelSelect || !bookingDialog || !modelForm) return;
    modelSelect.value = button.dataset.requestModel;
    modelSelect.dispatchEvent(new Event("change", { bubbles: true }));
    if (!bookingDialog.open) bookingDialog.showModal();
    syncMobileDialogViewport();
    const field = modelSelect.closest(".vehicle-model-field");
    field?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    // Do not focus the select here: focusing it may open the iPhone picker
    // and cover the dialog before the visitor can review the choice.
  }));

  // Photos are served by ComfortLine's original fleet site and a licensed
  // city photographer. Retain a useful local fallback when remote images fail.
  document.querySelectorAll(".fleet-photo img, .route-local-scene img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.getAttribute("src") === "/assets/comfortline-transfer-van.webp") return;
      img.setAttribute("src", "/assets/comfortline-transfer-van.webp");
    });
  });

  document.querySelectorAll(".quick-booking").forEach((quick) => {
    quick.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!quick.reportValidity()) return;
      // The date and passenger details are completed inside the booking dialog.
      const details = document.querySelector(".booking-form");
      if (!details || !bookingDialog) return;
      for (const name of ["fromPreset", "to"]) {
        const source = getControl(quick, name);
        const target = getControl(details, name);
        if (source && target) target.value = source.value;
      }
      const detailedPicker = details.querySelector("[data-passenger-picker]");
      if (detailedPicker) updatePassengerPicker(detailedPicker);
      syncMobileDialogViewport();
      bookingDialog.showModal();
      // Do not show the mobile keyboard immediately: allow the user to review the form.
      if (!window.matchMedia("(max-width: 760px)").matches) {
        getControl(details, "pickupAddress")?.focus({ preventScroll: true });
      }
    });
  });

  document.querySelectorAll(".booking-form").forEach((form) => {
    let sending = false;
    const phoneInput = form.elements.namedItem("phone");
    const status = form.querySelector(".booking-status");

    function showBookingError(text) {
      if (!status) return;
      status.hidden = false;
      status.classList.add("booking-error");
      status.textContent = text;
    }

    phoneInput?.addEventListener("input", () => {
      phoneInput.setCustomValidity("");
      if (status?.classList.contains("booking-error")) status.hidden = true;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;

      const phone = String(phoneInput?.value || "").trim();
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 6 || digits.length > 16 || !/^[+\d()\s.-]+$/.test(phone)) {
        const explanation = form.dataset.invalidPhone || "Enter a valid contact phone number.";
        phoneInput.setCustomValidity(explanation);
        phoneInput.reportValidity();
        showBookingError(explanation);
        return;
      }

      const from = String(form.elements.namedItem("fromPreset")?.value || "").trim();
      const to = String(form.elements.namedItem("to")?.value || "").trim();
      if (from.toLocaleLowerCase() === to.toLocaleLowerCase()) {
        showBookingError(form.dataset.invalidRoute || "Departure and destination must be different.");
        form.elements.namedItem("fromPreset")?.focus();
        return;
      }

      const modelChoice = form.elements.namedItem("vehicleModel");
      const modelOption = modelChoice?.selectedOptions?.[0];
      const maximumSeats = Number(modelOption?.dataset.seats || 0);
      const people = Number(form.elements.namedItem("passengers")?.value || 1);
      if (modelChoice?.value && maximumSeats > 0 && people > maximumSeats) {
        const explanation = (form.dataset.capacityError || "Choose a larger vehicle for your group.")
          .replace("{seats}", String(maximumSeats))
          .replace("{people}", String(people));
        showBookingError(explanation);
        modelChoice.focus({ preventScroll: true });
        modelChoice.closest("label")?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      const lang = form.dataset.lang || "en";
      const sendButton = form.querySelector(".booking-prepare");
      const message = status;
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
      } catch (error) {
        // Keep all entered details and explain validation vs email-service errors.
        const code = error?.message;
        let explanation;
        if (code === "invalid_phone") {
          explanation = form.dataset.invalidPhone;
          phoneInput?.setCustomValidity(explanation);
          phoneInput?.reportValidity();
        } else if (code === "invalid_payload") {
          explanation = form.dataset.invalidForm;
        } else if (code === "rate_limited") {
          explanation = form.dataset.rateLimited;
        } else if (code === "email_unavailable") {
          explanation = form.dataset.serviceUnavailable;
        } else if (error?.name === "TypeError") {
          explanation = form.dataset.networkError;
        }
        showBookingError(explanation || form.dataset.sendError || "Email sending failed. Please try again.");
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
