# Tavernetta

Sito multipagina editoriale per un ristorante italiano contemporaneo, costruito con React, Vite, React Router ed un backend locale `Express + SQLite`. La parte marketing mantiene il tono premium del progetto; la parte ordini usa un database reale file-based, adatto a un hosting casalingo o su una macchina privata.

## Cosa include

- Home editoriale con hero carousel full screen
- Pagina `Menu` alimentata da SQLite
- Pagina `Chi siamo`
- Pagina `Ordina` con consultazione menu, carrello, checkout guest e persistenza reale
- API locali `/api/menu`, `/api/orders`, `/api/customers`
- Database relazionale con `categories`, `menu_items`, `customers`, `orders`, `order_items`
- Seed iniziale automatico con dati demo Tavernetta
- Architettura pronta per un futuro pannello admin

## File structure

```text
.
|-- .env.example
|-- README.md
|-- database/
|   |-- schema.sql
|   `-- seed.sql
|-- index.html
|-- package.json
|-- public/
|   `-- favicon.svg
|-- server/
|   |-- db/
|   |   `-- database.js
|   |-- index.js
|   |-- scripts/
|   |   `-- resetDatabase.js
|   |-- services/
|   |   |-- customerService.js
|   |   |-- menuService.js
|   |   `-- orderService.js
|   `-- utils/
|       |-- calculateTotals.js
|       `-- httpError.js
|-- src/
|   |-- App.jsx
|   |-- assets/
|   |   `-- linen.svg
|   |-- components/
|   |   |-- Button.jsx
|   |   |-- CursorFollower.jsx
|   |   |-- Footer.jsx
|   |   |-- Header.jsx
|   |   |-- HeroCarousel.jsx
|   |   |-- MenuCatalogSkeleton.jsx
|   |   |-- MobileMenu.jsx
|   |   |-- PageIntro.jsx
|   |   |-- QuantityControl.jsx
|   |   |-- Reveal.jsx
|   |   |-- ScrollManager.jsx
|   |   |-- SectionTitle.jsx
|   |   |-- SiteLayout.jsx
|   |   `-- StatusPanel.jsx
|   |-- context/
|   |   `-- CartContext.jsx
|   |-- data/
|   |   `-- siteContent.js
|   |-- hooks/
|   |   `-- useMenuCatalog.js
|   |-- lib/
|   |   `-- apiClient.js
|   |-- pages/
|   |   |-- ChiSiamoPage.jsx
|   |   |-- HomePage.jsx
|   |   |-- MenuPage.jsx
|   |   `-- OrderPage.jsx
|   |-- sections/
|   |   |-- AboutSection.jsx
|   |   |-- ContactSection.jsx
|   |   |-- FullMenuSection.jsx
|   |   |-- GallerySection.jsx
|   |   |-- HeroSection.jsx
|   |   |-- MenuPreviewSection.jsx
|   |   |-- OrderExperienceSection.jsx
|   |   |-- PhilosophySection.jsx
|   |   |-- ReservationSection.jsx
|   |   |-- StorySection.jsx
|   |   `-- TeamSection.jsx
|   |-- services/
|   |   |-- customerService.js
|   |   |-- menuService.js
|   |   `-- orderService.js
|   |-- styles/
|   |   |-- components.css
|   |   |-- layout.css
|   |   |-- ordering.css
|   |   |-- sections.css
|   |   `-- theme.css
|   |-- utils/
|   |   |-- calculateCartTotals.js
|   |   |-- formatPrice.js
|   |   `-- validators.js
|   `-- main.jsx
`-- vite.config.js
```

## Installazione

```bash
npm install
```

## Configurazione

1. Copia `.env.example` in `.env`.
2. Imposta i valori desiderati:

```bash
PORT=3001
DATABASE_FILE=./data/tavernetta.sqlite
```

Note:

- `PORT` e la porta del server API locale.
- `DATABASE_FILE` e il percorso del file SQLite.
- `VITE_API_BASE_URL` serve solo se frontend e backend girano su host diversi. Se usi il proxy Vite o servi tutto dallo stesso server, puoi lasciarlo assente.

## Sviluppo locale

Avvia frontend Vite e server SQLite insieme:

```bash
npm run dev
```

Il frontend gira su `http://localhost:5173` e il backend API su `http://localhost:3001`.

## Build produzione

```bash
npm run build
```

## Avvio produzione

Serve la build React e le API dallo stesso server Express:

```bash
npm start
```

## Reset del database

Per rigenerare il file SQLite da zero:

```bash
npm run db:reset
```

Al successivo avvio del server, schema e seed verranno applicati automaticamente.

## Come funziona il database

All avvio del server:

1. viene creato il file SQLite se non esiste
2. viene applicato `database/schema.sql`
3. se il database e vuoto, viene applicato `database/seed.sql`

Le tabelle principali sono:

- `categories`
- `menu_items`
- `customers`
- `orders`
- `order_items`

`order_items` salva anche gli snapshot di nome e prezzo, cosi gli ordini storici restano coerenti anche se la carta cambia.

## API disponibili

- `GET /api/health`
- `GET /api/menu`
- `GET /api/customers/lookup?phone=...`
- `POST /api/customers`
- `POST /api/orders`

## Flusso ordine

1. Il frontend legge categorie e piatti disponibili da SQLite.
2. L utente compone il carrello localmente.
3. Il checkout valida nome, telefono, tipo ordine, indirizzo se necessario e disponibilita corrente.
4. Il frontend invia `POST /api/orders`.
5. Il server:
   - crea o aggiorna il cliente
   - rilegge i prezzi dal database
   - calcola subtotal, delivery fee e total
   - crea l ordine con stato iniziale `pending`
   - salva tutte le righe in `order_items`
6. Il frontend mostra una conferma elegante e svuota il carrello.

## Personalizzazione rapida

- Copy editoriale, immagini e contenuti marketing: `src/data/siteContent.js`
- Schema e seed SQLite: `database/schema.sql`, `database/seed.sql`
- API client frontend: `src/lib/apiClient.js`
- Logica dati frontend: `src/services/`
- Logica dati backend: `server/services/`
- Carrello e stato locale ordine: `src/context/CartContext.jsx`
- UI ordine: `src/pages/OrderPage.jsx`, `src/sections/OrderExperienceSection.jsx`
