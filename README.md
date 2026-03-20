# Tavernetta

Sito multipagina editoriale per un ristorante italiano contemporaneo, costruito con React, Vite e React Router. Il progetto mette al centro un hero carousel full-screen senza copy in overlay, una tipografia guidata da Poiret One e una composizione visiva calda, rarefatta e premium.

## Design concept

- Brand originale: `Tavernetta`, con tono elegante, quieto e contemporaneo.
- Hero iniziale a tutta altezza con carousel immersivo, solo immagini e controlli minimali.
- Poiret One come display font e identita del progetto, con scala tipografica controllata tramite `clamp()`.
- Palette calda di avorio, champagne, espresso, terracotta polverosa e sabbia.
- Header trasparente sopra il hero della home e piu solido sulle pagine interne o su scroll.
- Architettura multipagina con React Router: `Home`, `Menu` e `Chi siamo`.
- Menu editoriale dedicato, con categorie, prezzi allineati e navigazione laterale sticky su desktop.
- Chi siamo costruita come racconto di atmosfera, storia, filosofia e craft.
- Reveal on scroll discreti, hover morbidi, mobile menu essenziale e interazioni misurate.

## File structure

```text
.
|-- README.md
|-- index.html
|-- package.json
|-- public/
|   |-- 404.html
|   `-- favicon.svg
|-- src/
|   |-- App.jsx
|   |-- assets/
|   |   `-- linen.svg
|   |-- components/
|   |   |-- Button.jsx
|   |   |-- CarouselControls.jsx
|   |   |-- Footer.jsx
|   |   |-- Header.jsx
|   |   |-- HeroCarousel.jsx
|   |   |-- MobileMenu.jsx
|   |   |-- PageIntro.jsx
|   |   |-- Reveal.jsx
|   |   |-- ScrollManager.jsx
|   |   |-- SectionTitle.jsx
|   |   `-- SiteLayout.jsx
|   |-- data/
|   |   `-- siteContent.js
|   |-- main.jsx
|   |-- pages/
|   |   |-- ChiSiamoPage.jsx
|   |   |-- HomePage.jsx
|   |   `-- MenuPage.jsx
|   |-- sections/
|   |   |-- AboutSection.jsx
|   |   |-- ContactSection.jsx
|   |   |-- FullMenuSection.jsx
|   |   |-- GallerySection.jsx
|   |   |-- HeroSection.jsx
|   |   |-- MenuPreviewSection.jsx
|   |   |-- PhilosophySection.jsx
|   |   |-- ReservationSection.jsx
|   |   |-- StorySection.jsx
|   |   `-- TeamSection.jsx
|   `-- styles/
|       |-- components.css
|       |-- layout.css
|       |-- sections.css
|       `-- theme.css
`-- vite.config.js
```

## Installazione

```bash
npm install
```

## Sviluppo locale

```bash
npm run dev
```

## Build produzione

```bash
npm run build
```

## Preview della build

```bash
npm run preview
```

## Deploy su GitHub Pages

Il progetto usa `BrowserRouter` ed e configurato per il deploy statico su GitHub Pages con fallback SPA tramite `public/404.html`.

### Caso standard

Se il repository si chiama `Tavernetta`, puoi pubblicare direttamente con:

```bash
npm run deploy
```

### Repository con nome diverso

Se il repository GitHub ha un nome differente, imposta il base path prima della build:

```bash
GITHUB_PAGES_BASE=/nome-repo/ npm run build
GITHUB_PAGES_BASE=/nome-repo/ npm run deploy
```

### Note tecniche

- `vite.config.js` usa `GITHUB_PAGES_BASE` oppure, di default, `/Tavernetta/`.
- `public/404.html` reindirizza le route profonde verso l entry point dell app per supportare React Router su hosting statico.
- `index.html` ripristina la route corretta dopo il redirect di GitHub Pages.

## Personalizzazione rapida

- Contenuti, immagini hero, menu, contatti e social: `src/data/siteContent.js`
- Pagine: `src/pages/`
- Sezioni riusabili: `src/sections/`
- Componenti condivisi: `src/components/`
- Token visivi, font e scala tipografica: `src/styles/theme.css`
- Layout e responsive system: `src/styles/layout.css` e `src/styles/sections.css`

## Note

- Le immagini sono placeholder royalty-free via URL e sono centralizzate in `src/data/siteContent.js` per essere sostituite facilmente.
- Il hero carousel supporta autoplay, navigazione manuale e swipe su mobile.
- La home mantiene un intro visuale senza testo in overlay; i contenuti iniziano solo dopo il hero.
