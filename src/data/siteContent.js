const localEditorialPhotoIds = new Set([
  'brindisi-squadra-tavernetta',
  'chi-siamo-squadra',
  'cocktail-ambrato',
  'dettaglio-pizza-pomodoro-basilico',
  'fritto-della-casa',
  'impasto-pizza-ingredienti',
  'pizza-forno-crosta',
  'pizza-forno-margherita',
  'pizza-speciale-bottiglie-vertical',
  'pizza-speciale-lattine-tavolo',
  'pizza-speciale-lattine-vertical',
  'preparazione-impasto-pizza',
  'preparazione-pizza-mozzarella',
  'preparazione-pizze-mani',
  'squadra-tavernetta-tavolo',
  'tavolo-staff-pizza-vertical',
]);

const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const photo = (id, width = 1600) => {
  if (localEditorialPhotoIds.has(id)) {
    return withBase(`images/editorial/${id}.jpg`);
  }

  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
};

export const pageNavigation = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/chi-siamo', label: 'Chi siamo' },
];

export const heroSlides = [
  {
    src: photo('pizza-speciale-lattine-tavolo', 2400),
    alt: 'Pizza speciale servita su tavolo scuro con dettagli colorati',
  },
  {
    src: photo('preparazione-pizze-mani', 2400),
    alt: 'Mani al lavoro durante la preparazione di pizze in pizzeria',
  },
  {
    src: photo('preparazione-impasto-pizza', 2400),
    alt: 'Impasto sollevato durante la preparazione di una pizza',
  },
];

export const aboutPageSlides = [
  {
    src: photo('squadra-tavernetta-tavolo', 2400),
    alt: 'Squadra Tavernetta raccolta attorno a pizze e bottiglie in sala',
  },
];

export const restaurant = {
  name: 'Tavernetta',
  location: 'San Giovanni Lupatoto',
  label: 'Ristorante italiano contemporaneo',
  hero: {
    scrollLabel: 'Scorri',
    orderCta: {
      label: 'Menu',
      to: '/menu',
    },
  },
  about: {
    eyebrow: 'Atmosfera',
    title: 'Ambiente moderno, accogliente, un lato industrial retro.',
    intro:
      "Tavernetta nasce come un rifugio urbano di luce morbida, superfici naturali e gesti misurati. Il tono e intimo ma aperto, curato senza rigidita, costruito per accogliere con calma.",
    body: [
      "Ogni tavolo ha distanza, aria e tempo. Il servizio resta vicino senza interrompere, mentre la cucina lavora su contrasti lievi: crosta e morbidezza, acidita e latte, brace e vegetale.",
      "L'atmosfera e quella di una casa italiana riletta con sensibilita contemporanea: elegante, silenziosa, luminosa al punto giusto.",
    ],
    metrics: [
      { value: '36 coperti', label: 'sala raccolta' },
      { value: '48 ore', label: 'maturazione impasti' },
      { value: '140 etichette', label: 'cantina in evoluzione' },
    ],
    cta: {
      label: 'Chi siamo',
      to: '/chi-siamo',
    },
    note: 'Milano, sera, forno acceso.',
    image: {
      src: photo('impasto-pizza-ingredienti', 1600),
      alt: 'Impasto pizza steso al banco con ingredienti freschi sullo sfondo',
    },
  },
  philosophy: {
    eyebrow: 'Filosofia',
    title: "Forno a legna, impasti lenti, vini selezionati e serate con musica per un'esperienza autentica.",
    quote:
      '"Vogliamo che ogni piatto lasci una traccia precisa, non un rumore in piu."',
    body: [
      "Gli impasti maturano lentamente, i topping si costruiscono con pochi elementi leggibili, i piatti stagionali seguono la disponibilita vera degli ingredienti e la cantina accompagna senza sovraccaricare.",
      "Anche l'esperienza in sala nasce dalla stessa idea: eleganza composta, accoglienza naturale, cura continua e nessun gesto superfluo.",
    ],
    pillars: [],
    image: {
      src: photo('preparazione-pizza-mozzarella', 1600),
      alt: 'Pizza in preparazione con mozzarella e condimenti sul banco',
    },
  },
  story: {
    eyebrow: 'Storia',
    title: 'Una casa italiana contemporanea, costruita attorno al tempo del tavolo.',
    intro:
      "Tavernetta nasce dal desiderio di riportare il piacere della cena a un ritmo piu umano: luce bassa, tavoli larghi, impasti lenti, piatti nitidi e una sala che accompagna senza invadere.",
    body: [
      "Il progetto mette insieme esperienze di forno, cucina e servizio in una forma unica. Non cerca nostalgia, ma una familiarita elegante, fatta di materiali morbidi, ceramiche opache, vetro sottile e una grande attenzione al gesto quotidiano.",
      "Ogni sera viene costruita come una sequenza precisa ma naturale: un'accoglienza calma, una tavola leggibile, una cucina che lavora sulla sottrazione e una cantina che sostiene il percorso senza appesantirlo.",
    ],
    details: [
      { label: 'Origine', value: 'Milano, tra corti e luce serale' },
      { label: 'Cucina', value: 'forno, stagionalita, equilibrio' },
      { label: 'Accoglienza', value: 'misurata, calda, continua' },
    ],
    image: {
      src: photo('squadra-tavernetta-tavolo', 1600),
      alt: 'Squadra Tavernetta riunita attorno a un tavolo con pizze',
    },
  },
  preview: {
    eyebrow: 'Menu',
    title: 'Una carta breve, pulita, pensata per la sera.',
    intro:
      'La struttura del menu segue il ritmo della cena, non l accumulo. Ogni categoria ha un tono preciso e una funzione nel percorso della tavola.',
    cta: {
      label: 'Menu completo',
      to: '/menu',
    },
    image: {
      src: photo('tavolo-staff-pizza-vertical', 1600),
      alt: 'Tavolo con pizza servita e atmosfera conviviale verticale',
    },
  },
  menu: {
    eyebrow: 'Selezione',
    title: 'Pizze gourmet, piatti stagionali e una scrittura pulita del sapore.',
    intro:
      'Qui una selezione di piatti che racconta il tono della cucina. La carta completa resta flessibile e cambia con il mercato, ma il linguaggio rimane sempre preciso e misurato.',
  },
  menuPage: {
    eyebrow: 'Menu',
    title: 'Menu',
    intro:
      'Una lettura calma della carta: degustazione, forno, specialita stagionali, dessert e una bevuta costruita con la stessa precisione della cucina.',
  },
  orderPage: {
    eyebrow: 'Ordina',
    title: 'Ordina online',
    intro:
      'Consulta la carta disponibile oggi, componi il carrello e inviaci il tuo ordine con un checkout semplice, misurato e sempre aggiornato in tempo reale.',
  },
  ordering: {
    eyebrow: 'Carta disponibile oggi',
    title: 'Scegli con calma, aggiungi al carrello, conferma in pochi passaggi.',
    intro:
      'La selezione online segue la disponibilita reale del servizio serale. Ogni richiesta entra subito nel flusso operativo, pronta per la conferma della sala.',
    pickupEstimate: 'Ritiro indicativo: 25-35 minuti dal momento della conferma.',
    deliveryEstimate: 'Consegna indicativa: 35-45 minuti, in base alla fascia e alla zona.',
    emptyCartTitle: 'Il carrello e ancora vuoto.',
    emptyCartBody: 'Aggiungi dalla carta i piatti che desideri e costruisci il tuo ordine con calma.',
    successEyebrow: 'Ordine ricevuto',
    successTitle: 'La richiesta e stata registrata correttamente.',
    successBody:
      'Ti ricontatteremo se serviranno dettagli aggiuntivi o conferme sull orario richiesto.',
  },
  aboutPage: {
    eyebrow: 'Chi siamo',
    title: 'Chi siamo',
    intro:
      'Tavernetta e un ristorante italiano contemporaneo, nato per unire cucina, forno e ospitalita in un ambiente raccolto, caldo e curato.',
    scrollLabel: 'Scorri',
    story: {
      eyebrow: 'Chi siamo',
      title: 'Sforniamo pizza con amore e dedizione per questo lavoro.',
      intro:
        'Con gesti misurati riportiamo sulle tavole il legame con la nostra tradizione radicata al Sud, e con la consapevolezza dell immenso valore del territorio locale. Ogni giorno, sperimentiamo e raccontiamo tutto questo attraverso le nostre pizze, per un esperienza che non si dimentica.',
      details: [
        { label: 'Dove', value: 'San Giovanni Lupatoto' },
        { label: 'Cucina', value: 'italiana contemporanea' },
        { label: 'Stile', value: 'accoglienza misurata' },
      ],
      image: {
        src: photo('chi-siamo-squadra', 1600),
        alt: 'La squadra Tavernetta riunita attorno al tavolo',
      },
    },
    philosophy: {
      eyebrow: 'Come lavoriamo',
      title: 'Ingredienti scelti bene, lavorazioni essenziali, equilibrio.',
      pillars: [
        { title: 'Materia prima' },
        { title: 'Lavoro artigianale' },
        { title: 'Ospitalita curata' },
      ],
      image: {
        src: photo('preparazione-impasto-pizza', 1600),
        alt: 'Impasto pizza sollevato al banco durante la preparazione',
      },
    },
    team: {
      eyebrow: 'La squadra',
      title: 'Una squadra unita tra cucina e sala.',
      quote:
        'Ogni gesto nasce da un lavoro condiviso, continuo e attento.',
      highlights: [
        { label: 'Cucina', value: 'stagionale e curata' },
        { label: 'Sala', value: 'attenta e discreta' },
        { label: 'Selezione', value: 'vini e pairing in equilibrio' },
      ],
      image: {
        src: photo('brindisi-squadra-tavernetta', 1600),
        alt: 'La squadra Tavernetta brinda attorno al tavolo',
      },
    },
  },
  gallery: {
    eyebrow: 'Atmosfera',
    title: 'Sala, tavola, forno, dettagli.',
    intro:
      'Tavernetta vive di materiali morbidi, riflessi, ombre leggere e immagini che alternano sala, mani, forno e tavola apparecchiata.',
  },
  team: {
    eyebrow: 'Craft',
    title: 'Una cucina che lavora piano, con intenzione e continuita.',
    quote:
      '"Il nostro mestiere e far arrivare il gusto con chiarezza, senza appesantire la tavola."',
    body: [
      'La direzione di cucina e affidata a una squadra che viene dal forno, dalla sala e dalla cucina di ristorante. Le competenze si intrecciano in un lavoro quotidiano fatto di preparazioni pulite, ascolto e costanza.',
      'Tavernetta non ruota attorno a una firma solitaria, ma a un modo condiviso di trattare il tempo, il gusto e l accoglienza.',
    ],
    highlights: [
      { label: 'Forno acceso', value: 'ogni sera' },
      { label: 'Carta vini', value: '140 etichette' },
      { label: 'Servizio di sala', value: 'discreto e continuo' },
    ],
    image: {
      src: photo('preparazione-pizze-mani', 1600),
      alt: 'Mani al banco durante la preparazione di pizze',
    },
  },
  reservation: {
    eyebrow: 'Prenotazioni',
    title: 'Prenota una tavola per una sera lenta, calda, ben costruita.',
    intro:
      'Accogliamo tavoli intimi, cene condivise e richieste dedicate per piccoli eventi privati. Per il percorso degustazione consigliamo la prenotazione anticipata.',
    bookingLabel: 'Prenota un tavolo',
    bookingHref: 'tel:+390456111712',
    phoneCompactLabel: '0456111712',
    phoneLabel: '045 6111712',
    phoneHref: 'tel:+390456111712',
    address: 'Via Federico Garofoli, 105, 37057 San Giovanni Lupatoto VR',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Via+Federico+Garofoli+105,+37057+San+Giovanni+Lupatoto+VR',
    mapEmbedUrl:
      'https://www.google.com/maps?q=Via%20Federico%20Garofoli%2C%20105%2C%2037057%20San%20Giovanni%20Lupatoto%20VR&z=16&output=embed',
    hours: [
      { day: 'Martedi - Domenica', time: '19:00 - 22:00' },
      { day: 'Lunedi', time: 'Chiuso' },
    ],
  },
  locationSection: {
    eyebrow: 'Dove siamo',
    title: 'Ci trovi qui',
    intro: 'Via Federico Garofoli, 105, 37057 San Giovanni Lupatoto VR',
  },
  contact: {
    eyebrow: 'Contatti',
    title: 'Contatti e orari.',
    intro: 'Qui trovi subito telefono, WhatsApp, orari e indicazioni per raggiungerci senza passaggi inutili.',
    mapTitle: 'Raggiungici a San Giovanni Lupatoto.',
    mapDescription:
      'Uno spazio raccolto, facile da raggiungere, pensato per una cena calma e curata.',
  },
};

export const previewCategories = [
  {
    index: '01',
    title: 'Starter',
  },
  {
    index: '02',
    title: 'Le Pizze',
  },
  {
    index: '03',
    title: 'I Calzoni',
  },
  {
    index: '04',
    title: 'In Fritteria',
  },
];

export const galleryItems = [
  {
    title: 'Squadra',
    caption: 'La squadra riunita attorno al tavolo, tra pizze, bottiglie e servizio condiviso.',
    layout: 'large',
    image: {
      src: photo('chi-siamo-squadra', 1600),
      alt: 'Squadra Tavernetta riunita attorno al tavolo',
    },
  },
  {
    title: 'Forno e impasto',
    caption: 'Temperatura controllata, bordo arioso, cotture nitide e una struttura sempre leggera.',
    layout: 'tall',
    image: {
      src: photo('pizza-forno-margherita', 1200),
      alt: 'Pizza margherita in cottura nel forno',
    },
  },
  {
    title: 'Gesto al banco',
    caption: 'La mano resta visibile, dal pomodoro al basilico, fino alla cottura finale.',
    layout: 'standard',
    image: {
      src: photo('dettaglio-pizza-pomodoro-basilico', 1200),
      alt: 'Mano che aggiunge pomodorini e basilico su una pizza',
    },
  },
];

export const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'WhatsApp', href: 'https://wa.me/390255012486' },
];
