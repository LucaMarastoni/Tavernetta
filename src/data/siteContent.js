const localEditorialPhotoIds = new Set([
  'photo-1414235077428-338989a2e8c0',
  'photo-1470337458703-46ad1756a187',
  'photo-1498654896293-37aacf113fd9',
  'photo-1504674900247-0877df9cc836',
  'photo-1513104890138-7c749659a591',
  'photo-1514933651103-005eec06c04b',
  'photo-1517248135467-4c7edcad34c4',
  'photo-1544025162-d76694265947',
  'photo-1552566626-52f8b828add9',
  'photo-1559339352-11d035aa65de',
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
    src: photo('photo-1517248135467-4c7edcad34c4', 2400),
    alt: 'Sala di ristorante elegante con luce calda e tavoli ben distanziati',
  },
  {
    src: photo('photo-1414235077428-338989a2e8c0', 2400),
    alt: 'Tavolo apparecchiato in un ambiente italiano raffinato e luminoso',
  },
  {
    src: photo('photo-1470337458703-46ad1756a187', 2400),
    alt: 'Calici e dettagli di sala in una luce serale ambrata',
  },
  {
    src: photo('photo-1498654896293-37aacf113fd9', 2400),
    alt: 'Piatto curato con impiattamento minimale su tavolo materico',
  },
];

export const aboutPageSlides = [
  {
    src: photo('photo-1552566626-52f8b828add9', 2400),
    alt: 'Interno caldo di ristorante con tavoli ben distanziati e luce serale morbida',
  },
  {
    src: photo('photo-1514933651103-005eec06c04b', 2400),
    alt: 'Dettaglio di sala elegante con tavolo apparecchiato e riflessi ambrati',
  },
  {
    src: photo('photo-1559339352-11d035aa65de', 2400),
    alt: 'Gestualita di cucina e cura artigianale nella rifinitura di un piatto',
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
    title: 'Luce morbida, tavoli larghi, una sala raccolta.',
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
      src: photo('photo-1504674900247-0877df9cc836', 1600),
      alt: 'Ingredienti e piccoli piatti preparati con sensibilita contemporanea',
    },
  },
  philosophy: {
    eyebrow: 'Filosofia',
    title: 'Forno vivo, materia precisa, gesto misurato.',
    intro:
      "La cucina di Tavernetta non cerca effetti. Preferisce nettezza, temperatura giusta, condimenti essenziali e un ritmo di servizio che lascia respirare il tavolo.",
    quote:
      '"Vogliamo che ogni piatto lasci una traccia precisa, non un rumore in piu."',
    body: [
      "Gli impasti maturano lentamente, i topping si costruiscono con pochi elementi leggibili, i piatti stagionali seguono la disponibilita vera degli ingredienti e la cantina accompagna senza sovraccaricare.",
      "Anche l'esperienza in sala nasce dalla stessa idea: eleganza composta, accoglienza naturale, cura continua e nessun gesto superfluo.",
    ],
    pillars: [
      {
        title: 'Impasti lenti',
        description: 'Idratazione alta, leggerezza in morso e una cottura sempre asciutta.',
      },
      {
        title: 'Materia nitida',
        description: 'Pochi ingredienti, stagionalita vera e sapori leggibili fino in fondo.',
      },
      {
        title: 'Sala misurata',
        description: 'Presenza discreta, passo quieto e attenzione costante ai dettagli.',
      },
    ],
    image: {
      src: photo('photo-1544025162-d76694265947', 1600),
      alt: 'Dettaglio di una preparazione raffinata in cucina con gesto preciso',
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
      src: photo('photo-1414235077428-338989a2e8c0', 1600),
      alt: 'Sala elegante con tavolo apparecchiato e luce soffusa',
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
      src: photo('photo-1513104890138-7c749659a591', 1600),
      alt: 'Pizza artigianale appena sfornata con luce calda e taglio editoriale',
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
      'La selezione online segue la disponibilita reale del servizio serale. Ogni richiesta entra subito nel flusso di cucina con stato iniziale pending, pronta per la conferma della sala.',
    pickupEstimate: 'Ritiro indicativo: 25-35 minuti dal momento della conferma.',
    deliveryEstimate: 'Consegna indicativa: 35-45 minuti, in base alla fascia e alla zona.',
    emptyCartTitle: 'Il carrello e ancora vuoto.',
    emptyCartBody: 'Aggiungi dalla carta i piatti che desideri e costruisci il tuo ordine con calma.',
    successEyebrow: 'Ordine ricevuto',
    successTitle: 'La richiesta e stata registrata correttamente.',
    successBody:
      'Ti ricontatteremo se serviranno dettagli aggiuntivi. Lo stato iniziale dell ordine e pending, in attesa della conferma da parte della sala.',
  },
  aboutPage: {
    eyebrow: 'Chi siamo',
    title: 'Chi siamo',
    intro:
      'Tavernetta e un ristorante italiano contemporaneo, nato per unire cucina, forno e ospitalita in un ambiente raccolto, caldo e curato.',
    scrollLabel: 'Scorri',
    story: {
      eyebrow: 'Il ristorante',
      title: 'Un luogo raccolto, pensato per stare bene a tavola.',
      intro:
        'Tavernetta unisce cucina, forno e sala in un esperienza semplice, curata e naturale.',
      details: [
        { label: 'Dove', value: 'San Giovanni Lupatoto' },
        { label: 'Cucina', value: 'italiana contemporanea' },
        { label: 'Stile', value: 'accoglienza misurata' },
      ],
      image: {
        src: photo('photo-1414235077428-338989a2e8c0', 1600),
        alt: 'Sala elegante con tavolo apparecchiato e luce soffusa',
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
        src: photo('photo-1544025162-d76694265947', 1600),
        alt: 'Dettaglio di una preparazione raffinata in cucina con gesto preciso',
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
        src: photo('photo-1559339352-11d035aa65de', 1600),
        alt: 'Mani in cucina durante la finitura di un piatto con gesto misurato',
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
      src: photo('photo-1559339352-11d035aa65de', 1600),
      alt: 'Mani in cucina durante la finitura di un piatto con gesto misurato',
    },
  },
  reservation: {
    eyebrow: 'Prenotazioni',
    title: 'Prenota una tavola per una sera lenta, calda, ben costruita.',
    intro:
      'Accogliamo tavoli intimi, cene condivise e richieste dedicate per piccoli eventi privati. Per il percorso degustazione consigliamo la prenotazione anticipata.',
    bookingLabel: 'Prenota un tavolo',
    bookingHref: 'tel:+390456111712',
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
    title: 'Le Pizze',
    description:
      'Le rosse della casa, dai grandi classici alle combinazioni piu personali e identitarie.',
    price: '5,85',
  },
  {
    index: '02',
    title: 'Le Bianche',
    description:
      'Pizze senza pomodoro, piu cremose e avvolgenti, con una lettura netta degli ingredienti.',
    price: '9,30',
  },
  {
    index: '03',
    title: 'Le Speciali',
    description:
      'Le proposte piu distintive di Tavernetta, tra ripiene, mare, mortadella e richiami di territorio.',
    price: '11,00',
  },
  {
    index: '04',
    title: 'I Calzoni',
    description:
      'Versioni chiuse, piu golose e sostanziose, pensate per chi cerca una pizza dal carattere pieno.',
    price: '9,40',
  },
  {
    index: '05',
    title: 'Fritteria',
    description:
      'Calzoni fritti con anima popolare e gusto deciso, da scegliere quando vuoi qualcosa di piu sfizioso.',
    price: '9,10',
  },
];

export const galleryItems = [
  {
    title: 'Sala serale',
    caption: 'Tavoli larghi, luce soffusa, vetro sottile e un ritmo di sala molto quieto.',
    layout: 'large',
    image: {
      src: photo('photo-1414235077428-338989a2e8c0', 1600),
      alt: 'Tavolo apparecchiato in una sala ristorante elegante',
    },
  },
  {
    title: 'Forno e impasto',
    caption: 'Temperatura controllata, bordo arioso, cotture nitide e una struttura sempre leggera.',
    layout: 'tall',
    image: {
      src: photo('photo-1513104890138-7c749659a591', 1200),
      alt: 'Pizza artigianale appena sfornata su tavolo scuro',
    },
  },
  {
    title: 'Piatti di stagione',
    caption: 'Verdure, fondi leggeri e una costruzione che lascia spazio a ogni ingrediente.',
    layout: 'wide',
    image: {
      src: photo('photo-1498654896293-37aacf113fd9', 1600),
      alt: 'Piatto raffinato con ingredienti stagionali su tavolo in legno',
    },
  },
  {
    title: 'Vetri e riflessi',
    caption: 'Calici, ombre e superfici ambrate compongono una scena volutamente silenziosa.',
    layout: 'standard',
    image: {
      src: photo('photo-1470337458703-46ad1756a187', 1200),
      alt: 'Calici e luce calda in un ambiente ristorante contemporaneo',
    },
  },
  {
    title: 'Gesto in cucina',
    caption: 'La mano resta visibile, ma il segno finale rimane sempre pulito e misurato.',
    layout: 'standard',
    image: {
      src: photo('photo-1559339352-11d035aa65de', 1200),
      alt: 'Cucina professionale con preparazione artigianale di un piatto',
    },
  },
];

export const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'WhatsApp', href: 'https://wa.me/390255012486' },
];
