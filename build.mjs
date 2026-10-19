import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { routeSeo } from "./route-seo.mjs";
import { routeExtras } from "./route-extras.mjs";
import { airportHubLinks } from "./airport-hub-links.mjs";
import { bookingTrustContent, routeOfficialSources, reverseRoutePages } from "./booking-trust-content.mjs";
import { fleetCatalog, fleetCopy, routeScenes, reverseJourneyCopy } from "./fleet-showcase.mjs";
import { additionalLocales } from "./fr-de-localization.mjs";
import { geoAirports } from "./geo-airports.mjs";
import { geoCities } from "./geo-cities.mjs";
import { geoLocale } from "./geo-locales.mjs";
import { belarusDestinations } from "./belarus-destinations.mjs";
import { destinationLocale } from "./destination-locales.mjs";
import { locationCatalog, locationLabels } from "./booking-locations.mjs";
import { bookingPopupUi } from "./booking-popup-i18n.mjs";
import { dirname, join } from "node:path";

const out = new URL("./dist/", import.meta.url).pathname;
const base = "https://bycomfortline.com";
const seoLastmod = "2026-10-19";
const phoneDisplay = "+375 29 155 27 76";
const phoneHref = "+375291552776";
const email = "info@comfortline.by";

const destinationLabels = {
  de: "Minsk, Belarus",
  fr: "Minsk, Biélorussie",
  en: "Minsk, Belarus",
  ru: "Минск, Беларусь",
  pl: "Mińsk, Białoruś",
  lt: "Minskas, Baltarusija",
  lv: "Minska, Baltkrievija"
};

const routes = {
  vilnius: { distance: "≈ 175 km", time: "2.5–5 h", airport: "VNO" },
  warsaw: { distance: "≈ 550 km", time: "6–9 h", airport: "WAW / WMI" },
  riga: { distance: "≈ 470 km", time: "5–8 h", airport: "RIX" },
};

const locale = {
  en: {
    code: "en", locale: "en_US", label: "English", home: "/en/",
    nav: { routes: "Routes", service: "How it works", faq: "Questions", contact: "Contact" },
    kicker: "Private international transfers • since 2015",
    hubTitle: "Private transfers to Minsk from Vilnius, Warsaw and Riga",
    hubDescription: "ComfortLine arranges private, door-to-door road transfers from Lithuania, Poland and Latvia to Minsk. Choose your pickup location, book a vehicle for your group and agree on the details in advance.",
    routesTitle: "Choose your transfer route to Minsk",
    routesLead: "Plan your journey to Minsk from Vilnius, Warsaw or Riga, with city or airport pickup and a private car for your group.",
    cardCta: "Explore this transfer",
    trust: ["Licensed transport provider", "Private vehicle for your group", "Child seats on request"],
    facts: { distance: "Distance", time: "Travel time", note: "indicative; traffic and border checks can change it", airport: "Airports" },
    routeNames: { vilnius: "Vilnius – Minsk", warsaw: "Warsaw – Minsk", riga: "Riga – Minsk" },
    fromNames: { vilnius: "Vilnius", warsaw: "Warsaw", riga: "Riga" },
    slugs: { vilnius: "vilnius-minsk-transfer", warsaw: "warsaw-minsk-transfer", riga: "riga-minsk-transfer" },
    routeTitle: key => routeSeo.en[key].h1,
    routeDescriptions: {
      vilnius: "Private car from Vilnius city or Vilnius Airport VNO to a Minsk address, with an agreed pickup plan and assistance with luggage.",
      warsaw: "Private transfer from Warsaw, Chopin Airport WAW or Modlin Airport WMI to your address in Minsk.",
      riga: "Individual car from Riga or Riga Airport RIX to Minsk, with a planned pickup and the vehicle reserved for your group.",
    },
    serviceTitle: "Your journey, planned around you",
    services: [
      ["Pickup at your address", "We agree on where and when to meet, including at airports."],
      ["Just your own group", "Travel without sharing a vehicle with unrelated passengers."],
      ["Room for your luggage", "Discuss sedan, minivan or larger vehicle options when booking."],
      ["Trip coordination", "Our coordinator helps arrange pickup and stays in touch about the journey."],
    ],
    stepsTitle: "How to arrange your transfer",
    steps: [["01", "Send your route", "Tell us the addresses, date, travellers and luggage."], ["02", "Get a quote", "We discuss a suitable vehicle, price and pickup time."], ["03", "Travel door to door", "Meet your driver at the agreed location and travel to your destination."]],
    formTitle: "Request a transfer quote",
    formLead: "Send the details by email or call; we will confirm the route, availability and price.",
    fields: { from: "From", to: "To", date: "Date and time", passengers: "Passengers", phone: "Contact phone" },
    fieldValues: { to: "Minsk", fromPlaceholder: "City, airport or address", passengers: "e.g. 3 adults and a child", phone: "+..." },
    submit: "Send an enquiry", call: "Call us", emailLabel: "Send an email", formNote: "The button opens a pre-filled message in your email app.",
    faqTitle: "Frequently asked questions",
    faqs: [
      ["How much does a private transfer cost?", "Prices depend on the date, pickup and drop-off points, vehicle and group size. We agree on the quote before your journey."],
      ["Do border checks affect the journey time?", "Yes. Any stated duration is an estimate. Checkpoint operation, queues and border regulations can change without notice."],
      ["Can you meet me at an airport?", "Airport pickups can be requested. Please share the airport, flight number and arrival time."],
      ["Can I request child seats or more luggage space?", "Yes, share children's ages and baggage details in advance so we can discuss a suitable vehicle."],
    ],
    otherTitle: "Other routes to Minsk",
    footerText: "Private transfers between Belarus and European cities. Operating since 2015.",
    license: "Transport provider: Murashko Andrey Antonovich · licence No. 02190/1-85358 · UNP 193255422",
    rights: "All rights reserved.",
  },
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


const geoPlaces = [
  ...geoAirports.map(place => ({ ...place, type: "airport" })),
  ...geoCities.map(place => ({ ...place, type: "city" }))
];
const geoIds = new Map(geoPlaces.map(place => [place.id, place]));
// All location pages are discoverable in the booking selector too.
for (const place of geoPlaces) {
  if (!locationCatalog.some(other => other.id === place.id)) {
    locationCatalog.push({ id: place.id, type: place.type, names: place.names });
  }
}
for (const lang of Object.keys(locale)) {
  const ui = locationLabels[lang];
  if (!ui) continue;
  ui.fromCities = {
    en: "Cities in Europe", ru: "Города Европы", pl: "Miasta Europy",
    lt: "Europos miestai", lv: "Eiropas pilsētas",
    de: "Städte Europas", fr: "Villes européennes"
  }[lang];
  ui.fromAirports = {
    en: "European airports", ru: "Аэропорты Европы", pl: "Lotniska Europy",
    lt: "Europos oro uostai", lv: "Eiropas lidostas",
    de: "Europäische Flughäfen", fr: "Aéroports européens"
  }[lang];
}
const geoIndexPaths = {
  en: { airport: "airport-transfers", city: "city-transfers" },
  ru: { airport: "transfery-iz-aeroportov", city: "transfery-iz-gorodov" },
  pl: { airport: "transfery-z-lotnisk", city: "transfery-z-miast" },
  lt: { airport: "oro-uostu-pervezimai", city: "miestu-pervezimai" },
  lv: { airport: "lidostu-transferi", city: "pilsetu-transferi" },
  de: { airport: "flughafen-transfers", city: "staedte-transfers" },
  fr: { airport: "transferts-aeroports", city: "transferts-villes" }
};
const geoSlugs = {
  en: { airport: "airport", city: "private-transfer" },
  ru: { airport: "aeroport", city: "taksi" },
  pl: { airport: "lotnisko", city: "transfer" },
  lt: { airport: "oro-uostas", city: "pervezimas" },
  lv: { airport: "lidosta", city: "transfers" },
  de: { airport: "flughafen", city: "privattransfer" },
  fr: { airport: "aeroport", city: "transfert-prive" }
};

const destinationLookup = new Map(belarusDestinations.map(dest=>[dest.id,dest]));
const destinationIndexSlugs = {
  en: "belarus-destinations",
  ru: "goroda-belarusi",
  pl: "miasta-bialorusi",
  lt: "baltarusijos-miestai",
  lv: "baltkrievijas-galamerki",
  de: "ziele-in-belarus",
  fr: "destinations-bielorussie"
};
const destinationRoutePrefixes = {
  en:"transfers",ru:"transfery",pl:"transfery",
  lt:"pervezimai",lv:"transferi",de:"privattransfers",fr:"transferts"
};
const featuredOriginIds = [
  "warsaw","waw","wmi","bialystok","suwalki",
  "vilnius","vno","kaunas","kun",
  "riga","rix","daugavpils",
  "berlin","ber","paris","cdg","ory"
];
const coreOriginCountries = { warsaw:"PL",vilnius:"LT",riga:"LV" };
const coreOriginProfiles = Object.keys(coreOriginCountries).map(id=>({
  id,type:"city",country:coreOriginCountries[id],parent:id,
  names:Object.fromEntries(["en","ru","pl","lt","lv","de","fr"].map(lang=>[lang,(locale[lang]||additionalLocales[lang].site).fromNames[id]])),
  pickup:Object.fromEntries(["en","ru","pl","lt","lv","de","fr"].map(lang=>[lang,(routeExtras[lang]||additionalLocales[lang].extras)[id].pickupContext]))
}));
const featuredOrigins = featuredOriginIds.map(id=>{
  const place=coreOriginProfiles.find(p=>p.id===id)||geoIds.get(id);
  if(!place)throw new Error("Missing featured transfer origin "+id);
  return place;
});
for(const dest of belarusDestinations){
  const entry=locationCatalog.find(x=>x.id===dest.id);
  if(entry)Object.assign(entry.names,dest.names);
}
const destinationIndexPath = lang=>`/${lang}/${destinationIndexSlugs[lang]}/`;
const destinationPath = (lang,dest)=>`${destinationIndexPath(lang)}${typeof dest==="string"?dest:dest.id}/`;
function transferPairPath(lang,origin,dest){
  const a=typeof origin==="string"?origin:origin.id;
  const b=typeof dest==="string"?dest:dest.id;
  return `/${lang}/${destinationRoutePrefixes[lang]}/${a}-${b}/`;
}
function destinationAlternates(dest){
  return [...Object.keys(locale).map(lang=>`<link rel="alternate" hreflang="${lang}" href="${base}${destinationPath(lang,dest)}">`),
    `<link rel="alternate" hreflang="x-default" href="${base}${destinationPath("en",dest)}">`].join("\n");
}
function destinationIndexAlternates(){
  return [...Object.keys(locale).map(lang=>`<link rel="alternate" hreflang="${lang}" href="${base}${destinationIndexPath(lang)}">`),
    `<link rel="alternate" hreflang="x-default" href="${base}${destinationIndexPath("en")}">`].join("\n");
}
function pairAlternates(origin,dest){
  return [...Object.keys(locale).map(lang=>`<link rel="alternate" hreflang="${lang}" href="${base}${transferPairPath(lang,origin,dest)}">`),
    `<link rel="alternate" hreflang="x-default" href="${base}${transferPairPath("en",origin,dest)}">`].join("\n");
}
const localeWords=(text,values)=>String(text).replace(/\{(from|to|dest)\}/g,(_,key)=>values[key]||"");

function geoPath(lang, place) {
  const item = typeof place === "string" ? geoIds.get(place) : place;
  if (!item) throw new Error("Unknown location");
  return `/${lang}/${item.type === "airport"
    ? `${geoSlugs[lang].airport}-${item.id}-minsk`
    : `${item.id}-minsk-${geoSlugs[lang].city}`}/`;
}
function geoIndexPath(lang, type) { return `/${lang}/${geoIndexPaths[lang][type]}/`; }
function geoAlternateLinks(place) {
  const links = Object.keys(locale).map(lang =>
    `<link rel="alternate" hreflang="${lang}" href="${base}${geoPath(lang,place)}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${base}${geoPath("en",place)}">`);
  return links.join("\n");
}
function geoIndexAlternates(type) {
  return [...Object.keys(locale).map(lang=>`<link rel="alternate" hreflang="${lang}" href="${base}${geoIndexPath(lang,type)}">`),
    `<link rel="alternate" hreflang="x-default" href="${base}${geoIndexPath("en",type)}">`].join("\n");
}
function geoMenu(lang, type, place) {
  return Object.entries(locale).map(([code,l]) => {
    const href = type === "geo-index" ? geoIndexPath(code,place) : geoPath(code,place);
    return `<a href="${href}" hreflang="${code}" lang="${code}"${code===lang?' aria-current="page"':""}>${l.label}</a>`;
  }).join("");
}

function routePath(lang, key) { return `/${lang}/${locale[lang].slugs[key]}/`; }

function alternateLinks(pathType, routeKey) {
  const links = Object.keys(locale).map(lang => {
    const href = pathType === "home" ? `${base}/${lang}/` : `${base}${routePath(lang, routeKey)}`;
    return `<link rel="alternate" hreflang="${lang}" href="${href}">`;
  });
  links.push(`<link rel="alternate" hreflang="x-default" href="${pathType === "home" ? `${base}/` : `${base}${routePath("en", routeKey)}`}">`);
  return links.join("\n    ");
}

function languageMenu(lang, type, routeKey) {
  return Object.entries(locale).map(([code, l]) => {
    const href = type === "home" ? l.home
      : type === "geo" ? geoPath(code,routeKey)
      : type === "geo-index" ? geoIndexPath(code,routeKey)
      : type === "destination-index" ? destinationIndexPath(code)
      : type === "destination" ? destinationPath(code,routeKey)
      : type === "pair" ? transferPairPath(code,routeKey.origin,routeKey.dest)
      : routePath(code,routeKey);
    return `<a href="${href}" hreflang="${code}" lang="${code}"${code === lang ? ' aria-current="page"' : ""}>${l.label}</a>`;
  }).join("");
}

function header(lang, type = "home", routeKey) {
  const l = locale[lang];
  const menuLabel = { en: "Menu", ru: "Меню", pl: "Menu", lt: "Meniu", lv: "Izvēlne", de: "Menü", fr: "Menu" }[lang];
  return `<header class="site-header">
    <a class="brand" href="${l.home}" aria-label="Comfortline">
      <img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56">
    </a>
    <nav class="main-nav" aria-label="${esc(l.nav.routes)}">
      <a href="${l.home}#routes">${l.nav.routes}</a><a href="#service">${l.nav.service}</a><a href="#faq">${l.nav.faq}</a><a href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${l.nav.contact}</a>
    </nav>
    <details class="mobile-nav"><summary aria-label="${esc(menuLabel)}"><span class="mobile-nav-icon" aria-hidden="true">☰</span><span>${esc(menuLabel)}</span></summary><nav class="mobile-nav-links" aria-label="${esc(menuLabel)}"><a href="${l.home}#routes">${esc(l.nav.routes)}</a><a href="#service">${esc(l.nav.service)}</a><a href="#faq">${esc(l.nav.faq)}</a><a href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${esc(l.nav.contact)}</a></nav></details>
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


const socialChannels = [
  { id: "whatsapp", label: "WhatsApp", url: "https://wa.me/375291552776" },
  { id: "viber", label: "Viber", url: "viber://chat?number=%2B375291552776" },
  { id: "telegram", label: "Telegram", url: "https://t.me/transfer_comfortline" },
  { id: "instagram", label: "Instagram", url: "https://www.instagram.com/transfer_comfortline/" },
  { id: "messenger", label: "Facebook Messenger", url: "https://m.me/103816619260365" },
  { id: "threads", label: "Threads", url: "https://www.threads.com/@transferwarsaw_taxi" },
];

function socialLink(channel, context) {
  const target = channel.url.startsWith("https://") ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a class="social-link ${context} social-${channel.id}" href="${channel.url}"${target} aria-label="ComfortLine on ${channel.label}" title="${channel.label}" data-name="${channel.label}"><img src="/assets/social/${channel.id}.svg" alt="" aria-hidden="true" width="23" height="23"><span class="social-label">${channel.label}</span></a>`;
}

function messengerButtons() {
  return `<div class="messenger-contact" aria-label="ComfortLine social and messaging channels"><strong class="messenger-heading">ComfortLine · Social</strong><div class="messenger-buttons">${socialChannels.map(channel => socialLink(channel, "social-inline")).join("")}</div></div>`;
}

const bookingLabels = {
  en: {
    from: "From", to: "To", date: "Trip date & time", passengers: "Passengers", car: "Vehicle class",
    quickButton: "Book a transfer", detailTitle: "Your transfer details",
    departure: "Pickup city or airport", pickupAddress: "Exact pickup address", dropAddress: "Address in Minsk",
    flight: "Flight number (if airport pickup)", luggage: "Suitcases", seats: "Child seats",
    name: "Your name", phone: "Contact phone", email: "Email (optional)", notes: "Additional requests",
    sedan: "Sedan", minivan: "Minivan / minibus", premium: "Premium",
    whatsapp: "Send via WhatsApp",
    submit: "Send booking enquiry", info: "Choose email or WhatsApp to open a pre-filled enquiry. Please send it; a booking is confirmed only after our manager replies.",
    airport: { vno: "Vilnius Airport (VNO)", waw: "Warsaw Chopin Airport (WAW)", wmi: "Warsaw Modlin Airport (WMI)", rix: "Riga Airport (RIX)" }
  },
  ru: {
    from: "Откуда", to: "Куда", date: "Дата и время поездки", passengers: "Пассажиры", car: "Класс автомобиля",
    quickButton: "Заказать трансфер", detailTitle: "Детали поездки",
    departure: "Город или аэропорт подачи", pickupAddress: "Точный адрес подачи", dropAddress: "Адрес в Минске",
    flight: "Номер рейса (если аэропорт)", luggage: "Чемоданы", seats: "Детские кресла",
    name: "Ваше имя", phone: "Телефон для связи", email: "Email (необязательно)", notes: "Пожелания к поездке",
    sedan: "Седан", minivan: "Минивэн / микроавтобус", premium: "Премиум",
    whatsapp: "Отправить в WhatsApp",
    submit: "Отправить заявку", info: "Выберите email или WhatsApp, чтобы подготовить заявку. Отправьте сообщение; бронирование подтверждает менеджер после ответа.",
    airport: { vno: "Аэропорт Вильнюса (VNO)", waw: "Варшава Шопен (WAW)", wmi: "Варшава Модлин (WMI)", rix: "Аэропорт Риги (RIX)" }
  },
  pl: {
    from: "Skąd", to: "Dokąd", date: "Data i godzina", passengers: "Pasażerowie", car: "Klasa samochodu",
    quickButton: "Zamów transfer", detailTitle: "Szczegóły przejazdu",
    departure: "Miasto lub lotnisko odbioru", pickupAddress: "Dokładny adres odbioru", dropAddress: "Adres w Mińsku",
    flight: "Numer lotu (odbiór z lotniska)", luggage: "Walizki", seats: "Foteliki dziecięce",
    name: "Imię i nazwisko", phone: "Telefon kontaktowy", email: "Email (opcjonalnie)", notes: "Dodatkowe uwagi",
    sedan: "Sedan", minivan: "Minivan / bus", premium: "Premium",
    whatsapp: "Wyślij przez WhatsApp",
    submit: "Wyślij zapytanie", info: "Wybierz e-mail lub WhatsApp, aby przygotować zapytanie. Wyślij wiadomość; rezerwację potwierdzi nasz koordynator.",
    airport: { vno: "Lotnisko Wilno (VNO)", waw: "Warszawa Chopin (WAW)", wmi: "Warszawa Modlin (WMI)", rix: "Lotnisko Ryga (RIX)" }
  },
  lt: {
    from: "Iš kur", to: "Į kur", date: "Kelionės data ir laikas", passengers: "Keleiviai", car: "Automobilio klasė",
    quickButton: "Užsakyti pervežimą", detailTitle: "Kelionės duomenys",
    departure: "Paėmimo miestas ar oro uostas", pickupAddress: "Tikslus paėmimo adresas", dropAddress: "Adresas Minske",
    flight: "Skrydžio numeris (oro uostui)", luggage: "Lagaminai", seats: "Vaikiškos kėdutės",
    name: "Jūsų vardas", phone: "Kontaktinis telefonas", email: "El. paštas (nebūtina)", notes: "Papildomi pageidavimai",
    sedan: "Sedanas", minivan: "Minivenas / mikroautobusas", premium: "Premium",
    whatsapp: "Siųsti per WhatsApp",
    submit: "Siųsti užklausą", info: "Pasirinkite el. paštą arba WhatsApp paruoštai užklausai atidaryti. Išsiųskite ją; užsakymą patvirtina vadybininkas.",
    airport: { vno: "Vilniaus oro uostas (VNO)", waw: "Varšuvos Šopeno oro uostas (WAW)", wmi: "Varšuvos Modlino oro uostas (WMI)", rix: "Rygos oro uostas (RIX)" }
  },
  lv: {
    from: "No kurienes", to: "Uz kurieni", date: "Brauciena datums un laiks", passengers: "Pasažieri", car: "Auto klase",
    quickButton: "Pasūtīt transfēru", detailTitle: "Brauciena informācija",
    departure: "Saņemšanas pilsēta vai lidosta", pickupAddress: "Precīza saņemšanas adrese", dropAddress: "Adrese Minskā",
    flight: "Reisa numurs (lidostai)", luggage: "Koferi", seats: "Bērnu sēdeklīši",
    name: "Jūsu vārds", phone: "Kontakttālrunis", email: "E-pasts (nav obligāts)", notes: "Papildu vēlmes",
    sedan: "Sedans", minivan: "Minivens / mikroautobuss", premium: "Premium",
    whatsapp: "Sūtīt ar WhatsApp",
    submit: "Nosūtīt pieprasījumu", info: "Izvēlieties e-pastu vai WhatsApp, lai atvērtu sagatavotu pieprasījumu. Nosūtiet ziņu; rezervāciju apstiprina koordinators.",
    airport: { vno: "Viļņas lidosta (VNO)", waw: "Varšavas Šopēna lidosta (WAW)", wmi: "Varšavas Modlinas lidosta (WMI)", rix: "Rīgas lidosta (RIX)" }
  }
};

for (const lang of ["de", "fr"]) {
  const translations = additionalLocales[lang];
  locale[lang] = { ...translations.site,
    routeTitle: key => translations.seo[key].h1
  };
  bookingLabels[lang] = translations.booking;
  bookingPopupUi[lang] = translations.popup;
  locationLabels[lang] = translations.location;
  routeSeo[lang] = translations.seo;
  routeExtras[lang] = translations.extras;
  airportHubLinks[lang] = translations.airportHub;
  bookingTrustContent[lang] = translations.trust;
  fleetCopy[lang] = translations.fleet;
  reverseJourneyCopy[lang] = translations.reverse;
}
// City and airport names remain searchable in their original spelling as well.
for (const place of locationCatalog) {
  place.names.de ??= place.names.en;
  place.names.fr ??= place.names.en;
  if (place.id === "minsk") place.names.fr = "Minsk";
}

function locationField(lang, field, scope, initialValue) {
  const id = `${scope}-${field}-${lang}`;
  const labels = locationLabels[lang];
  const inputLabel = field === "fromPreset" ? bookingLabels[lang].from : bookingLabels[lang].to;
  return `<div class="location-control" data-location-picker>
    <input id="${id}" type="text" name="${field}" value="${esc(initialValue)}" placeholder="${esc(labels.type)}" autocomplete="off" readonly required aria-haspopup="dialog" aria-controls="destination-dialog">
    <button type="button" class="location-open" aria-label="${esc(labels.show)}: ${esc(inputLabel)}" aria-haspopup="dialog" aria-controls="destination-dialog"><span aria-hidden="true">⌄</span></button>
  </div>`;
}

function destinationPopup(lang) {
  const ui = locationLabels[lang];
  const euIds = [...new Set(["vilnius","vno","warsaw","waw","riga","rix","kaunas","kun","wmi","bialystok","suwalki","lublin","klaipeda","krakow","gdansk","daugavpils","jurmala",...geoPlaces.map(place=>place.id)])];
  const byIds = ["minsk","msq","grodno","brest","lida","vitebsk","gomel","mogilev","baranovichi","pinsk"];
  const euSet = new Set(euIds), bySet = new Set(byIds);
  const entries = (ids) => ids.map(id => locationCatalog.find(item => item.id === id)).filter(Boolean);
  const choice = (item, featured = false) => {
    const value = item.names[lang];
    const search = [item.id, ...Object.values(item.names)].join(" ");
    return `<button type="button" class="destination-option${featured ? " destination-featured" : ""}" data-value="${esc(value)}" data-search="${esc(search)}">
      <span class="destination-pin" aria-hidden="true">${item.type === "airport" ? "✈" : "⌖"}</span><span class="destination-choice-name">${esc(value)}</span><span class="destination-option-arrow" aria-hidden="true">↗</span>
    </button>`;
  };
  const group = (mode, kind, heading, items, grid = false) =>
    `<section class="destination-group${grid ? " destination-featured-group" : ""}" data-location-mode="${mode}" data-destination-group="${kind}">
      <h3>${esc(heading)}</h3><div class="${grid ? "destination-featured-grid" : "destination-regular-list"}">${items.map(item => choice(item, grid)).join("")}</div>
    </section>`;
  const from = [
    group("from","popular",ui.fromPopular,entries(["vilnius","vno","warsaw","waw","riga","rix"]),true),
    group("from","cities",ui.fromCities,euIds.map(id => locationCatalog.find(x=>x.id===id)).filter(item=>item?.type==="city")),
    group("from","airports",ui.fromAirports,euIds.map(id => locationCatalog.find(x=>x.id===id)).filter(item=>item?.type==="airport"))
  ].join("");
  const to = [
    group("to","popular",ui.toPopular,entries(["minsk","msq","grodno","brest","lida","vitebsk"]),true),
    group("to","cities",ui.toCities,byIds.map(id => locationCatalog.find(x=>x.id===id)).filter(item=>item?.type==="city")),
    group("to","airports",ui.toAirports,byIds.map(id => locationCatalog.find(x=>x.id===id)).filter(item=>item?.type==="airport"))
  ].join("");
  return `<dialog class="destination-dialog" id="destination-dialog" aria-labelledby="destination-dialog-title">
    <div class="destination-dialog-body">
      <div class="destination-dialog-top"><div><span class="eyebrow">ComfortLine</span><h2 id="destination-dialog-title">${esc(ui.fromPopular)}</h2><p class="destination-dialog-hint">${esc(ui.destinationHint)}</p></div>
        <button type="button" class="destination-close" data-close-destination aria-label="${esc(bookingPopupUi[lang].close)}">×</button></div>
      <div class="destination-search-box"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
        <input type="search" class="destination-search" placeholder="${esc(ui.search)}" aria-label="${esc(ui.search)}" autocomplete="off" enterkeyhint="done"></div>
      <div class="destination-list">${from}${to}<p class="destination-empty" hidden>${esc(ui.empty)}</p></div>
      <button type="button" class="destination-custom" data-custom-destination hidden>${esc(ui.custom)} <span aria-hidden="true">↗</span></button>
    </div>
  </dialog>`;
}

function locationFormField(lang, field, scope, initialValue, className = "") {
  const id = `${scope}-${field}-${lang}`;
  const label = field === "fromPreset" ? bookingLabels[lang].from : bookingLabels[lang].to;
  return `<div class="location-form-field ${className}"><label for="${id}">${esc(label)}</label>${locationField(lang, field, scope, initialValue)}</div>`;
}

function carOptions(lang) {
  const l = bookingLabels[lang];
  return `<option value="sedan">${esc(l.sedan)}</option><option value="minivan">${esc(l.minivan)}</option><option value="premium">${esc(l.premium)}</option>`;
}

function passengerPicker(lang, scope) {
  const ui = bookingLabels[lang], words = bookingPopupUi[lang].passengerPicker;
  const id = `passenger-panel-${scope}-${lang}`;
  const counters = [
    ["adults", words.adults, 1],
    ["children", words.children, 0],
    ["infants", words.infants, 0],
    ["pets", words.pets, 0],
    ["luggage", words.suitcases, 1]
  ];
  const rows = counters.map(([name, label, defaultCount]) => `<div class="passenger-count-row" data-count-row="${name}">
    <span class="passenger-count-label">${esc(label)}</span>
    <div class="passenger-counter">
      <button type="button" data-step="-1" data-field="${name}" aria-label="${esc(label)} −">−</button>
      <output data-count-output="${name}">${defaultCount}</output>
      <button type="button" data-step="1" data-field="${name}" aria-label="${esc(label)} +">+</button>
    </div>
  </div>`).join("");
  const classes = ["any", "comfort", "business", "premium"];
  const options = classes.map((value, index) => `<button type="button" data-vehicle-class="${value}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(words[value])}</button>`).join("");
  return `<div class="passenger-field" data-passenger-picker data-language="${lang}"
      data-passenger-one="${esc(words.passengerOne)}" data-passenger-many="${esc(words.passengerMany)}"
      data-max-warning="${esc(words.maxWarning)}">
    <span class="passenger-label">${esc(ui.passengers)}, ${esc(ui.car)}</span>
    <button type="button" class="passenger-toggle" aria-expanded="false" aria-controls="${id}" aria-label="${esc(words.open)}">
      <span data-passenger-summary>1 ${esc(words.passengerOne)} · ${esc(words.any)}</span>
      <span class="passenger-chevron" aria-hidden="true">⌄</span>
    </button>
    <div class="passenger-panel" id="${id}" hidden>
      <div class="passenger-counters">${rows}</div>
      <fieldset class="passenger-class">
        <legend>${esc(words.classTitle)}</legend>
        <div class="passenger-class-grid">${options}</div>
      </fieldset>
      <p class="passenger-limit-warning" role="status" hidden>${esc(words.maxWarning)}</p>
      <button type="button" class="passenger-apply" data-apply-passengers>${esc(words.apply)}</button>
    </div>
    <input type="hidden" name="passengers" value="1">
    <input type="hidden" name="adults" value="1">
    <input type="hidden" name="children" value="0">
    <input type="hidden" name="infants" value="0">
    <input type="hidden" name="pets" value="0">
    <input type="hidden" name="luggage" value="1">
    <input type="hidden" name="carClass" value="any">
  </div>`;
}

function quickBooking(lang, routeKey = "vilnius", originOverride = null, destinationOverride = null) {
  const l = locale[lang], ui = bookingLabels[lang];
  return `<form class="quick-booking" data-lang="${lang}" action="#booking-dialog">
    ${locationFormField(lang, "fromPreset", "quick", originOverride !== null ? originOverride : l.fromNames[routeKey], "quick-from")}
    ${locationFormField(lang, "to", "quick", destinationOverride !== null ? destinationOverride : l.fieldValues.to, "quick-to")}
    <button type="submit" class="quick-submit">${esc(ui.quickButton)} <span aria-hidden="true">↗</span></button>
  </form>`;
}

function bookingForm(lang, routeKey = "vilnius", originOverride = null, destinationOverride = null) {
  const l = locale[lang], ui = bookingLabels[lang], popup = bookingPopupUi[lang];
  return `<dialog class="booking-dialog" id="booking-dialog" aria-labelledby="booking-dialog-title">
    <div class="booking-dialog-shell">
      <div class="booking-dialog-header"><div><span class="eyebrow">${esc(popup.help)}</span>
        <h2 id="booking-dialog-title">${esc(popup.header)}</h2><p>${esc(popup.subtitle)}</p></div>
        <button type="button" class="booking-dialog-close" data-close-booking aria-label="${esc(popup.close)}"><span aria-hidden="true">×</span></button>
      </div>
      <form class="booking-form" data-lang="${lang}" data-email="${email}" data-sending="${esc(popup.sending)}" data-send-error="${esc(popup.sendError)}" data-storage-success="${esc(popup.storageSuccess)}" data-invalid-phone="${esc(popup.invalidPhone)}" data-invalid-route="${esc(popup.invalidRoute)}" data-invalid-form="${esc(popup.invalidForm)}" data-rate-limited="${esc(popup.rateLimited)}" data-service-unavailable="${esc(popup.serviceUnavailable)}" data-network-error="${esc(popup.networkError)}" data-capacity-error="${esc(fleetCopy[lang].capacityError)}" action="/api/booking" method="post">
        ${locationFormField(lang, "fromPreset", "details", originOverride !== null ? originOverride : l.fromNames[routeKey])}
        ${locationFormField(lang, "to", "details", destinationOverride !== null ? destinationOverride : l.fieldValues.to)}
        <label><span>${esc(ui.pickupAddress)}</span><input name="pickupAddress" placeholder="${esc(l.fieldValues.fromPlaceholder)}"></label>
        <label><span>${esc(ui.dropAddress)}</span><input name="dropAddress" placeholder="${esc(l.fieldValues.to)}"></label>
        <label><span>${esc(ui.date)}</span><input type="datetime-local" name="date" required></label>
        ${passengerPicker(lang, "details")}
        <label class="vehicle-model-field full"><span>${esc(fleetCopy[lang].choiceLabel)}</span>
          <select name="vehicleModel" aria-describedby="vehicle-choice-note">
            <option value="">${esc(fleetCopy[lang].placeholder)}</option>
            ${fleetCatalog.map(car => `<option value="${car.id}" data-seats="${car.seats}">${esc(car.name)} · ${car.seats} ${esc(fleetCopy[lang].seats)}</option>`).join("")}
          </select>
          <small id="vehicle-choice-note">${esc(fleetCopy[lang].choiceNote)}</small>
        </label>
        <label><span>${esc(ui.seats)}</span><input type="number" min="0" max="8" name="childSeats" value="0"></label>
        <label><span>${esc(ui.flight)}</span><input name="flight" placeholder="VNO / WAW / WMI / RIX"></label>
        <label><span>${esc(ui.name)}</span><input name="customerName" autocomplete="name" required></label>
        <label><span>${esc(ui.phone)}</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel" maxlength="50" placeholder="${esc(l.fieldValues.phone)}" required></label>
        <label class="full"><span>${esc(ui.email)}</span><input type="email" name="customerEmail" autocomplete="email"></label>
        <label class="full"><span>${esc(ui.notes)}</span><textarea name="notes" rows="3"></textarea></label>
        <div class="booking-spam-trap" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <button type="submit" class="booking-prepare">${esc(ui.submit)} ${icons.arrow}</button>
        <p class="booking-status" role="status" aria-live="polite" hidden></p>
        <small class="booking-explanation">${esc(popup.formNotice)}</small>
      </form>
    </div>
  </dialog>`;
}

function faq(l) {
  return `<section class="section faq-section" id="faq"><div class="section-head"><span class="eyebrow">FAQ</span><h2>${esc(l.faqTitle)}</h2></div><div class="faq-list">${l.faqs.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join("")}</div></section>`;
}

function footer(l) {
  return `<footer id="operator-info"><div class="footer-grid"><div><a class="brand footer-brand" href="${l.home}"><img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56"></a><p>${esc(l.footerText)}</p></div><div><strong>${esc(l.nav.contact)}</strong><a href="tel:${phoneHref}">${phoneDisplay}</a><a href="mailto:${email}">${email}</a><a href="https://comfortline.by" rel="noopener">comfortline.by</a></div><div><strong>${esc(l.nav.routes)}</strong>${Object.keys(routes).map(key => `<a href="${routePath(l.code, key)}">${esc(l.routeNames[key])}</a>`).join("")}<a href="${geoIndexPath(l.code,"airport")}">${esc(geoLocale[l.code].browseAirports)}</a><a href="${geoIndexPath(l.code,"city")}">${esc(geoLocale[l.code].browseCities)}</a><a href="${destinationIndexPath(l.code)}">${esc(destinationLocale[l.code].browse)}</a></div></div><div class="legal"><span>${esc(l.license)}</span><span>© 2026 ComfortLine. ${esc(l.rights)}</span></div></footer>`;
}

function floatingContact() {
  return `<nav class="floating-social" aria-label="ComfortLine messaging and social profiles">${socialChannels.map(channel => socialLink(channel, "social-floating")).join("")}</nav>`;
}

function layout({ lang, title, description, canonical, alternates, body, schema, routeKey = "vilnius", originOverride = null, destinationOverride = null }) {
  const l = locale[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="website"><meta property="og:site_name" content="byComfortLine"><meta property="og:locale" content="${esc(l.locale)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}/assets/comfortline-transfer-van.webp"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${canonical}">${alternates}<meta name="theme-color" content="#081a2d"><link rel="preload" as="image" href="/assets/comfortline-transfer-van.webp" fetchpriority="high"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/style.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script><script src="/assets/app.js" defer></script></head><body>${body}${bookingForm(lang, routeKey, originOverride, destinationOverride)}${destinationPopup(lang)}${floatingContact()}</body></html>`;
}

function businessSchema(lang, url) {
  const l = locale[lang];
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "@id": base + "/#business",
    name: "ComfortLine",
    alternateName: "byComfortLine",
    url: base + "/",
    telephone: phoneHref,
    email,
    foundingDate: "2015",
    areaServed: ["Belarus", "Lithuania", "Poland", "Latvia"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Фёдорова, 19-10",
      addressLocality: "Минск",
      addressCountry: "BY"
    },
    sameAs: [
      "https://www.instagram.com/transfer_comfortline/",
      "https://t.me/transfer_comfortline",
      "https://m.me/103816619260365",
      "https://www.threads.com/@transferwarsaw_taxi"
    ],
    slogan: l.footerText
  };
}

function hubPage(lang) {
  const l = locale[lang];
  const canonical = `${base}/${lang}/`;
  const title = `${l.hubTitle} | ComfortLine`;
  const body = `${header(lang)}<main>
    <section class="hero hero-home"><div class="hero-overlay"></div><div class="hero-content"><span class="eyebrow light">${esc(l.kicker)}</span><h1>${esc(l.hubTitle)}</h1><p>${esc(l.hubDescription)}</p><div class="hero-actions"><a class="button primary" href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${esc(l.formTitle)} ${icons.arrow}</a><a class="button ghost" href="tel:${phoneHref}">${icons.phone}${phoneDisplay}</a></div>${quickBooking(lang)}</div><div class="route-orbit" aria-hidden="true"><span>VNO</span><i></i><b>MSQ</b><i></i><span>WAW</span><i></i><span>RIX</span></div></section>
    ${trustStrip(l)}
    <section class="section routes-section" id="routes"><div class="section-head"><span class="eyebrow">Comfortline routes</span><h2>${esc(l.routesTitle)}</h2><p>${esc(l.routesLead)}</p></div><div class="route-grid three">${routeCards(lang)}</div></section>
    ${airportRouteLinks(lang)}
    ${geoHubDirectoryLinks(lang)}
    ${destinationCardList(lang)}
    ${fleetShowcase(lang)}
    <section class="service-section" id="service"><div class="service-intro"><span class="eyebrow light">Door to door</span><h2>${esc(l.serviceTitle)}</h2></div><div class="service-grid">${l.services.map(([h, p], i) => `<article><span>0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    <section class="section steps-section"><div class="section-head"><span class="eyebrow">3 steps</span><h2>${esc(l.stepsTitle)}</h2></div><div class="steps">${l.steps.map(([n, h, p]) => `<article><span>${n}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    ${homeBookingTransparency(lang)}
    ${faq(l)}</main>${footer(l)}`;
  return layout({ lang, title, description: l.hubDescription, canonical, alternates: alternateLinks("home"), body, schema: businessSchema(lang, canonical) });
}



function airportRouteLinks(lang) {
  const content = airportHubLinks[lang];
  return `<section class="section airport-links-section" id="airport-transfers">
    <div class="section-head"><span class="eyebrow">VNO · WAW · WMI · RIX</span><h2>${esc(content.heading)}</h2><p>${esc(content.intro)}</p></div>
    <div class="airport-links-grid">${content.items.map(([key,title,text],i) =>
      `<article class="airport-link-card"><span class="airport-link-icon" aria-hidden="true">✈</span><h3><a href="${geoPath(lang,["vno","waw","wmi","rix"][i])}">${esc(title)} ↗</a></h3><p>${esc(text)}</p></article>`
    ).join("")}</div>
  </section>`;
}


function homeBookingTransparency(lang) {
  const d = bookingTrustContent[lang];
  return `<section class="section booking-confidence-home" id="booking-guide">
    <span class="eyebrow">${esc(d.kicker)}</span>
    <h2>${esc(d.hubTitle)}</h2>
    <p>${esc(d.hubText)}</p>
    <div class="booking-confidence-home-contact">
      <a href="tel:${phoneHref}" class="booking-confidence-link">${icons.phone}${phoneDisplay}</a>
      <a href="mailto:${email}" class="booking-confidence-link">${esc(email)} ↗</a>
    </div>
  </section>`;
}

function routeBookingTransparency(lang,key) {
  const copy = bookingTrustContent[lang], references = routeOfficialSources[key];
  const quoteRows = copy.quoteItems.map(([heading,detail]) =>
    `<li class="booking-price-item"><strong>${esc(heading)}</strong><span>${esc(detail)}</span></li>`).join("");
  const steps = copy.process.map(([number,title,description]) =>
    `<li class="booking-process-step"><span aria-hidden="true">${esc(number)}</span>
      <div><h3>${esc(title)}</h3><p>${esc(description)}</p></div></li>`).join("");
  const official = references.map(([name,url]) =>
    `<li><a href="${esc(url)}" rel="noopener noreferrer">${esc(name)} ↗</a></li>`).join("");
  const checklist = copy.safetyChecklist.map(line=>`<li>${esc(line)}</li>`).join("");
  return `<section class="booking-confidence section" id="booking-guide" aria-labelledby="booking-guide-title">
    <div class="section-head">
      <span class="eyebrow">${esc(copy.kicker)}</span>
      <h2 id="booking-guide-title">${esc(copy.title)}</h2>
      <p>${esc(copy.intro)}</p>
    </div>
    <div class="booking-confidence-layout">
      <article class="booking-confidence-card booking-quote-clarity">
        <h3>${esc(copy.quoteHeading)}</h3>
        <p>${esc(copy.quoteIntro)}</p>
        <ul class="booking-price-list">${quoteRows}</ul>
      </article>
      <article class="booking-confidence-card booking-process-clarity">
        <h3>${esc(copy.processHeading)}</h3>
        <ol class="booking-process-list">${steps}</ol>
      </article>
    </div>
    <aside class="booking-border-guidance">
      <div><h3>${esc(copy.safetyHeading)}</h3><p>${esc(copy.safetyLead)}</p>
        <ul class="booking-border-checklist">${checklist}</ul></div>
      <div class="booking-official-sources">
        <strong>${esc(copy.sourceName)}</strong>
        <ul>${official}</ul>
      </div>
    </aside>
    <aside class="booking-operator-identity">
      <div>
        <h3>${esc(copy.identityHeading)}</h3>
        <p>${esc(copy.identityText)}</p>
        <p class="booking-operator-legal">${esc(locale[lang].license)}</p>
        <a class="booking-license-source" href="https://license.gov.by/onelicense/157966" rel="noopener noreferrer">${esc(copy.registryLabel)} ↗</a>
        <small>${esc(copy.licensingNote)}</small>
      </div>
      <div class="booking-operator-contact">
        <a href="tel:${phoneHref}">${icons.phone} ${phoneDisplay}</a>
        <a href="mailto:${email}">${esc(email)}</a>
      </div>
    </aside>
  </section>`;
}


function fleetShowcase(lang) {
  const ui = fleetCopy[lang];
  const cards = fleetCatalog.map(car => {
    const label = ui.descriptions[car.id];
    return `<article class="fleet-show-card" data-fleet-model="${esc(car.id)}">
      <div class="fleet-photo">
        <img src="${esc(car.image)}" loading="lazy" decoding="async"
          width="860" height="550" alt="${esc(car.name + " — " + label)}">
        <span class="fleet-photo-chip">${esc(ui.category[car.kind])}</span>
      </div>
      <div class="fleet-card-body">
        <h3>${esc(car.name)}</h3><p>${esc(label)}</p>
        <div class="fleet-capacity"><span>♙ ${car.seats} ${esc(ui.seats)}</span>
          <span>▣ ${car.bags} ${esc(ui.bags)}</span></div>
        <strong class="fleet-on-request">${esc(ui.price)}</strong>
        <div class="fleet-card-actions">
          <button type="button" class="fleet-select-button" data-request-model="${car.id}"
            data-request-class="${car.kind}" data-request-seats="${car.seats}">${esc(ui.choose)} ↗</button>
          <a href="${esc(car.detail)}" rel="noopener noreferrer" target="_blank">${esc(ui.showMore)} ↗</a>
        </div>
      </div>
    </article>`;
  }).join("");
  return `<section class="fleet-showcase section" id="fleet" aria-labelledby="fleet-heading">
    <div class="section-head">
      <span class="eyebrow">ComfortLine · Fleet</span>
      <h2 id="fleet-heading">${esc(ui.title)}</h2>
      <p>${esc(ui.lead)}</p>
    </div>
    <div class="fleet-show-grid">${cards}</div>
    <p class="fleet-photo-footnote">${esc(ui.photoNote)}</p>
  </section>`;
}


function returnTripInfo(lang,key) {
  const data = reverseJourneyCopy[lang];
  const link = reverseRoutePages[key];
  return `<aside class="return-trip-panel" id="return-transfer">
    <div class="return-trip-route"><span>${esc(destinationLabels[lang])}</span><span aria-hidden="true">→</span><span>${esc(locale[lang].fromNames[key])}</span></div>
    <div class="return-trip-main"><div>
      <h2>${esc(data.heading)}</h2>
      <p>${esc(data.intro)}</p>
      <p class="return-trip-detail">${esc(data.extras[key])}</p>
      <p class="return-trip-terms">${esc(data.terms)}</p>
    </div>
    <div class="return-trip-action">
      <strong>${esc(data.label)}</strong>
      <a href="${esc(link)}" rel="noopener noreferrer" target="_blank">${esc(data.view)} ↗</a>
    </div></div>
  </aside>`;
}

function routeScene(lang, key) {
  const scene = routeScenes[key];
  const note = scene.credit
    ? `<a href="${esc(scene.credit)}" target="_blank" rel="noopener noreferrer">${esc(scene.source)} ↗</a>`
    : `<span>${esc(scene.source)}</span>`;
  return `<figure class="route-local-scene">
    <img src="${esc(scene.src)}" width="1400" height="740" decoding="async" loading="lazy" alt="${esc(scene.alt[lang])}">
    <figcaption><span>${esc(scene.alt[lang])}</span>${note}</figcaption>
  </figure>`;
}

function routeIntentDetails(lang, key) {
  const copy = routeExtras[lang], extra = copy[key], ui = copy.ui;
  const city = locale[lang].fromNames[key];
  const pickupHeading = ui.pickupTitle.replace("{city}", city);
  const alternateRoutes = Object.keys(routes).filter(id => id !== key)
    .map(id => `<a href="${routePath(lang,id)}">${esc(locale[lang].routeNames[id])} ↗</a>`).join("");
  return `<div class="route-intent-guide">
    ${routeScene(lang,key)}
    <section class="route-intent-section" id="pickup-options">
      <div class="route-intent-copy">
        <h2>${esc(pickupHeading)}</h2><p>${esc(extra.pickupContext)}</p>
      </div>
      <ul class="route-pickup-chips">${extra.pickupPlaces.map(place => { const airport = ["vno","waw","wmi","rix"].find(id=>place.includes("("+id.toUpperCase()+")")); return `<li>${airport?`<a href="${geoPath(lang,airport)}">${esc(place)} ↗</a>`:esc(place)}</li>`; }).join("")}</ul>
    </section>
    <div class="route-intent-cards">
      <section class="route-intent-card">
        <h2>${esc(ui.vehicleTitle)}</h2><p>${esc(extra.vehicleContext)}</p>
      </section>
      <section class="route-intent-card">
        <h2>${esc(ui.quoteTitle)}</h2><p>${esc(extra.quoteContext)}</p>
      </section>
    </div>
    <section class="route-intent-arrival">
      <h2>${esc(ui.arrivalTitle)}</h2><p>${esc(extra.arrivalContext)}</p>
      <p class="route-intent-disclaimer">${esc(ui.notLocalTaxi)}</p>
      <a class="button primary route-intent-cta" href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${esc(ui.miniCta)} ${icons.arrow}</a>
    </section>
    <nav class="route-intent-related" aria-label="${esc(ui.otherLinks)}">
      <strong>${esc(ui.otherLinks)}</strong><div>${alternateRoutes}</div>
    </nav>
  </div>`;
}

function routeEditorial(lang, key) {
  const seo = routeSeo[lang][key], ui = routeSeo[lang].ui;
  return `<section class="route-editorial section" id="route-guide">
    <div class="section-head"><span class="eyebrow">${esc(ui.overview)}</span><h2>${esc(ui.overview)}: ${esc(locale[lang].routeNames[key])}</h2><p>${esc(seo.intro)}</p></div>
    <div class="route-editorial-grid">
      <article><span class="route-detail-symbol" aria-hidden="true">⌖</span><h3>${esc(ui.pickup)}</h3><p>${esc(seo.pickupText)}</p></article>
      <article id="airport-pickup"><span class="route-detail-symbol" aria-hidden="true">✈</span><h3>${esc(ui.airport)}</h3><p>${esc(seo.airportText)}</p></article>
      <article><span class="route-detail-symbol" aria-hidden="true">↗</span><h3>${esc(ui.planning)}</h3><p>${esc(seo.planningText)}</p></article>
    </div>
    <div class="route-checklist"><div><h3>${esc(ui.prepare)}</h3><ul>${ui.checklist.map(text => `<li>${esc(text)}</li>`).join("")}</ul></div><p>${esc(ui.border)}</p></div>
    ${routeIntentDetails(lang,key)}
    <div class="route-specific-faq"><h3>${esc(ui.faqs)}</h3><div class="route-specific-questions">${seo.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("")}</div></div>
  </section>`;
}

function destSeoName(dest,lang){
 const raw=dest.names[lang];
 return raw.replace(/,\s*(?:Belarus|Беларусь|Białoruś|Baltarusija|Baltkrievija|Biélorussie)$/u,"");
}

function destinationRouteUrl(lang,origin,dest){
 if(dest.id==="minsk"){
   if(["warsaw","vilnius","riga"].includes(origin.id))return routePath(lang,origin.id);
   return geoPath(lang,origin);
 }
 return transferPairPath(lang,origin,dest);
}

function destinationCardList(lang,origin=null){
 const ui=destinationLocale[lang];
 return `<section class="section dest-discovery" id="destinations" aria-labelledby="dest-list-heading">
    <div class="section-head"><span class="eyebrow">ComfortLine · Belarus</span>
      <h2 id="dest-list-heading">${esc(ui.section)}</h2>
      <p>${esc(ui.unlisted)} <a href="${destinationIndexPath(lang)}">${esc(ui.browse)} ↗</a></p></div>
    <div class="dest-mini-grid">${belarusDestinations.map(dest=>{
      const name=dest.names[lang],href=origin&&featuredOriginIds.includes(origin.id)?destinationRouteUrl(lang,origin,dest):destinationPath(lang,dest);
      return `<a href="${href}" class="dest-mini-item"><span aria-hidden="true">${dest.type==="airport"?"✈":"⌖"}</span>
        <strong>${esc(name)}</strong><span aria-hidden="true">↗</span></a>`;
    }).join("")}</div>
  </section>`;
}

function destinationIndexPage(lang){
 const l=locale[lang],ui=destinationLocale[lang];
 const canonical=base+destinationIndexPath(lang);
 const schemas={"@context":"https://schema.org","@graph":[businessSchema(lang,canonical),
  {"@type":"CollectionPage","name":ui.section,"url":canonical,"description":ui.hubLead},
  {"@type":"BreadcrumbList","itemListElement":[
   {"@type":"ListItem","position":1,"name":l.nav.routes,"item":base+l.home},
   {"@type":"ListItem","position":2,"name":ui.section,"item":canonical}
  ]}
 ]};
 const body=`${header(lang,"destination-index")}<main>
  <section class="dest-index-hero"><div class="dest-index-hero-inner">
    <nav class="breadcrumbs"><a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span><span>${esc(ui.browse)}</span></nav>
    <span class="eyebrow light">ComfortLine · Belarus</span>
    <h1>${esc(ui.section)}</h1><p>${esc(ui.hubLead)}</p>
    <a href="#dest-index-list" class="button primary">${esc(ui.browse)} ${icons.arrow}</a>
  </div></section>
  <section class="section dest-index-section" id="dest-index-list">
    <div class="dest-index-grid">${belarusDestinations.map(dest=>`
    <article class="dest-index-card">
      <span class="dest-index-icon" aria-hidden="true">${dest.type==="airport"?"✈":"⌖"}</span>
      <h2><a href="${destinationPath(lang,dest)}">${esc(dest.names[lang])} ↗</a></h2>
      <p>${esc(dest.specifics[lang])}</p>
      <a class="dest-index-read" href="${destinationPath(lang,dest)}">${esc(ui.keyOrigin.replace("{dest}",destSeoName(dest,lang)))} ↗</a>
    </article>`).join("")}</div>
  </section>
  <section class="section dest-journey-note" id="service">
    <h2>${esc(ui.safety)}</h2><p>${esc(ui.borderAdvice)}</p>
    <p>${esc(ui.priceAdvice)}</p>
    <a href="#booking-dialog" data-open-booking aria-controls="booking-dialog" aria-haspopup="dialog" class="button primary">${esc(ui.booking)} ${icons.arrow}</a>
  </section>
  ${faq(l)}
  </main>${footer(l)}`;
 return layout({lang,title:ui.section+" | byComfortLine",description:ui.hubMeta.replace("{dest}",ui.section),
   canonical,alternates:destinationIndexAlternates(),body,schema:schemas,
   originOverride:"",destinationOverride:""});
}

function destinationPage(lang,dest){
 const l=locale[lang],ui=destinationLocale[lang],to=dest.names[lang],short=destSeoName(dest,lang),values={dest:short,to:short};
 const canonical=base+destinationPath(lang,dest);
 const title=localeWords(ui.hubTitle,values);
 const description=localeWords(ui.hubMeta,values);
 const intro=localeWords(ui.hubLead,values);
 const schema={"@context":"https://schema.org","@graph":[businessSchema(lang,canonical),
  {"@type":"Service","name":localeWords(ui.hubHeading,values),"description":description,"url":canonical,
    "serviceType":ui.service,"provider":{"@id":base+"/#business"},
    "areaServed":{"@type":"Place","name":to}},
  {"@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":l.nav.routes,"item":base+l.home},
    {"@type":"ListItem","position":2,"name":ui.section,"item":base+destinationIndexPath(lang)},
    {"@type":"ListItem","position":3,"name":to,"item":canonical}
  ]}
 ]};
 const byCountry=["PL","LT","LV","DE","FR"].map(country=>{
  const from=featuredOrigins.filter(origin=>origin.country===country);
  return !from.length?"":`<section class="dest-origin-group">
    <h3>${esc(geoLocale[lang].countryLabels[country])}</h3>
    <div class="dest-route-grid">${from.map(origin=>`
      <a href="${destinationRouteUrl(lang,origin,dest)}">
        <span class="dest-route-symbol" aria-hidden="true">${origin.type==="airport"?"✈":"⌖"}</span>
        <span><strong>${esc(origin.names[lang])} → ${esc(to)}</strong>
         <small>${esc(ui.price)} · ${esc(origin.type==="airport"?ui.airportCode:ui.fromLabel)}</small></span>
        <span aria-hidden="true">↗</span>
      </a>`).join("")}</div>
  </section>`;
 }).join("");
 const siblingLinks=belarusDestinations.filter(x=>x.id!==dest.id).map(x=>`<a href="${destinationPath(lang,x)}">${esc(x.names[lang])} ↗</a>`).join("");
 const safetySources=[...new Map(Object.values(routeOfficialSources).flat().map(([label,url])=>[url,label])).entries()].slice(0,5)
   .map(([url,label])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`).join("");
 const body=`${header(lang,"destination",dest)}<main>
  <section class="dest-hero"><div class="dest-hero-inner">
    <nav class="breadcrumbs"><a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span>
      <a href="${destinationIndexPath(lang)}">${esc(ui.section)}</a><span>/</span><span>${esc(to)}</span></nav>
    <span class="eyebrow light">${esc(ui.section)}</span>
    <h1>${esc(localeWords(ui.hubHeading,values))}</h1><p>${esc(intro)}</p>
    <div class="hero-actions"><a href="#booking-dialog" class="button primary"
      data-open-booking aria-controls="booking-dialog" aria-haspopup="dialog">${esc(ui.booking)} ${icons.arrow}</a>
      <a href="tel:${phoneHref}" class="button ghost">${icons.phone}${phoneDisplay}</a></div>
    ${quickBooking(lang,"vilnius","",to)}
  </div></section>
  <section class="section dest-local-guide" id="service">
    <div class="dest-guide-grid">
      <article><span class="dest-card-eyebrow">${esc(ui.arrivalTitle)}</span><h2>${esc(to)}</h2>
        <p>${esc(ui.arrivalLead)}</p><p class="dest-arrival-places">${esc(dest.arrivalOptions[lang])}</p></article>
      <article><span class="dest-card-eyebrow">${esc(ui.whyTitle)}</span><h2>${esc(ui.routePractical)}</h2>
        <p>${esc(dest.specifics[lang])}</p><p class="dest-arrival-note">${esc(ui.toMinsk)}</p></article>
    </div>
  </section>
  <section class="section dest-origin-directory" id="departure-routes">
    <div class="section-head"><span class="eyebrow">${esc(ui.findByOrigin)}</span>
      <h2>${esc(localeWords(ui.keyOrigin,values))}</h2><p>${esc(ui.available)}</p></div>
    ${byCountry}
    <p class="dest-directory-help">${esc(ui.unlisted)}</p>
  </section>
  <section class="section dest-border-guide"><h2>${esc(ui.safety)}</h2>
    <p>${esc(ui.borderAdvice)}</p><p>${esc(ui.priceAdvice)}</p>
    <div class="dest-safety-links">${safetySources}</div>
  </section>
  <section class="section dest-switcher">
    <h2>${esc(ui.destinationsLink)}</h2><div>${siblingLinks}</div>
    <a href="${destinationIndexPath(lang)}">${esc(ui.browse)} ↗</a>
  </section>
  ${faq(l)}
  </main>${footer(l)}`;
 return layout({lang,title,description,canonical,alternates:destinationAlternates(dest),
   body,schema,routeKey:"vilnius",originOverride:"",destinationOverride:to});
}

function transferPairPage(lang,origin,dest){
 const l=locale[lang],ui=destinationLocale[lang];
 const from=origin.names[lang],to=dest.names[lang],short=destSeoName(dest,lang);
 const values={from,to:short,dest:short};
 const canonical=base+transferPairPath(lang,origin,dest);
 const title=localeWords(ui.routeTitle,values)+" | byComfortLine";
 const description=localeWords(ui.routeMeta,values);
 const h1=localeWords(ui.routeH1,values);
 const facts=origin.type==="airport"?origin.facts[lang]:origin.pickup[lang];
 const originAirport=origin.type==="airport";
 const advice=routeOfficialSources[origin.parent]||[];
 const adviceLinks=advice.map(([text,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`).join("");
 const similar=featuredOrigins.filter(o=>o.id!==origin.id&&o.country===origin.country).slice(0,5);
 const siblings=belarusDestinations.filter(d=>d.id!==dest.id).slice(0,6);
 const schema={"@context":"https://schema.org","@graph":[
   businessSchema(lang,canonical),
   {"@type":"Service","name":h1,"description":description,"url":canonical,"serviceType":ui.service,
    "provider":{"@id":base+"/#business"},
    "areaServed":[{"@type":"Place","name":from},{"@type":"Place","name":to}]},
   {"@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":l.nav.routes,"item":base+l.home},
    {"@type":"ListItem","position":2,"name":ui.section,"item":base+destinationIndexPath(lang)},
    {"@type":"ListItem","position":3,"name":to,"item":base+destinationPath(lang,dest)},
    {"@type":"ListItem","position":4,"name":h1,"item":canonical}
   ]}
 ]};
 const body=`${header(lang,"pair",{origin,dest})}<main>
  <section class="dest-pair-hero"><div class="dest-hero-inner">
    <nav class="breadcrumbs"><a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span>
      <a href="${destinationIndexPath(lang)}">${esc(ui.section)}</a><span>/</span>
      <a href="${destinationPath(lang,dest)}">${esc(to)}</a><span>/</span><span>${esc(from)}</span></nav>
    <span class="eyebrow light">${esc(ui.service)} · ${esc(ui.price)}</span>
    <h1>${esc(h1)}</h1><p>${esc(localeWords(ui.routeLead,values))}</p>
    <div class="hero-actions">
      <a href="#booking-dialog" data-open-booking class="button primary" aria-controls="booking-dialog" aria-haspopup="dialog">${esc(ui.booking)} ${icons.arrow}</a>
      <a href="tel:${phoneHref}" class="button ghost">${icons.phone}${phoneDisplay}</a>
    </div>
    ${quickBooking(lang,origin.parent,from,to)}
  </div></section>
  <section class="section dest-pair-main" id="service">
    <div class="dest-pair-facts"><div><span>${esc(ui.fromLabel)}</span><strong>${esc(from)}</strong></div>
      <div><span>${esc(ui.toLabel)}</span><strong>${esc(to)}</strong></div>
      <div><span>${esc(ui.price)}</span><strong>${esc(ui.price)}</strong></div></div>
    <div class="dest-guide-grid">
      <article>
        <span class="dest-card-eyebrow">${originAirport?esc(ui.airportCode):esc(ui.fromLabel)}</span>
        <h2>${esc(localeWords(ui.originTitle,values))}</h2>
        <p>${esc(facts)}</p><p>${esc(originAirport?ui.airportAdvice:ui.cityAdvice)}</p>
        ${originAirport?`<a href="${geoPath(lang,origin)}">${esc(ui.compare)} ↗</a>`:""}
      </article>
      <article><span class="dest-card-eyebrow">${esc(ui.toLabel)}</span>
        <h2>${esc(localeWords(ui.destTitle,values))}</h2>
        <p>${esc(dest.specifics[lang])}</p>
        <p class="dest-arrival-places">${esc(dest.arrivalOptions[lang])}</p>
        <a href="${destinationPath(lang,dest)}">${esc(ui.destinationsLink)} ↗</a>
      </article>
    </div>
    <div class="dest-pair-journey">
      <h2>${esc(ui.routePractical)}</h2>
      <p>${esc(ui.borderAdvice)}</p><p>${esc(ui.priceAdvice)}</p>
      <p class="dest-not-confirmed">${esc(ui.confirmed)}</p>
      <div class="dest-safety-links">${adviceLinks}</div>
      <a href="#booking-dialog" class="button primary" data-open-booking
         aria-controls="booking-dialog" aria-haspopup="dialog">${esc(ui.booking)} ${icons.arrow}</a>
    </div>
    <div class="dest-pair-related">
      <section><h2>${esc(localeWords(ui.otherOrigins,values))}</h2><div>
         ${similar.map(other=>`<a href="${destinationRouteUrl(lang,other,dest)}">${esc(other.names[lang])} ↗</a>`).join("")}
         <a href="${destinationPath(lang,dest)}">${esc(ui.compare)} ↗</a>
      </div></section>
      <section><h2>${esc(ui.destinationsLink)}</h2><div>
        ${siblings.map(other=>`<a href="${destinationRouteUrl(lang,origin,other)}">${esc(other.names[lang])} ↗</a>`).join("")}
        <a href="${destinationIndexPath(lang)}">${esc(ui.browse)} ↗</a>
      </div></section>
    </div>
    <section class="dest-pair-faq" id="faq"><h2>${esc(l.faqTitle)}</h2>
      ${[[localeWords(ui.routeTitle,values)+"?",ui.quoteLead],
          [ui.safety+"?",ui.borderAdvice],
          [ui.price+"?",ui.priceAdvice]].map(([q,a])=>`
        <details><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join("")}
    </section>
  </section>
  </main>${footer(l)}`;
 return layout({lang,title,description,canonical,alternates:pairAlternates(origin,dest),
  body,schema,routeKey:origin.parent,originOverride:from,destinationOverride:to});
}

function geoText(template, variables) {
  return String(template).replace(/\{(place|code)\}/g, (_, key) => variables[key] || "");
}

function geoCountryGroups(lang, items, compact = false) {
  const t = geoLocale[lang];
  const countryOrder = ["PL","LT","LV","DE","FR"];
  return countryOrder.map(country=>{
    const subset = items.filter(place=>place.country===country);
    if(!subset.length)return "";
    return `<section class="geo-country-group" id="country-${country.toLowerCase()}">
      <h3>${esc(t.countryLabels[country])} <small>${subset.length}</small></h3>
      <div class="geo-directory-grid${compact?" compact":""}">${subset.map(place=>{
        const name=place.names[lang];
        return `<a class="geo-directory-card" href="${geoPath(lang,place)}">
          <span class="geo-directory-card-mark" aria-hidden="true">${place.type==="airport"?"✈":"⌖"}</span>
          <span><strong>${esc(name)}</strong><small>${esc(place.type==="airport"?place.code:t.arrival)}</small></span>
          <span aria-hidden="true">↗</span>
        </a>`;
      }).join("")}</div>
    </section>`;
  }).join("");
}

function geoHubDirectoryLinks(lang) {
  const t=geoLocale[lang];
  return `<section class="section geo-hub-links" id="more-departures">
    <div class="section-head"><span class="eyebrow">ComfortLine · Cities & Airports</span>
      <h2>${esc(t.indexes)}</h2><p>${esc(t.directoryLead)}</p></div>
    <div class="geo-hub-link-cards">
      <a href="${geoIndexPath(lang,"airport")}"><span aria-hidden="true">✈</span>
        <strong>${esc(t.browseAirports)}</strong><small>VNO · KUN · PLQ · WAW · WMI · RIX · BER · CDG · ORY</small><b aria-hidden="true">↗</b></a>
      <a href="${geoIndexPath(lang,"city")}"><span aria-hidden="true">⌖</span>
        <strong>${esc(t.browseCities)}</strong><small>Berlin · Paris · Kaunas · Białystok · Daugavpils</small><b aria-hidden="true">↗</b></a>
    </div>
  </section>`;
}

function geoDirectoryPage(lang,type) {
  const l=locale[lang], t=geoLocale[lang],items=geoPlaces.filter(place=>place.type===type);
  const label=type==="airport"?t.directoryAirports:t.directoryCities;
  const canonical=base+geoIndexPath(lang,type);
  const schema={"@context":"https://schema.org","@graph":[businessSchema(lang,canonical),
    {"@type":"CollectionPage","name":label,"url":canonical,"description":t.directoryLead,
      "isPartOf":{"@type":"WebSite","name":"byComfortLine","url":base+"/"}},
    {"@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":l.nav.routes,"item":base+l.home},
      {"@type":"ListItem","position":2,"name":label,"item":canonical}
    ]}
  ]};
  const nav=`<nav class="breadcrumbs"><a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span><span>${esc(label)}</span></nav>`;
  const body=`${header(lang,"geo-index",type)}<main>
    <section class="geo-index-hero"><div class="geo-index-inner">${nav}
      <span class="eyebrow light">ComfortLine · Minsk, Belarus</span>
      <h1>${esc(label)}</h1><p>${esc(t.directoryLead)}</p>
      <div class="geo-type-toggle">
        <a href="${geoIndexPath(lang,"airport")}"${type==="airport"?' aria-current="page"':""}>✈ ${esc(t.browseAirports)}</a>
        <a href="${geoIndexPath(lang,"city")}"${type==="city"?' aria-current="page"':""}>⌖ ${esc(t.browseCities)}</a>
      </div>
    </div></section>
    <div class="geo-directory-wrap section">${geoCountryGroups(lang,items)}
      <p class="geo-directory-note">${esc(t.directoryNote)}</p>
      <a class="button primary geo-list-cta" href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${esc(l.formTitle)} ${icons.arrow}</a>
    </div>
    <section class="geo-simple-service section" id="service"><h2>${esc(t.why)}</h2><p>${esc(t.whyText)}</p></section>
    ${homeBookingTransparency(lang)}
    ${faq(l)}
  </main>${footer(l)}`;
  return layout({lang,title:label+" | byComfortLine",description:t.directoryLead,canonical,
    alternates:geoIndexAlternates(type),body,schema});
}

function geoLocationPage(lang,place) {
  const l=locale[lang], t=geoLocale[lang];
  const name=place.names[lang], opts={place:name,code:place.code||""};
  const isAirport=place.type==="airport";
  const title=geoText(isAirport?t.airportTitle:t.cityTitle,opts)+" | byComfortLine";
  const description=geoText(isAirport?t.airportMeta:t.cityMeta,opts);
  const h1=geoText(isAirport?t.airportH1:t.cityH1,opts);
  const canonical=base+geoPath(lang,place);
  const parentRoute=routePath(lang,place.parent);
  const related=geoPlaces.filter(item=>item.country===place.country&&item.id!==place.id);
  const countyLinks=related.sort((a,b)=>a.type===b.type? a.names[lang].localeCompare(b.names[lang]) : a.type==="airport"?-1:1).slice(0,8)
    .map(item=>`<a href="${geoPath(lang,item)}">${esc(item.names[lang])}${item.code?` · ${item.code}`:""} ↗</a>`).join("");
  const locationFact=(place.type==="airport"?place.facts:place.pickup)[lang];
  const applicableAdvice=routeOfficialSources[place.parent] || [];
  const adviceLinks=applicableAdvice.map(([text,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`).join("");
  const official=isAirport?`<a class="geo-official-link" target="_blank" rel="noopener noreferrer" href="${esc(place.official)}">${esc(t.official)} ↗</a>`:"";
  const extraLong=["DE","FR"].includes(place.country)
    ?`<p class="geo-long-disclaimer">${esc(t.limited)}</p>`:"";
  const faqs=[
    [geoText(t.faq1,opts),t.answer1],
    [geoText(t.faq2,opts),t.answer2],
    [t.faq3,t.answer3]
  ];
  const schema={"@context":"https://schema.org","@graph":[
    businessSchema(lang,canonical),
    {"@type":"Service","name":h1,"serviceType":"Private international transfer enquiry",
      "provider":{"@id":base+"/#business"},
      "areaServed":[{"@type":"Place","name":name},{"@type":"Place","name":"Minsk, Belarus"}],
      "description":description,"url":canonical},
    {"@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":l.nav.routes,"item":base+l.home},
      {"@type":"ListItem","position":2,"name":isAirport?t.directoryAirports:t.directoryCities,"item":base+geoIndexPath(lang,place.type)},
      {"@type":"ListItem","position":3,"name":name,"item":canonical}
    ]}
  ]};
  const body=`${header(lang,"geo",place)}<main>
    <section class="geo-location-hero">
      <div class="geo-location-hero-inner">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span>
          <a href="${geoIndexPath(lang,place.type)}">${esc(isAirport?t.browseAirports:t.browseCities)}</a><span>/</span><span>${esc(name)}</span>
        </nav>
        <span class="eyebrow light">${esc(t.countryLabels[place.country])} · ${isAirport?esc(t.airport):esc(t.city)}${place.code?" · "+place.code:""}</span>
        <h1>${esc(h1)}</h1>
        <p>${esc(geoText(isAirport?t.introAirport:t.introCity,opts))}</p>
        <div class="hero-actions">
          <a href="#booking-dialog" data-open-booking class="button primary" aria-haspopup="dialog" aria-controls="booking-dialog">${esc(t.quote)} ${icons.arrow}</a>
          <a href="tel:${phoneHref}" class="button ghost">${icons.phone}${phoneDisplay}</a>
        </div>
        ${quickBooking(lang,place.parent,name)}
      </div>
    </section>
    <div class="geo-content-wrap section">
      <div class="geo-page-facts">
        <div><span>${esc(isAirport?t.airport:t.city)}</span><strong>${esc(name)}</strong></div>
        <div><span>${esc(l.fields.to)}</span><strong>${esc(t.arrival)}</strong></div>
        <div><span>${esc(t.cost)}</span><strong>${esc(reverseJourneyCopy[lang].label)}</strong></div>
      </div>
      <div class="geo-detail-grid">
        <article class="geo-detail-card geo-distinct">
          <span class="geo-card-index">01 · ${esc(t.special)}</span>
          <h2>${esc(name)}${place.code?" · "+place.code:""}</h2>
          <p>${esc(locationFact)}</p>${official}
          <p>${esc(isAirport?t.flight:t.station)}</p>
        </article>
        <article class="geo-detail-card">
          <span class="geo-card-index">02 · ${esc(t.cost)}</span>
          <h2>${esc(t.why)}</h2>
          <p>${esc(t.whyText)}</p><p>${esc(t.costText)}</p>
          ${extraLong}
        </article>
      </div>
      <section class="geo-how-book" id="service">
        <h2>${esc(t.quote)}</h2><p>${esc(t.quoteInfo)}</p>
        <div class="geo-how-steps">${bookingTrustContent[lang].process.map(([n,title,body])=>`
          <article><span>${esc(n)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("")}</div>
        <a class="button primary" href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${esc(l.formTitle)} ${icons.arrow}</a>
      </section>
      <section class="geo-border-guidance">
        <h2>${esc(t.checklist)}</h2><ul>${t.checkItems.map(item=>`<li>${esc(item)}</li>`).join("")}</ul>
        <div class="geo-safety-sources">${adviceLinks}</div>
      </section>
      <section class="geo-vehicle-note">
        <h2>${esc(t.reviews)}</h2><p>${esc(t.reviewsText)}</p>
        <a href="${parentRoute}#fleet">${esc(l.serviceTitle)} ↗</a>
      </section>
      ${destinationCardList(lang,place)}
      <section class="geo-related" aria-label="${esc(t.localLinks)}">
        <h2>${esc(t.localLinks)}</h2>
        <div>${countyLinks}</div>
        <p><a href="${parentRoute}">${esc(t.backHub)} ↗</a>
          <a href="${geoIndexPath(lang,"airport")}">${esc(t.browseAirports)} ↗</a>
          <a href="${geoIndexPath(lang,"city")}">${esc(t.browseCities)} ↗</a></p>
      </section>
      <section class="geo-unique-faq" id="faq">
        <h2>${esc(l.faqTitle)}</h2>
        ${faqs.map(([q,a])=>`<details><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join("")}
      </section>
    </div>
  </main>${footer(l)}`;
  return layout({lang,title,description,canonical,alternates:geoAlternateLinks(place),
    body,schema,routeKey:place.parent,originOverride:name});
}

function routePage(lang, key) {
  const l = locale[lang], r = routes[key];
  const canonical = `${base}${routePath(lang, key)}`;
  const seo = routeSeo[lang][key];
  const h1 = seo.h1;
  const description = seo.description;
  const faqSchema = { "@type": "FAQPage", mainEntity: [...seo.faqs, ...l.faqs].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const schema = { "@context": "https://schema.org", "@graph": [businessSchema(lang, canonical), { "@type": "Service", name: h1, serviceType: "Private cross-border airport transfer and chauffeur-driven intercity taxi", description: seo.intro, provider: { "@id": base + "/#business" }, areaServed: [l.fromNames[key], "Minsk"], url: canonical }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: l.nav.routes, item: `${base}/${lang}/` }, { "@type": "ListItem", position: 2, name: l.routeNames[key], item: canonical }] }, faqSchema] };
  const body = `${header(lang, "route", key)}<main>
    <section class="route-hero"><div class="route-hero-bg"></div><div class="route-hero-content"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${l.home}">${esc(l.nav.routes)}</a><span>/</span><span>${esc(l.routeNames[key])}</span></nav><span class="eyebrow light">${esc(l.kicker)}</span><h1>${esc(h1)}</h1><p>${esc(seo.intro)}</p><div class="hero-actions"><a class="button primary" href="#booking-dialog" data-open-booking aria-haspopup="dialog" aria-controls="booking-dialog">${esc(l.formTitle)} ${icons.arrow}</a><a class="button ghost" href="tel:${phoneHref}">${icons.phone}${phoneDisplay}</a></div>${quickBooking(lang, key)}</div><div class="journey-card"><div><span>${esc(l.fromNames[key])}</span><b>${r.airport}</b></div><div class="journey-line"><i></i><em>${r.distance}</em><i></i></div><div><span>${esc(destinationLabels[lang])}</span><b>BY</b></div></div></section>
    ${trustStrip(l)}
    <section class="facts-section"><article><span>${icons.pin}</span><div><small>${esc(l.facts.distance)}</small><strong>${r.distance}</strong></div></article><article><span class="clock">◷</span><div><small>${esc(l.facts.time)}</small><strong>${r.time}</strong><em>${esc(l.facts.note)}</em></div></article><article><span class="plane">✈</span><div><small>${esc(l.facts.airport)}</small><strong>${r.airport}</strong></div></article></section>
    ${routeEditorial(lang, key)}
    ${destinationCardList(lang,coreOriginProfiles.find(origin=>origin.id===key))}
    ${returnTripInfo(lang,key)}
    ${fleetShowcase(lang)}
    ${routeBookingTransparency(lang, key)}
    <section class="service-section" id="service"><div class="service-intro"><span class="eyebrow light">${esc(l.routeNames[key])}</span><h2>${esc(l.serviceTitle)}</h2></div><div class="service-grid">${l.services.map(([h, p], i) => `<article><span>0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    <section class="section steps-section"><div class="section-head"><span class="eyebrow">3 steps</span><h2>${esc(l.stepsTitle)}</h2></div><div class="steps">${l.steps.map(([n, h, p]) => `<article><span>${n}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div></section>
    ${faq(l)}
    <section class="section other-routes"><div class="section-head"><span class="eyebrow">Comfortline</span><h2>${esc(l.otherTitle)}</h2></div><div class="route-grid">${routeCards(lang, key)}</div></section>
    </main>${footer(l)}`;
  return layout({ lang, title: seo.title, description, canonical, alternates: alternateLinks("route", key), body, schema, routeKey: key });
}

function thankYouPage(lang) {
  const l = locale[lang], ui = bookingPopupUi[lang];
  const title = `${ui.thanksTitle} | ComfortLine`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${esc(title)}</title><meta name="robots" content="noindex,follow"><meta name="description" content="${esc(ui.thanksNotice)}">
    <link rel="canonical" href="${base}/${lang}/thank-you/"><link rel="stylesheet" href="/assets/style.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <script src="/assets/app.js" defer></script></head><body class="thanks-body">
    <header class="thanks-header"><a class="brand" href="${l.home}" aria-label="ComfortLine"><img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56"></a></header>
    <main class="thanks-main"><section class="thanks-panel" data-booking-thankyou data-lang="${lang}">
      <div data-inquiry-confirmation hidden>
      <div class="thanks-check" aria-hidden="true">✓</div><span class="eyebrow">ComfortLine</span><h1>${esc(ui.thanksTitle)}</h1>
      <p class="thanks-lead">${esc(ui.thanksLead)}</p>
      <div class="thanks-reference"><span>${esc(ui.ref)}</span><div><strong data-inquiry-reference>—</strong><button type="button" data-copy-reference>${esc(ui.copy)}</button></div></div>
      <section class="thanks-details"><h2>${esc(ui.details)}</h2><pre data-inquiry-summary></pre></section>
      <div class="thanks-actions"><a class="thanks-whatsapp" data-inquiry-whatsapp href="https://wa.me/375291552776" target="_blank" rel="noopener noreferrer"><img src="/assets/social/whatsapp.svg" width="21" height="21" alt="">${esc(ui.sendWa)}</a>
        <a class="thanks-email" data-inquiry-email href="mailto:${email}">${esc(ui.sendEmail)}</a></div>
      <p class="thanks-notice">${esc(ui.thanksNotice)}</p></div><p class="thanks-missing">${esc(ui.noDraft)}</p>
      <a class="thanks-back" href="${l.home}">← ${esc(ui.back)}</a>
    </section></main>${floatingContact()}</body></html>`;
}
function gateway() {
  const links = Object.entries(locale).map(([code,l]) => `<a href="/${code}/"><span>${code.toUpperCase()}</span><strong>${l.label}</strong>${icons.arrow}</a>`).join("");
  const popular = [
    ["Warsaw to Minsk, Belarus · private taxi", routePath("en","warsaw")],
    ["Vilnius Airport to Minsk · private transfer", routePath("en","vilnius") + "#airport-pickup"],
    ["Riga Airport to Minsk · private car", routePath("en","riga") + "#airport-pickup"]
  ].map(([title,link]) => `<a href="${link}">${esc(title)} ↗</a>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Private Transfers to Minsk, Belarus | byComfortLine</title>
    <meta name="description" content="Request private transfers to Minsk, Belarus from Warsaw, Vilnius, Riga and their airports. Choose your language, route and pickup location.">
    <meta name="robots" content="index,follow"><link rel="canonical" href="${base}/">${alternateLinks("home")}
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/style.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
    </head><body class="gateway"><main><div class="gateway-panel"><a class="brand" href="/"><img class="brand-logo" src="/assets/comfortline-logo-dark.svg" alt="ComfortLine" width="200" height="56"></a>
      <h1>Private transfers to Minsk, Belarus</h1>
      <p class="gateway-route-intro">Request a door-to-door private taxi or chauffeur-style transfer from Warsaw, Vilnius, Riga or their airports to Minsk, Belarus. Select your preferred language to discuss a vehicle and price.</p>
      <h2>Choose your language</h2>
      <div class="gateway-links">${links}</div>
      <nav class="gateway-route-nav" aria-label="Popular private transfers">${popular}</nav>
      <small>Vilnius VNO · Warsaw WAW/WMI · Riga RIX · Minsk</small>
    </div></main>${floatingContact()}</body></html>`;
}

async function put(relative, content) {
  const file = join(out, relative);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

// Yandex recommends a discoverable root favicon; keep this synced with the site logo.
await copyFile(join(out,"assets/favicon.svg"), join(out,"favicon.svg"));
await put("index.html", gateway());
for (const lang of Object.keys(locale)) {
  await put(`${lang}/index.html`, hubPage(lang));
  await put(`${lang}/thank-you/index.html`, thankYouPage(lang));
  for (const key of Object.keys(routes)) await put(`${lang}/${locale[lang].slugs[key]}/index.html`, routePage(lang, key));
  for (const type of ["airport","city"]) await put(geoIndexPath(lang,type).slice(1)+"index.html", geoDirectoryPage(lang,type));
  for (const place of geoPlaces) await put(geoPath(lang,place).slice(1)+"index.html", geoLocationPage(lang,place));
  await put(destinationIndexPath(lang).slice(1)+"index.html", destinationIndexPage(lang));
  for(const dest of belarusDestinations){
    await put(destinationPath(lang,dest).slice(1)+"index.html",destinationPage(lang,dest));
    if(dest.id!=="minsk")for(const origin of featuredOrigins){
      await put(transferPairPath(lang,origin,dest).slice(1)+"index.html",transferPairPage(lang,origin,dest));
    }
  }
}

const sitemapEntries = [
  `<url><loc>${base}/</loc><lastmod>${seoLastmod}</lastmod></url>`,
  ...Object.keys(locale).map(lang => `<url><loc>${base}/${lang}/</loc><lastmod>${seoLastmod}</lastmod>${Object.keys(locale).map(code => `<xhtml:link rel="alternate" hreflang="${code}" href="${base}/${code}/"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${base}/"/></url>`),
  ...Object.keys(locale).map(lang=>{
    const url=base+destinationIndexPath(lang);
    const alternates=Object.keys(locale).map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${base+destinationIndexPath(code)}"/>`).join("");
    return `<url><loc>${url}</loc><lastmod>${seoLastmod}</lastmod>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${base+destinationIndexPath("en")}"/></url>`;
  }),
  ...belarusDestinations.flatMap(dest=>Object.keys(locale).map(lang=>{
    const url=base+destinationPath(lang,dest);
    const alternates=Object.keys(locale).map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${base+destinationPath(code,dest)}"/>`).join("");
    return `<url><loc>${url}</loc><lastmod>${seoLastmod}</lastmod>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${base+destinationPath("en",dest)}"/></url>`;
  })),
  ...belarusDestinations.filter(dest=>dest.id!=="minsk").flatMap(dest=>
    featuredOrigins.flatMap(origin=>Object.keys(locale).map(lang=>{
      const url=base+transferPairPath(lang,origin,dest);
      const alternates=Object.keys(locale).map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${base+transferPairPath(code,origin,dest)}"/>`).join("");
      return `<url><loc>${url}</loc><lastmod>${seoLastmod}</lastmod>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${base+transferPairPath("en",origin,dest)}"/></url>`;
    }))
  ),
  ...["airport","city"].flatMap(type => Object.keys(locale).map(lang => {
    const url=base+geoIndexPath(lang,type);
    const alternates=Object.keys(locale).map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${base+geoIndexPath(code,type)}"/>`).join("");
    return `<url><loc>${url}</loc><lastmod>${seoLastmod}</lastmod>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${base+geoIndexPath("en",type)}"/></url>`;
  })),
  ...geoPlaces.flatMap(place => Object.keys(locale).map(lang => {
    const url=base+geoPath(lang,place);
    const alternates=Object.keys(locale).map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${base+geoPath(code,place)}"/>`).join("");
    return `<url><loc>${url}</loc><lastmod>${seoLastmod}</lastmod>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${base+geoPath("en",place)}"/></url>`;
  })),
  ...Object.keys(routes).flatMap(key => Object.keys(locale).map(lang => {
    const url = `${base}${routePath(lang, key)}`;
    const localized = Object.keys(locale).map(code => `<xhtml:link rel="alternate" hreflang="${code}" href="${base}${routePath(code, key)}"/>`).join("");
    return `<url><loc>${url}</loc><lastmod>${seoLastmod}</lastmod>${localized}<xhtml:link rel="alternate" hreflang="x-default" href="${base}${routePath("en", key)}"/></url>`;
  }))
];
await put("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join("\n")}
</urlset>`);
// Yandex no longer uses hreflang attributes in sitemaps. Provide a simple
// canonical-URL version for manual submission in Yandex Webmaster.
await put("sitemap-yandex.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(row=>{
  const loc=row.match(/<loc>([^<]+)<\/loc>/)?.[1];
  const lastmod=row.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
}).join("\n")}
</urlset>`);
await put("robots.txt", `User-agent: *
Allow: /
Sitemap: ${base}/sitemap.xml
`);
// Stop Cloudflare deployment builds if a generated route, asset link, locale or sitemap is inconsistent.
await import("./check-seo.mjs");
