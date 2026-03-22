# Tavernetta

Esperienza menu e ordering per un ristorante italiano premium, costruita con `React + Vite` sul frontend e `Express + SQLite` sul backend. Il focus del progetto e una navigazione mobile-first della carta, con personalizzazione sicura delle pizze, carrello persistente e checkout guest pronto per futuri strumenti admin.

## Cosa include

- Pagina `/menu` come flusso principale di ordering
- Pagina `/ordina` per revisione carrello e checkout
- Banner cookie con consenso granulare e riapertura preferenze dal footer
- Privacy Policy e Cookie Policy dedicate
- Caricamento condizionale degli script opzionali e blocco preventivo dei servizi non essenziali
- Google Fonts in self-hosting locale per evitare richieste automatiche a terze parti
- Personalizzazione pizze con ingredienti rimovibili, extra e varianti
- Pricing client live e ricalcolo server-side obbligatorio
- Persistenza locale di carrello e order draft
- SQLite con schema relazionale pronto per dashboard ordini e gestione menu
- API REST per catalogo, dettagli prodotto, personalizzazione e invio ordini
- Seed demo realistico Tavernetta con antipasti, pizze, dessert e bevande

## Architettura

### Frontend

- `src/pages/MenuPage.jsx`
  `/menu` gestisce category chips, lista prodotti, drawer di personalizzazione, sticky cart mobile e sidebar carrello desktop.
- `src/pages/OrderPage.jsx`
  `/ordina` riusa lo stesso stato globale per mostrare riepilogo, form checkout e conferma ordine.
- `src/context/CartContext.jsx`
  conserva linee carrello personalizzate e order draft in `localStorage`.
- `src/context/CookieContext.jsx`
  gestisce stato del consenso, banner iniziale, modal preferenze e persistenza delle scelte.
- `src/utils/cart.js`
  definisce identity delle linee, migrazione storage e riepiloghi personalizzazioni.
- `src/utils/consentStorage.js`
  centralizza schema del consenso, categorie cookie e lettura/scrittura sicura delle preferenze.
- `src/utils/pricing.js`
  calcola prezzi line item e totali ordine lato client.
- `src/services/menuApi.js`, `src/services/orderApi.js`
  centralizzano il dialogo con il backend.
- `src/components/cookie/`
  contiene banner, modal preferenze e manager dei servizi opzionali caricati solo dopo consenso.
- `src/pages/PrivacyPolicy.jsx`, `src/pages/CookiePolicy.jsx`
  espongono le pagine legali collegate dal footer e dal banner.

### Backend

- `server/routes/`
  espone endpoint REST separati per `categories`, `menu`, `orders` e proxy media server-side.
- `server/services/menuService.js`
  compone catalogo, dettagli prodotto e struttura di personalizzazione.
- `server/services/pricingService.js`
  valida varianti/extra/ingredienti rimossi e ricalcola il prezzo finale.
- `server/services/orderService.js`
  valida il payload ordine, salva snapshot in `orders` e `order_items`.
- `server/db/database.js`
  inizializza SQLite, applica schema/seed e gestisce reset pulito dei sidecar `-wal` e `-shm`.

## File structure

```text
.
|-- database/
|   |-- schema.sql
|   `-- seed.sql
|-- server/
|   |-- db/
|   |   `-- database.js
|   |-- index.js
|   |-- routes/
|   |   |-- categories.js
|   |   |-- media.js
|   |   |-- menu.js
|   |   `-- orders.js
|   |-- scripts/
|   |   `-- resetDatabase.js
|   |-- services/
|   |   |-- menuService.js
|   |   |-- orderService.js
|   |   `-- pricingService.js
|   `-- utils/
|       |-- httpError.js
|       `-- validators.js
|-- src/
|   |-- components/
|   |   |-- cart/
|   |   |   |-- CartStickyBar.jsx
|   |   |   `-- CartSummary.jsx
|   |   |-- checkout/
|   |   |   `-- CheckoutForm.jsx
|   |   |-- cookie/
|   |   |   |-- ConsentScriptsManager.jsx
|   |   |   |-- CookieBanner.jsx
|   |   |   `-- CookiePreferencesModal.jsx
|   |   |-- customization/
|   |   |   `-- CustomizationDrawer.jsx
|   |   `-- menu/
|   |       |-- MenuCategoryNav.jsx
|   |       `-- MenuItemCard.jsx
|   |-- context/
|   |   |-- CartContext.jsx
|   |   `-- CookieContext.jsx
|   |-- hooks/
|   |   |-- useCookieConsent.js
|   |   `-- useMenuCatalog.js
|   |-- pages/
|   |   |-- CookiePolicy.jsx
|   |   |-- MenuPage.jsx
|   |   |-- OrderPage.jsx
|   |   `-- PrivacyPolicy.jsx
|   |-- services/
|   |   |-- menuApi.js
|   |   `-- orderApi.js
|   |-- styles/
|   |   |-- privacy.css
|   |   `-- menu-ordering.css
|   `-- utils/
|       |-- cart.js
|       |-- consentStorage.js
|       |-- formatPrice.js
|       |-- pricing.js
|       `-- validators.js
|-- .env
|-- package.json
`-- vite.config.js
```

## Database

Le tabelle principali sono:

- `categories`
- `menu_items`
- `ingredients`
- `menu_item_ingredients`
- `extra_ingredients`
- `menu_item_allowed_extras`
- `product_options`
- `orders`
- `order_items`

`order_items.customization_json` salva lo snapshot completo della configurazione:

- `removedIngredients`
- `addedExtras`
- `selectedOptions`
- `defaultIngredients`
- `specialNotes`

Questo mantiene gli ordini storici coerenti anche se il menu cambia nel tempo.

## API

- `GET /api/health`
- `GET /api/categories`
- `GET /api/menu`
- `GET /api/menu-items`
- `GET /api/menu-items/:id`
- `GET /api/menu-items/:id/customization`
- `POST /api/orders`

### `POST /api/orders`

Payload atteso:

```json
{
  "customer": {
    "customerName": "Giulia Rossi",
    "customerPhone": "+39 333 000 0000",
    "customerEmail": "giulia@example.com"
  },
  "order": {
    "orderType": "delivery",
    "address": "Via Roma 10, Verona",
    "preferredTime": "20:30",
    "notes": "Citofono Rossi",
    "privacyAccepted": true
  },
  "items": [
    {
      "menuItemId": 3,
      "quantity": 2,
      "note": "Taglio in 6",
      "customization": {
        "removedIngredientIds": [2],
        "addedExtraIds": [1],
        "selectedOptionIds": [1, 4]
      }
    }
  ]
}
```

## Avvio locale

Installa dipendenze:

```bash
npm install
```

Configura `.env`:

```bash
PORT=3001
DATABASE_FILE=./data/tavernetta.sqlite
```

Avvia frontend e backend insieme:

```bash
npm run dev
```

- Frontend Vite: `http://localhost:5173`
- API Express: `http://localhost:3001`

## Build produzione

```bash
npm run build
```

Per servire build e API dallo stesso processo:

```bash
npm start
```

## Reset database

Per ricreare SQLite da zero:

```bash
npm run db:reset
```

Il reset rimuove anche i file `-wal` e `-shm`, cosi il riavvio resta pulito.

## Validazione e pricing

- Il frontend mostra un prezzo live mentre l utente personalizza.
- Il backend non si fida mai del prezzo client.
- Il checkout richiede l accettazione della privacy policy prima dell invio ordine.
- `pricingService` verifica:
  - prodotto attivo
  - quantita valida
  - ingredienti rimossi ammessi
  - extra consentiti per quel prodotto
  - una sola opzione valida per gruppo
- Prezzo finale:
  - `base_price`
  - `+ selected option deltas`
  - `+ added extras`
  - nessuno sconto per ingredienti rimossi

## Privacy e consenso

- Cookie necessari sempre attivi per carrello, ordine, sicurezza applicativa e preferenze essenziali.
- Cookie analitici caricati solo se `analytics = true`.
- Cookie marketing/contenuti esterni caricati solo se `marketing = true`.
- Se `VITE_GA_MEASUREMENT_ID` non e definito, nessuno script analytics viene caricato.
- Google Maps incorporato resta bloccato fino al consenso marketing; e sempre disponibile il link esterno manuale.
- I font display e body sono serviti localmente tramite `@font-face`, quindi non richiedono consenso.
- Le immagini editoriali Unsplash vengono richieste dal server tramite `/api/media`, evitando chiamate dirette del browser a terze parti.

## UX flow

1. L utente apre `/menu`.
2. Scorre le category chips.
3. Apre una pizza nel drawer di personalizzazione.
4. Seleziona impasto, extra, rimozioni e quantita.
5. Aggiunge la configurazione al carrello.
6. Su mobile usa la barra sticky; su desktop la sidebar resta visibile.
7. Va su `/ordina`, conferma il riepilogo e compila i dati ordine.
8. Il server ricalcola il totale e salva `orders` + `order_items`.

## Note future

La struttura attuale e pronta per aggiungere in seguito:

- dashboard ordini
- stato ordine aggiornabile
- attivazione/disattivazione prodotti
- gestione disponibilita ingredienti
- editing menu da admin
- sostituzione futura di SQLite con PostgreSQL mantenendo separazione tra route, service e pricing
