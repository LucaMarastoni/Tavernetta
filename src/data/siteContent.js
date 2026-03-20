const photo = (id, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

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

export const restaurant = {
  name: 'Tavernetta',
  location: 'Milano',
  label: 'Ristorante italiano contemporaneo',
  hero: {
    scrollLabel: 'Scorri',
    orderCta: {
      label: 'Ordina ora',
      to: '/menu',
    },
  },
  about: {
    eyebrow: 'Atmosfera',
    title: 'Una sala pensata per rallentare il passo e dare spazio alla sera.',
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
      label: 'Scopri chi siamo',
      to: '/chi-siamo',
    },
    note: 'Luce calda, forno vivo, sala quieta, materia italiana scelta giorno per giorno.',
    image: {
      src: photo('photo-1504674900247-0877df9cc836', 1600),
      alt: 'Ingredienti e piccoli piatti preparati con sensibilita contemporanea',
    },
  },
  philosophy: {
    eyebrow: 'Filosofia',
    title: 'Il gusto arriva per sottrazione: forno, materia, ospitalita.',
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
    eyebrow: 'Menu preview',
    title: 'Una carta composta come una sequenza: aperture, forno, piatti, finali, calici.',
    intro:
      'La struttura del menu segue il ritmo della cena, non l accumulo. Ogni categoria ha un tono preciso e una funzione nel percorso della tavola.',
    cta: {
      label: 'Vai al menu completo',
      to: '/menu',
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
  aboutPage: {
    eyebrow: 'Chi siamo',
    title: 'Chi siamo',
    intro:
      'Tavernetta e una casa di gusto e accoglienza italiana contemporanea: un progetto costruito su luce, misura, forno e una relazione autentica con il tempo della cena.',
  },
  gallery: {
    eyebrow: 'Atmosfera',
    title: 'Interni caldi, dettagli di tavola, cucina in luce serale.',
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
    bookingHref:
      'mailto:prenotazioni@tavernetta-milano.it?subject=Richiesta%20prenotazione%20Tavernetta',
    phoneLabel: '+39 02 5501 2486',
    phoneHref: 'tel:+390255012486',
    emailLabel: 'prenotazioni@tavernetta-milano.it',
    emailHref: 'mailto:prenotazioni@tavernetta-milano.it',
    address: 'Via San Calocero 8, 20123 Milano',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Via+San+Calocero+8,+Milano',
    hours: [
      { day: 'Martedi - Giovedi', time: '19:00 - 23:00' },
      { day: 'Venerdi - Sabato', time: '19:00 - 00:00' },
      { day: 'Domenica', time: '12:30 - 15:00 / 19:00 - 22:30' },
      { day: 'Lunedi', time: 'Chiuso' },
    ],
  },
  contact: {
    eyebrow: 'Contatti',
    title: 'Una tavola raccolta nel cuore di Milano.',
    intro:
      'Scrivici per prenotazioni, eventi privati, pairing dedicati o collaborazioni. Le informazioni restano semplici, leggibili e sempre vicine.',
    mapTitle: 'Raggiungici tra corti milanesi, pietra chiara e luce bassa.',
    mapDescription:
      'Una posizione centrale ma raccolta, ideale per una cena lenta o un incontro riservato dopo il tramonto.',
  },
};

export const previewCategories = [
  {
    index: '01',
    title: 'Degustazione',
    description:
      'Un percorso in cinque passaggi tra forno, piccoli piatti stagionali e un finale pulito.',
    price: '65',
  },
  {
    index: '02',
    title: 'Pizze gourmet',
    description:
      'Impasti maturati a lungo, condimenti leggibili, struttura sottile e grande digeribilita.',
    price: '18',
  },
  {
    index: '03',
    title: 'Specialita',
    description:
      'Verdure, crudi, brace leggera e piatti pensati per aprire o accompagnare la tavola.',
    price: '15',
  },
  {
    index: '04',
    title: 'Dessert',
    description:
      'Finali lattici, agrumi, cacao e tessiture morbide, sempre con una dolcezza trattenuta.',
    price: '11',
  },
  {
    index: '05',
    title: 'Bevande e vini',
    description:
      'Calici italiani, bottiglie in movimento, pairing dedicati e signature drink a bassa voce.',
    price: '9',
  },
];

export const menuCategories = [
  {
    id: 'degustazione',
    name: 'Degustazione',
    note: 'Per l intero tavolo',
    description: 'Un percorso pensato per accompagnare la sera con progressione e leggerezza.',
    items: [
      {
        name: 'Percorso Tavernetta',
        description:
          'Cinque passaggi tra forno, vegetali, una portata calda di cucina e un dessert finale.',
        allergens: 'glutine, lattosio',
        price: '65',
      },
      {
        name: 'Abbinamento vini',
        description: 'Tre calici scelti dalla sala per accompagnare il percorso con progressione netta.',
        price: '34',
      },
      {
        name: 'Abbinamento analcolico',
        description:
          'Infusi, agrumi, botaniche e fermentazioni leggere costruite come un pairing completo.',
        price: '24',
      },
    ],
  },
  {
    id: 'gourmet',
    name: 'Pizze gourmet',
    note: 'Forno, struttura, leggerezza',
    description: 'Cotture vive, bordo arioso e condimenti pensati per lasciare il morso pulito.',
    items: [
      {
        name: 'Bianca di cortile',
        description: 'Fior di latte, zucchine marinate, menta, scorza di limone e pepe bianco.',
        allergens: 'glutine, lattosio',
        price: '21',
      },
      {
        name: 'Rosso velluto',
        description: 'Pomodoro arrosto, stracciatella, alici, polvere di capperi e origano selvatico.',
        allergens: 'glutine, pesce, lattosio',
        price: '24',
      },
      {
        name: 'Fumo gentile',
        description: 'Provola affumicata, cardoncelli, cipolla bruna e prezzemolo fresco.',
        allergens: 'glutine, lattosio',
        price: '23',
      },
      {
        name: 'Autunno chiaro',
        description: 'Crema di zucca, caprino soffice, semi di finocchio e nocciola tostata.',
        allergens: 'glutine, lattosio, frutta a guscio',
        price: '22',
      },
    ],
  },
  {
    id: 'specialita',
    name: 'Specialita',
    note: 'Piccoli piatti e stagionali',
    description: 'Portate pensate per aprire la tavola o attraversarla con una presenza discreta.',
    items: [
      {
        name: 'Carciofo arrosto, limone bruciato e maggiorana',
        description: 'Vegetale pieno, salsa chiara e finale erbaceo molto netto.',
        allergens: 'sedano',
        price: '18',
      },
      {
        name: 'Ricciola, finocchio e olio alle foglie di fico',
        description: 'Taglio pulito, acidita tenue, profilo verde e salinita misurata.',
        allergens: 'pesce',
        price: '21',
      },
      {
        name: 'Vitello tonnato lieve',
        description: 'Fettine rosee, salsa setosa, capperi piccoli e fondo molto asciutto.',
        allergens: 'uova, pesce',
        price: '19',
      },
      {
        name: 'Patata fondente, robiola e timo limonato',
        description: 'Calore, cremosita e un finale aromatico pulito e sottile.',
        allergens: 'lattosio',
        price: '16',
      },
    ],
  },
  {
    id: 'dessert',
    name: 'Dessert',
    note: 'Finali sobri',
    description: 'Dessert pensati per chiudere con pulizia, non con eccesso.',
    items: [
      {
        name: 'Crema cotta al fieno, pere e moscovado',
        description: 'Tessitura morbida, lieve affumicatura e frutto in primo piano.',
        allergens: 'lattosio',
        price: '12',
      },
      {
        name: "Torta soffice all'olio, agrumi canditi e crema cruda",
        description: 'Profumo mediterraneo, dolcezza trattenuta e texture estremamente leggera.',
        allergens: 'glutine, uova, lattosio',
        price: '11',
      },
      {
        name: 'Gelato al latte affumicato, cacao e sale dolce',
        description: 'Freddo, tostato, lattico e minerale in una chiusura breve e nitida.',
        allergens: 'lattosio',
        price: '13',
      },
    ],
  },
  {
    id: 'wine',
    name: 'Bevande e vini',
    note: 'Calici, pairing, signature',
    description: 'Una bevuta costruita con la stessa calma della cucina.',
    items: [
      {
        name: 'Calice del giorno',
        description: 'Una selezione che cambia spesso, sempre costruita per precisione e bevibilita.',
        price: '9',
      },
      {
        name: 'Metodo classico lombardo',
        description: 'Bolla fine, sorso teso e una chiusura salina ideale per il forno.',
        price: '14',
      },
      {
        name: 'Rosso in affinamento',
        description: 'Profilo sottile, tannino lieve e una presenza che accompagna senza coprire.',
        price: '12',
      },
      {
        name: 'Tavernetta Sera',
        description: 'Signature drink con vermouth bianco, agrumi, erbe secche e soda limpida.',
        price: '15',
      },
    ],
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
