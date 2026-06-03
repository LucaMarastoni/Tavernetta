import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SEO = {
  title: 'Tavernetta | Pizzeria e ristorante a San Giovanni Lupatoto',
  description:
    'Tavernetta a San Giovanni Lupatoto: pizzeria e ristorante italiano contemporaneo con impasti lenti, pizze curate, starter, calzoni, vini selezionati e ordini online.',
  image: '/images/editorial/pizza-speciale-lattine-tavolo.jpg',
  robots: 'index, follow, max-image-preview:large',
};

const SEO_BY_PATH = {
  '/': DEFAULT_SEO,
  '/menu': {
    title: 'Menu Tavernetta | Pizze, starter, calzoni e vini',
    description:
      'Scopri il menu di Tavernetta: starter, pizze, calzoni, fritti, dolci, birre e vini selezionati a San Giovanni Lupatoto.',
    image: '/images/editorial/tavolo-staff-pizza-vertical.jpg',
    robots: DEFAULT_SEO.robots,
  },
  '/menu/pizze': {
    title: 'Listino pizze Tavernetta | Ordina online',
    description:
      'Consulta il listino Tavernetta, cerca pizze per nome o ingrediente, personalizza il tuo ordine e invialo online.',
    image: '/images/editorial/pizza-forno-margherita.jpg',
    robots: DEFAULT_SEO.robots,
  },
  '/ordina': {
    title: 'Ordina online | Tavernetta San Giovanni Lupatoto',
    description:
      'Ordina online da Tavernetta: scegli pizze, starter e calzoni dal menu aggiornato e invia la richiesta in pochi passaggi.',
    image: '/images/editorial/pizza-speciale-lattine-tavolo.jpg',
    robots: DEFAULT_SEO.robots,
  },
  '/chi-siamo': {
    title: 'Chi siamo | Tavernetta',
    description:
      'Conosci Tavernetta: pizzeria e ristorante italiano contemporaneo a San Giovanni Lupatoto, tra impasti lenti, materia prima e ospitalita curata.',
    image: '/images/editorial/chi-siamo-squadra.jpg',
    robots: DEFAULT_SEO.robots,
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Tavernetta',
    description: 'Informativa privacy del sito Tavernetta.',
    image: DEFAULT_SEO.image,
    robots: 'noindex, follow',
  },
  '/cookie-policy': {
    title: 'Cookie Policy | Tavernetta',
    description: 'Informativa cookie del sito Tavernetta.',
    image: DEFAULT_SEO.image,
    robots: 'noindex, follow',
  },
};

function getAbsoluteUrl(path) {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

function setMetaAttribute(selectorAttribute, name, value) {
  let element = document.head.querySelector(`meta[${selectorAttribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(selectorAttribute, name);
    document.head.append(element);
  }

  element.setAttribute('content', value);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.append(element);
  }

  element.setAttribute('href', url);
}

function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, '') || '/';
    const routeSeo = pathname.startsWith('/admin')
      ? {
          title: 'Area admin | Tavernetta',
          description: 'Area riservata Tavernetta.',
          image: DEFAULT_SEO.image,
          robots: 'noindex, nofollow',
        }
      : SEO_BY_PATH[pathname] ?? DEFAULT_SEO;
    const canonicalUrl = getAbsoluteUrl(`${pathname}${location.search}`);
    const imageUrl = getAbsoluteUrl(routeSeo.image);

    document.title = routeSeo.title;
    setCanonical(canonicalUrl);

    setMetaAttribute('name', 'description', routeSeo.description);
    setMetaAttribute('name', 'robots', routeSeo.robots);
    setMetaAttribute('property', 'og:title', routeSeo.title);
    setMetaAttribute('property', 'og:description', routeSeo.description);
    setMetaAttribute('property', 'og:url', canonicalUrl);
    setMetaAttribute('property', 'og:image', imageUrl);
    setMetaAttribute('name', 'twitter:title', routeSeo.title);
    setMetaAttribute('name', 'twitter:description', routeSeo.description);
    setMetaAttribute('name', 'twitter:image', imageUrl);
  }, [location.pathname, location.search]);

  return null;
}

export default SeoManager;
