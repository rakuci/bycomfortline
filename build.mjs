import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const out = new URL("./dist/", import.meta.url).pathname;
const base = "https://bycomfortline.com";
const phoneDisplay = "+375 (44) 762-06-49";
const phoneHref = "+375447620649";
const email = "info@comfortline.by";

const routes = {
  vilnius: { distance: "≈ 175 km", time: "2.5–5 h", airport: "VNO" },
  warsaw: { distance: "≈ 550 km", time: "6–9 h", airport: "WAW / WMI" },
  riga: { distance: "≈ 470 km", time: "5–8 h", airport: "RIX" },
};

const locale = {
  ru: {
    code: "ru", locale: "ru_BY", label: "Русский", home: "/ru/",
    nav: { routes: "Маршруты", service: "Как проходит поездка", faq: "Вопросы", contact: "Контакты" },
    kicker: "Международный трансфер • с 2015 года",
    hubTitle: "Частный трансфер в Минск из Вильнюса, Варшавы и Риги",
    hubDescription: "Персональное такси до адреса в Минске из Литвы, Польши и Латвии. Только ваша компания в автомобиле, согласованная подача и поддержка менеджера 24/7.",
    routesTitle: "Выберите маршрут в Минск",
    routesLead: "Поездка от двери до двери — без пересадок, общего расписания и попутчиков.",
    cardCta: "Подробнее о маршруте",
    trust: ["Лицензированный перевозчик", "Машина только для вас", "Детские кресла по запросу"],
    facts: { distance: "Расстояние", time: "Время в пути", note: "с учётом дорожной ситуации и границы", airport: "Аэропорты" },
    routeNames: { vilnius: "Вильнюс — Минск", warsaw: "Варшава — Минск", riga: "Рига — Минск" },
    fromNames: { vilnius: "Вильнюс", warsaw: "Варшава", riga: "Рига" },
    slugs: { vilnius: "vilnius-minsk-transfer", warsaw: "warsaw-minsk-transfer", riga: "riga-minsk-transfer" },
    routeTitle: key => `${locale.ru.routeNames[key]}: частный трансфер и такси`,
    routeDescriptions: {
      vilnius: "Встречаем по адресу в Вильнюсе или в аэропорту VNO и доставляем до нужного адреса в Минске. Индивидуальный автомобиль, помощь с багажом и согласованное время подачи.",
      warsaw: "Забираем по адресу в Варшаве, в аэропорту Шопена WAW или Модлин WMI и доставляем прямо в Минск. Удобно для семьи, деловой поездки и большого багажа.",
      riga: "Встречаем в Риге или аэропорту RIX и везём без пересадок до адреса в Минске. Маршрут и время выезда согласуем с учётом ваших планов.",
    },
    serviceTitle: "Спокойная поездка от двери до двери",
    services: [
      ["Точная подача", "Водитель приезжает к согласованному адресу или встречает в аэропорту."],
      ["Один автомобиль", "Вы едете только своей компанией — без подсадки других пассажиров."],
      ["Подходящий класс", "Седан, минивэн или микроавтобус под количество пассажиров и багажа."],
      ["Связь 24/7", "Менеджер координирует подачу и остаётся на связи по маршруту."],
    ],
    stepsTitle: "Как заказать трансфер",
    steps: [["01", "Оставьте маршрут", "Сообщите адреса, дату, время, пассажиров и багаж."], ["02", "Получите расчёт", "Мы согласуем автомобиль, стоимость и время выезда."], ["03", "Доедьте до адреса", "Водитель встретит вас и доставит без пересадок."]],
    formTitle: "Рассчитать поездку",
    formLead: "Отправьте детали по email или позвоните — менеджер подтвердит возможность и стоимость.",
    fields: { from: "Откуда", to: "Куда", date: "Дата и время", passengers: "Пассажиры", phone: "Телефон для связи" },
    fieldValues: { to: "Минск", fromPlaceholder: "Город, аэропорт или адрес", passengers: "Например, 3 взрослых и ребёнок", phone: "+375 …" },
    submit: "Отправить запрос", call: "Позвонить", emailLabel: "Написать на email", formNote: "Кнопка откроет подготовленное письмо в вашей почтовой программе.",
    faqTitle: "Частые вопросы",
    faqs: [
      ["Сколько стоит частный трансфер?", "Стоимость зависит от точки подачи, даты, класса автомобиля и количества пассажиров. Итоговую цену согласуем до поездки."],
      ["Время на границе входит в расчёт маршрута?", "Указанное время ориентировочное. Очередь и продолжительность пограничного контроля меняются, поэтому точное время прибытия гарантировать невозможно."],
      ["Можно заказать встречу в аэропорту?", "Да. Укажите аэропорт, номер рейса и время прилёта — согласуем удобное место встречи."],
      ["Есть ли детские кресла и место для большого багажа?", "Да, сообщите возраст ребёнка и объём багажа при заказе. Мы подберём подходящий автомобиль и оснащение."],
    ],
    otherTitle: "Другие направления",
    footerText: "Индивидуальные трансферы между Беларусью и Европой. Работаем с 2015 года.",
    license: "ИП Мурашко Андрей Антонович · лицензия № 02190/1-85358 · УНП 193255422",
    rights: "Все права защищены.",
  },
  pl: {
    code: "pl", locale: "pl_PL", label: "Polski", home: "/pl/",
    nav: { routes: "Trasy", service: "Jak wygląda przejazd", faq: "Pytania", contact: "Kontakt" },
    kicker: "Transfer międzynarodowy • od 2015 roku",
    hubTitle: "Prywatny transfer do Mińska z Wilna, Warszawy i Rygi",
    hubDescription: "Taksówka pod wskazany adres w Mińsku z Litwy, Polski lub Łotwy. Samochód wyłącznie dla Państwa grupy, uzgodniona godzina odbioru i całodobowy kontakt z koordynatorem.",
    routesTitle: "Wybierz trasę do Mińska",
    routesLead: "Przejazd od drzwi do drzwi — bez przesiadek, rozkładu jazdy i obcych pasażerów.",
    cardCta: "Zobacz szczegóły trasy",
    trust: ["Licencjonowany przewoźnik", "Samochód tylko dla Państwa", "Foteliki dziecięce na życzenie"],
    facts: { distance: "Odległość", time: "Czas przejazdu", note: "zależnie od drogi i odprawy granicznej", airport: "Lotniska" },
    routeNames: { vilnius: "Wilno – Mińsk", warsaw: "Warszawa – Mińsk", riga: "Ryga – Mińsk" },
    fromNames: { vilnius: "Wilno", warsaw: "Warszawa", riga: "Ryga" },
    slugs: { vilnius: "wilno-minsk-transfer", warsaw: "warszawa-minsk-transfer", riga: "ryga-minsk-transfer" },
    routeTitle: key => `${locale.pl.routeNames[key]}: prywatny transfer i taksówka`,
    routeDescriptions: {
      vilnius: "Odbieramy spod wskazanego adresu w Wilnie lub z lotniska VNO i dowozimy bezpośrednio do Mińska. Prywatny samochód, pomoc z bagażem i uzgodniona godzina odbioru.",
      warsaw: "Odbiór w Warszawie, na Lotnisku Chopina WAW lub w Modlinie WMI i bezpośredni przejazd do Mińska. Wygodnie dla rodziny, podróży służbowej i większego bagażu.",
      riga: "Odbieramy w Rydze lub na lotnisku RIX i jedziemy bez przesiadek pod wskazany adres w Mińsku. Trasę i godzinę wyjazdu dopasujemy do Państwa planów.",
    },
    serviceTitle: "Spokojna podróż od drzwi do drzwi",
    services: [["Punktualny odbiór", "Kierowca przyjeżdża pod uzgodniony adres lub odbiera z lotniska."], ["Prywatny samochód", "Podróżują Państwo tylko we własnej grupie, bez dodatkowych pasażerów."], ["Dopasowana klasa", "Sedan, minivan lub bus odpowiedni do liczby osób i bagażu."], ["Kontakt 24/7", "Koordynator nadzoruje odbiór i pozostaje w kontakcie podczas podróży."]],
    stepsTitle: "Jak zamówić transfer",
    steps: [["01", "Podaj trasę", "Prześlij adresy, datę, godzinę, liczbę pasażerów i bagaż."], ["02", "Odbierz wycenę", "Uzgodnimy samochód, cenę oraz najlepszą godzinę wyjazdu."], ["03", "Jedź pod wskazany adres", "Kierowca odbierze Państwa i dowiezie bez przesiadek."]],
    formTitle: "Poproś o wycenę",
    formLead: "Wyślij szczegóły e-mailem lub zadzwoń — potwierdzimy dostępność i cenę.",
    fields: { from: "Skąd", to: "Dokąd", date: "Data i godzina", passengers: "Pasażerowie", phone: "Telefon kontaktowy" },
    fieldValues: { to: "Mińsk", fromPlaceholder: "Miasto, lotnisko lub adres", passengers: "Np. 3 dorosłych i dziecko", phone: "+48 …" },
    submit: "Wyślij zapytanie", call: "Zadzwoń", emailLabel: "Napisz e-mail", formNote: "Przycisk otworzy gotową wiadomość w domyślnym programie pocztowym.",
    faqTitle: "Najczęstsze pytania",
    faqs: [["Ile kosztuje prywatny transfer?", "Cena zależy od miejsca odbioru, daty, klasy samochodu i liczby pasażerów. Ostateczną kwotę uzgadniamy przed podróżą."], ["Czy czas na granicy jest wliczony w czas trasy?", "Podany czas jest orientacyjny. Kolejka i odprawa graniczna mogą się zmieniać, dlatego nie możemy zagwarantować dokładnej godziny przyjazdu."], ["Czy można zamówić odbiór z lotniska?", "Tak. Prosimy podać lotnisko, numer rejsu i godzinę przylotu — uzgodnimy wygodne miejsce spotkania."], ["Czy są foteliki dziecięce i miejsce na duży bagaż?", "Tak. Przy zamówieniu prosimy podać wiek dziecka i ilość bagażu, aby dobrać odpowiedni samochód i wyposażenie."]],
    otherTitle: "Pozostałe trasy",
    footerText: "Prywatne transfery między Białorusią a Europą. Działamy od 2015 roku.",
    license: "Przewoźnik: Murashko Andrey Antonovich · licencja nr 02190/1-85358 · UNP 193255422",
    rights: "Wszelkie prawa zastrzeżone.",
  },
  lt: {
    code: "lt", locale: "lt_LT", label: "Lietuvių", home: "/lt/",
    nav: { routes: "Maršrutai", service: "Kaip vyksta kelionė", faq: "Klausimai", contact: "Kontaktai" },
    kicker: "Tarptautinis pervežimas • nuo 2015 m.",
    hubTitle: "Privatus pervežimas į Minską iš Vilniaus, Varšuvos ir Rygos",
    hubDescription: "Taksi iki nurodyto adreso Minske iš Lietuvos, Lenkijos ar Latvijos. Automobilis tik jūsų grupei, suderintas paėmimo laikas ir koordinatoriaus pagalba visą parą.",
    routesTitle: "Pasirinkite maršrutą į Minską",
    routesLead: "Kelionė nuo durų iki durų — be persėdimų, tvarkaraščių ir pašalinių keleivių.",
    cardCta: "Maršruto informacija",
    trust: ["Licencijuotas vežėjas", "Automobilis tik jums", "Vaikiškos kėdutės pagal užsakymą"],
    facts: { distance: "Atstumas", time: "Kelionės trukmė", note: "priklauso nuo eismo ir sienos kontrolės", airport: "Oro uostai" },
    routeNames: { vilnius: "Vilnius–Minskas", warsaw: "Varšuva–Minskas", riga: "Ryga–Minskas" },
    fromNames: { vilnius: "Vilnius", warsaw: "Varšuva", riga: "Ryga" },
    slugs: { vilnius: "vilnius-minskas-pervezimas", warsaw: "varsuva-minskas-pervezimas", riga: "ryga-minskas-pervezimas" },
    routeTitle: key => `${locale.lt.routeNames[key]}: privatus pervežimas ir taksi`,
    routeDescriptions: {
      vilnius: "Paimame nurodytu adresu Vilniuje arba Vilniaus oro uoste VNO ir nuvežame tiesiai į Minską. Privatus automobilis, pagalba su bagažu ir iš anksto suderintas paėmimo laikas.",
      warsaw: "Paimame Varšuvoje, Šopeno oro uoste WAW arba Modlino oro uoste WMI ir nuvežame tiesiai į Minską. Patogu šeimai, verslo kelionei ir didesniam bagažui.",
      riga: "Paimame Rygoje arba oro uoste RIX ir be persėdimų nuvežame nurodytu adresu Minske. Maršrutą ir išvykimo laiką suderiname pagal jūsų planus.",
    },
    serviceTitle: "Rami kelionė nuo durų iki durų",
    services: [["Sutartas paėmimas", "Vairuotojas atvyksta nurodytu adresu arba pasitinka oro uoste."], ["Privatus automobilis", "Keliaujate tik su savo grupe, be kitų keleivių."], ["Tinkamas automobilis", "Sedanas, minivenas ar mikroautobusas pagal keleivių ir bagažo kiekį."], ["Ryšys visą parą", "Koordinatorius prižiūri paėmimą ir lieka pasiekiamas kelionės metu."]],
    stepsTitle: "Kaip užsakyti pervežimą",
    steps: [["01", "Nurodykite maršrutą", "Atsiųskite adresus, datą, laiką, keleivių ir bagažo informaciją."], ["02", "Gaukite pasiūlymą", "Suderinsime automobilį, kainą ir tinkamiausią išvykimo laiką."], ["03", "Keliaukite iki adreso", "Vairuotojas pasitiks ir nuveš be persėdimų."]],
    formTitle: "Gauti kelionės kainą",
    formLead: "Atsiųskite informaciją el. paštu arba paskambinkite — patvirtinsime galimybę ir kainą.",
    fields: { from: "Iš kur", to: "Į kur", date: "Data ir laikas", passengers: "Keleiviai", phone: "Kontaktinis telefonas" },
    fieldValues: { to: "Minskas", fromPlaceholder: "Miestas, oro uostas arba adresas", passengers: "Pvz., 3 suaugusieji ir vaikas", phone: "+370 …" },
    submit: "Siųsti užklausą", call: "Skambinti", emailLabel: "Rašyti el. paštu", formNote: "Mygtukas atvers paruoštą laišką jūsų el. pašto programoje.",
    faqTitle: "Dažniausi klausimai",
    faqs: [["Kiek kainuoja privatus pervežimas?", "Kaina priklauso nuo paėmimo vietos, datos, automobilio klasės ir keleivių skaičiaus. Galutinę kainą suderiname prieš kelionę."], ["Ar pasienyje praleistas laikas įskaičiuotas?", "Nurodyta trukmė yra orientacinė. Eilės ir pasienio kontrolės trukmė keičiasi, todėl tikslaus atvykimo laiko garantuoti negalime."], ["Ar galima užsakyti paėmimą oro uoste?", "Taip. Nurodykite oro uostą, skrydžio numerį ir atvykimo laiką — suderinsime patogią susitikimo vietą."], ["Ar yra vaikiškų kėdučių ir vietos dideliam bagažui?", "Taip. Užsakydami nurodykite vaiko amžių ir bagažo kiekį, kad parinktume tinkamą automobilį ir įrangą."]],
    otherTitle: "Kiti maršrutai",
    footerText: "Privatūs pervežimai tarp Baltarusijos ir Europos. Dirbame nuo 2015 m.",
    license: "Vežėjas: Murashko Andrey Antonovich · licencija Nr. 02190/1-85358 · UNP 193255422",
    rights: "Visos teisės saugomos.",
  },
  lv: {
    code: "lv", locale: "lv_LV", label: "Latviešu", home: "/lv/",
    nav: { routes: "Maršruti", service: "Kā notiek brauciens", faq: "Jautājumi", contact: "Kontakti" },
    kicker: "Starptautisks transfērs • kopš 2015. gada",
    hubTitle: "Privāts transfērs uz Minsku no Viļņas, Varšavas un Rīgas",
    hubDescription: "Taksometrs līdz norādītajai adresei Minskā no Lietuvas, Polijas vai Latvijas. Auto tikai jūsu grupai, saskaņots saņemšanas laiks un koordinatora atbalsts visu diennakti.",
    routesTitle: "Izvēlieties maršrutu uz Minsku",
    routesLead: "Brauciens no durvīm līdz durvīm — bez pārsēšanās, grafika un citiem pasažieriem.",
    cardCta: "Skatīt maršruta informāciju",
    trust: ["Licencēts pārvadātājs", "Auto tikai jums", "Bērnu sēdeklīši pēc pieprasījuma"],
    facts: { distance: "Attālums", time: "Brauciena laiks", note: "atkarībā no satiksmes un robežkontroles", airport: "Lidostas" },
    routeNames: { vilnius: "Viļņa–Minska", warsaw: "Varšava–Minska", riga: "Rīga–Minska" },
    fromNames: { vilnius: "Viļņa", warsaw: "Varšava", riga: "Rīga" },
    slugs: { vilnius: "vilna-minska-transfers", warsaw: "varsava-minska-transfers", riga: "riga-minska-transfers" },
    routeTitle: key => `${locale.lv.routeNames[key]}: privāts transfērs un taksometrs`,
    routeDescriptions: {
      vilnius: "Saņemam norādītajā adresē Viļņā vai lidostā VNO un nogādājam tieši uz Minsku. Privāts auto, palīdzība ar bagāžu un iepriekš saskaņots saņemšanas laiks.",
      warsaw: "Saņemam Varšavā, Šopēna lidostā WAW vai Modlinas lidostā WMI un nogādājam tieši uz Minsku. Ērti ģimenei, darījumu braucienam un lielākai bagāžai.",
      riga: "Saņemam Rīgā vai lidostā RIX un bez pārsēšanās nogādājam norādītajā adresē Minskā. Maršrutu un izbraukšanas laiku pielāgojam jūsu plāniem.",
    },
    serviceTitle: "Mierīgs brauciens no durvīm līdz durvīm",
    services: [["Saskaņota saņemšana", "Vadītājs ierodas norādītajā adresē vai sagaida lidostā."], ["Privāts auto", "Braucat tikai savā grupā, bez citiem pasažieriem."], ["Piemērots auto", "Sedans, minivens vai mikroautobuss atbilstoši pasažieru un bagāžas skaitam."], ["Saziņa visu diennakti", "Koordinators pārrauga saņemšanu un ir sasniedzams brauciena laikā."]],
    stepsTitle: "Kā pasūtīt transfēru",
    steps: [["01", "Norādiet maršrutu", "Nosūtiet adreses, datumu, laiku, pasažieru un bagāžas informāciju."], ["02", "Saņemiet piedāvājumu", "Saskaņosim automašīnu, cenu un piemērotāko izbraukšanas laiku."], ["03", "Brauciet līdz adresei", "Vadītājs jūs sagaidīs un nogādās bez pārsēšanās."]],
    formTitle: "Saņemt brauciena cenu",
    formLead: "Nosūtiet informāciju e-pastā vai zvaniet — apstiprināsim pieejamību un cenu.",
    fields: { from: "No kurienes", to: "Uz kurieni", date: "Datums un laiks", passengers: "Pasažieri", phone: "Kontakttālrunis" },
    fieldValues: { to: "Minska", fromPlaceholder: "Pilsēta, lidosta vai adrese", passengers: "Piem., 3 pieaugušie un bērns", phone: "+371 …" },
    submit: "Nosūtīt pieprasījumu", call: "Zvanīt", emailLabel: "Rakstīt e-pastā", formNote: "Poga atvērs sagatavotu vēstuli jūsu e-pasta programmā.",
    faqTitle: "Biežākie jautājumi",
    faqs: [["Cik maksā privāts transfērs?", "Cena ir atkarīga no saņemšanas vietas, datuma, auto klases un pasažieru skaita. Galīgo cenu saskaņojam pirms brauciena."], ["Vai robežkontroles laiks ir iekļauts brauciena laikā?", "Norādītais laiks ir aptuvens. Rindas un robežkontroles ilgums mainās, tādēļ precīzu ierašanās laiku garantēt nevaram."], ["Vai var pasūtīt sagaidīšanu lidostā?", "Jā. Norādiet lidostu, reisa numuru un ielidošanas laiku — saskaņosim ērtu tikšanās vietu."], ["Vai ir bērnu sēdeklīši un vieta lielai bagāžai?", "Jā. Pasūtot norādiet bērna vecumu un bagāžas daudzumu, lai varam izvēlēties piemērotu auto un aprīkojumu."]],
    otherTitle: "Citi maršruti",
    footerText: "Privāti transfēri starp Baltkrieviju un Eiropu. Strādājam kopš 2015. gada.",
    license: "Pārvadātājs: Murashko Andrey Antonovich · licence Nr. 02190/1-85358 · UNP 193255422",
    rights: "Visas tiesības aizsargātas.",
  },
};

const icons = {
  pin: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  phone: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></svg>',
  mail: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m22 6-10 7L2 6"/></svg>',
};

function esc(value) {
  return String(value).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function routePath(lang, key) { return `/${lang}/${locale[lang].slugs[key]}/`; }

function alternateLinks(pathType, routeKey) {
  const links = Object.keys(locale).map(lang => {
    const href = pathType === "home" ? `${base}/${lang}/` : `${base}${routePath(lang, routeKey)}`;
    return `<link rel="alternate" hreflang="${lang}" href="${href}">`;
  });
  links.push(`<link rel="alternate" hreflang="x-default" href="${base}/">`);
  return links.join("\n    ");
}

function languageMenu(lang, type, routeKey) {
  return Object.entries(locale).map(([code, l]) => {
    const href = type === "home" ? l.home : routePath(code, routeKey);
    return `<a href="${href}" hreflang="${code}" lang="${code}"${code === lang ? ' aria-current="page"' : ""}>${l.label}</a>`;
  }).join("");
}

function header(lang, type = "home", routeKey) {
  const l = locale[lang];
  return `<header class="site-header">
    <a class="brand" href="${l.home}" aria-label="Comfortline">
      <img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56">
    </a>
    <nav class="main-nav" aria-label="${esc(l.nav.routes)}">
      <a href="${l.home}#routes">${l.nav.routes}</a><a href="#service">${l.nav.service}</a><a href="#faq">${l.nav.faq}</a><a href="#contact">${l.nav.contact}</a>
    </nav>
    <details class="language-menu"><summary>${l.code.toUpperCase()}<span aria-hidden="true">⌄</span></summary><div>${languageMenu(lang, type, routeKey)}</div></details>
  </header>`;
}

function trustStrip(l) {
  return `<div class="trust-strip">${l.trust.map((item, i) => `<span><b>${["✓", "1", "↗"][i]}</b>${esc(item)}</span>`).join("")}</div>`;
}

function routeCards(lang, current) {
  const l = locale[lang];
  return Object.keys(routes).filter(key => key !== current).map(key => {
    const r = routes[key];
    return `<a class="route-card" href="${routePath(lang, key)}"><span class="route-card-top"><span>${esc(l.fromNames[key])}</span><span>${r.airport}</span></span><strong>${esc(l.routeNames[key])}</strong><span class="route-line"><i></i><i></i></span><span class="route-meta"><span>${r.distance}</span><span>${r.time}</span></span><span class="route-link">${esc(l.cardCta)} ${icons.arrow}</span></a>`;
  }).join("");
}

function bookingForm(lang, from = "") {
  const l = locale[lang];
  return `<section class="booking-section" id="contact">
    <div class="booking-copy"><span class="eyebrow">Comfortline</span><h2>${esc(l.formTitle)}</h2><p>${esc(l.formLead)}</p><div class="direct-contact"><a href="tel:${phoneHref}">${icons.phone}<span>${esc(l.call)}<strong>${phoneDisplay}</strong></span></a><a href="mailto:${email}">${icons.mail}<span>${esc(l.emailLabel)}<strong>${email}</strong></span></a></div></div>
    <form class="booking-form" data-lang="${lang}" data-email="${email}">
      <label><span>${esc(l.fields.from)}</span><input name="from" value="${esc(from)}" placeholder="${esc(l.fieldValues.fromPlaceholder)}" required></label>
      <label><span>${esc(l.fields.to)}</span><input name="to" value="${esc(l.fieldValues.to)}" required></label>
      <label><span>${esc(l.fields.date)}</span><input type="datetime-local" name="date" required></label>
      <label><span>${esc(l.fields.passengers)}</span><input name="passengers" placeholder="${esc(l.fieldValues.passengers)}" required></label>
      <label class="full"><span>${esc(l.fields.phone)}</span><input type="tel" name="phone" placeholder="${esc(l.fieldValues.phone)}" required></label>
      <button type="submit">${esc(l.submit)} ${icons.arrow}</button><small>${esc(l.formNote)}</small>
    </form>
  </section>`;
}

function faq(l) {
  return `<section class="section faq-section" id="faq"><div class="section-head"><span class="eyebrow">FAQ</span><h2>${esc(l.faqTitle)}</h2></div><div class="faq-list">${l.faqs.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join("")}</div></section>`;
}

function footer(l) {
  return `<footer><div class="footer-grid"><div><a class="brand footer-brand" href="${l.home}"><img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56"></a><p>${esc(l.footerText)}</p></div><div><strong>${esc(l.nav.contact)}</strong><a href="tel:${phoneHref}">${phoneDisplay}</a><a href="mailto:${email}">${email}</a><a href="https://comfortline.by" rel="noopener">comfortline.by</a></div><div><strong>${esc(l.nav.routes)}</strong>${Object.keys(routes).map(key => `<a href="${routePath(l.code, key)}">${esc(l.routeNames[key])}</a>`).join("")}</div></div><div class="legal"><span>${esc(l.license)}</span><span>© 2026 ComfortLine. ${esc(l.rights)}</span></div></footer>`;
}

function layout({ lang, title, description, canonical, alternates, body, schema }) {
  const l = locale[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}">${alternates}<meta name="theme-color" content="#081a2d"><link rel="stylesheet" href="/assets/style.css"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script><script src="/assets/app.js" defer></script></head><body>${body}</body></html>`;
}

function businessSchema(lang, url) {
  const l = locale[lang];
  return { "@context": "https://schema.org", "@type": "TaxiService", name: "ComfortLine", url, telephone: phoneHref, email, foundingDate: "2015", areaServed: ["Belarus", "Lithuania", "Poland", "Latvia"], address: { "@type": "PostalAddress", streetAddress: "ул. Фёдорова, 19-10", addressLocality: "Минск", addressCountry: "BY" }, slogan: l.footerText };
}

function hubPage(lang) {
  const l = locale[lang];
  const canonical = `${base}/${lang}/`;
  const title = `${l.hubTitle} | ComfortLine`;
  const body = `${header(lang)}<main>
    <section class="hero hero-home"><div class="hero-overlay"></div><div class="hero-content"><span class="eyebrow light">${esc(l.kicker)}</span><h1>${esc(l.hubTitle)}</h1><p>${esc(l.hubDescription)}</p><div class="hero-actions"><a class="button primary" href="#contact">${esc(l.formTitle)} ${icons.arrow}</a><a class="button ghost" href="tel:${phoneHref}">${icons.phone}${phoneDisplay}</a></div></div><div class="route-orbit" aria-hidden="true"><span>VNO</span><i></i><b>MSQ</b><i></i><span>WAW</span><i></i><span>RIX</span></div></section>
    ${trustStrip(l)}
    <section class="section routes-section" id="routes"><div class="section-head"><span class="eyebrow">Comfortline routes</span><h2>${esc(l.routesTitle)}</h2><p>${esc(l.routesLead)}</p></div><div class="route-grid three">${routeCards(lang)}</div></section>
    <section class="service-section" id="service"><div class="service-intro"><span class="eyebrow light">Door to door</span><h2>${esc(l.serviceTitle)}</h2></div><div class="service-grid">${l.services.map(([h, p], i) => `<article><span>0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    <section class="section steps-section"><div class="section-head"><span class="eyebrow">3 steps</span><h2>${esc(l.stepsTitle)}</h2></div><div class="steps">${l.steps.map(([n, h, p]) => `<article><span>${n}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    ${bookingForm(lang)}${faq(l)}</main>${footer(l)}`;
  return layout({ lang, title, description: l.hubDescription, canonical, alternates: alternateLinks("home"), body, schema: businessSchema(lang, canonical) });
}

function routePage(lang, key) {
  const l = locale[lang], r = routes[key];
  const canonical = `${base}${routePath(lang, key)}`;
  const h1 = l.routeTitle(key);
  const description = `${h1}. ${l.routeDescriptions[key]}`;
  const faqSchema = { "@type": "FAQPage", mainEntity: l.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const schema = { "@context": "https://schema.org", "@graph": [businessSchema(lang, canonical), { "@type": "Service", name: h1, provider: { "@type": "TaxiService", name: "ComfortLine" }, areaServed: [l.fromNames[key], "Minsk"], url: canonical }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: l.nav.routes, item: `${base}/${lang}/` }, { "@type": "ListItem", position: 2, name: l.routeNames[key], item: canonical }] }, faqSchema] };
  const body = `${header(lang, "route", key)}<main>
    <section class="route-hero"><div class="route-hero-bg"></div><div class="route-hero-content"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span><span>${esc(l.routeNames[key])}</span></nav><span class="eyebrow light">${esc(l.kicker)}</span><h1>${esc(h1)}</h1><p>${esc(l.routeDescriptions[key])}</p><div class="hero-actions"><a class="button primary" href="#contact">${esc(l.formTitle)} ${icons.arrow}</a><a class="button ghost" href="tel:${phoneHref}">${icons.phone}${phoneDisplay}</a></div></div><div class="journey-card"><div><span>${esc(l.fromNames[key])}</span><b>${r.airport}</b></div><div class="journey-line"><i></i><em>${r.distance}</em><i></i></div><div><span>Minsk</span><b>MSQ</b></div></div></section>
    ${trustStrip(l)}
    <section class="facts-section"><article><span>${icons.pin}</span><div><small>${esc(l.facts.distance)}</small><strong>${r.distance}</strong></div></article><article><span class="clock">◷</span><div><small>${esc(l.facts.time)}</small><strong>${r.time}</strong><em>${esc(l.facts.note)}</em></div></article><article><span class="plane">✈</span><div><small>${esc(l.facts.airport)}</small><strong>${r.airport}</strong></div></article></section>
    <section class="service-section" id="service"><div class="service-intro"><span class="eyebrow light">${esc(l.routeNames[key])}</span><h2>${esc(l.serviceTitle)}</h2></div><div class="service-grid">${l.services.map(([h, p], i) => `<article><span>0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    <section class="section steps-section"><div class="section-head"><span class="eyebrow">3 steps</span><h2>${esc(l.stepsTitle)}</h2></div><div class="steps">${l.steps.map(([n, h, p]) => `<article><span>${n}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    ${bookingForm(lang, l.fromNames[key])}${faq(l)}
    <section class="section other-routes"><div class="section-head"><span class="eyebrow">Comfortline</span><h2>${esc(l.otherTitle)}</h2></div><div class="route-grid">${routeCards(lang, key)}</div></section>
    </main>${footer(l)}`;
  return layout({ lang, title: `${h1} | ComfortLine`, description, canonical, alternates: alternateLinks("route", key), body, schema });
}

function gateway() {
  const links = Object.entries(locale).map(([code, l]) => `<a href="/${code}/"><span>${code.toUpperCase()}</span><strong>${l.label}</strong>${icons.arrow}</a>`).join("");
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ComfortLine — private transfers to Minsk</title><meta name="description" content="Private transfers to Minsk from Vilnius, Warsaw and Riga in Russian, Polish, Lithuanian and Latvian."><meta name="robots" content="index,follow"><link rel="canonical" href="${base}/">${alternateLinks("home")}<link rel="stylesheet" href="/assets/style.css"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"></head><body class="gateway"><main><div class="gateway-panel"><a class="brand" href="/"><img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56"></a><p>Private transfers to Minsk</p><h1>Choose your language</h1><div class="gateway-links">${links}</div><small>Vilnius · Warsaw · Riga · Minsk</small></div></main></body></html>`;
}

async function put(relative, content) {
  const file = join(out, relative);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

await put("index.html", gateway());
for (const lang of Object.keys(locale)) {
  await put(`${lang}/index.html`, hubPage(lang));
  for (const key of Object.keys(routes)) await put(`${lang}/${locale[lang].slugs[key]}/index.html`, routePage(lang, key));
}

const urls = [`${base}/`, ...Object.keys(locale).flatMap(lang => [`${base}/${lang}/`, ...Object.keys(routes).map(key => `${base}${routePath(lang, key)}`)])];
await put("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc><changefreq>monthly</changefreq><priority>${url.split("/").filter(Boolean).length <= 1 ? "0.9" : "0.8"}</priority></url>`).join("\n")}\n</urlset>`);
await put("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
