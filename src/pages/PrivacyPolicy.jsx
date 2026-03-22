import Footer from '../components/Footer';
import PageIntro from '../components/PageIntro';

const lastUpdated = '21 marzo 2026';

const sections = [
  {
    title: 'Titolare del trattamento',
    body: [
      'Titolare del trattamento e Tavernetta S.r.l., con sede legale in Via Federico Garofoli 105, 37057 San Giovanni Lupatoto (VR), contattabile all indirizzo privacy@tavernetta.it e al numero +39 02 5501 2486.',
      'I dati indicati sono placeholders strutturati correttamente e possono essere sostituiti con i riferimenti reali del ristorante senza modificare l architettura della pagina.',
    ],
  },
  {
    title: 'Tipologie di dati raccolti',
    body: [
      'Dati di navigazione: indirizzo IP, user agent, log tecnici di accesso, preferenze cookie, informazioni strettamente necessarie al funzionamento del sito e del carrello.',
      'Dati forniti volontariamente: nome, telefono, email, indirizzo di consegna, note ordine e qualunque informazione trasmessa tramite form di ordine, email o contatti diretti.',
    ],
  },
  {
    title: 'Finalita del trattamento',
    body: [
      'Gestione ordini online, preparazione del servizio, ricontatto del cliente e coordinamento di ritiro o consegna.',
      'Gestione di richieste inviate tramite email, telefono, WhatsApp o altri canali volontariamente selezionati dall utente.',
      'Miglioramento del sito e del servizio, ove siano attivati strumenti analitici previo consenso.',
    ],
  },
  {
    title: 'Base giuridica',
    body: [
      'Esecuzione di misure precontrattuali o di un contratto per la gestione di prenotazioni, ordini e richieste del cliente.',
      'Consenso dell interessato per cookie analitici, contenuti esterni opzionali e futuri strumenti marketing.',
      'Adempimento di obblighi legali e legittimo interesse del titolare per sicurezza, difesa di diritti e continuita del servizio.',
    ],
  },
  {
    title: 'Modalita di trattamento',
    body: [
      'Il trattamento avviene con strumenti informatici e organizzativi adeguati, con accesso limitato ai soggetti autorizzati e misure coerenti con la natura dei dati trattati.',
      'Il sito adotta logiche di minimizzazione dei dati, separazione tra frontend e backend, validazione lato server e controlli di consenso per i servizi non essenziali.',
    ],
  },
  {
    title: 'Conservazione dei dati',
    body: [
      'I dati d ordine vengono conservati per il tempo necessario alla gestione operativa, amministrativa e fiscale del rapporto, o per il diverso periodo richiesto dalla normativa applicabile.',
      'Le preferenze cookie vengono mantenute sul browser dell utente fino a revoca, aggiornamento della policy o cancellazione dei dati locali.',
    ],
  },
  {
    title: 'Comunicazione a terzi',
    body: [
      'I dati possono essere trattati da fornitori tecnici che supportano hosting, infrastruttura server, servizi email e continuita operativa, nominati ove necessario responsabili del trattamento.',
      'Se l utente sceglie volontariamente servizi esterni come WhatsApp o Google Maps incorporato, il relativo trattamento avviene anche secondo le informative dei rispettivi fornitori.',
    ],
  },
  {
    title: 'Diritti dell utente',
    body: [
      'L utente puo chiedere accesso, rettifica, cancellazione, limitazione del trattamento, opposizione e portabilita dei dati nei limiti previsti dagli articoli 15-22 del GDPR.',
      'E sempre possibile revocare il consenso ai cookie opzionali senza pregiudicare la liceita del trattamento basato sul consenso prestato prima della revoca.',
      'Per esercitare i diritti e possibile scrivere a privacy@tavernetta.it. Resta salvo il diritto di proporre reclamo all Autorita Garante per la protezione dei dati personali.',
    ],
  },
  {
    title: 'Cookie policy',
    body: [
      'Il sito utilizza cookie tecnici necessari e, solo previo consenso, eventuali cookie analitici o di marketing/contenuti esterni. La descrizione completa e disponibile nella Cookie Policy dedicata.',
    ],
  },
  {
    title: 'Modifiche alla policy',
    body: [
      'Questa informativa puo essere aggiornata per adeguamenti normativi, organizzativi o tecnici. In caso di modifiche rilevanti verra aggiornata la data di revisione e, se necessario, verra richiesto un nuovo consenso.',
    ],
  },
];

function PrivacyPolicy() {
  return (
    <>
      <PageIntro
        className="privacy-page-intro"
        eyebrow="Privacy"
        title="Privacy Policy"
        intro="Informativa chiara sul trattamento dei dati personali raccolti attraverso il sito Tavernetta e i relativi servizi di contatto e ordine."
      />

      <section className="section legal-page" data-header-tone="dark" aria-labelledby="privacy-policy-content">
        <div className="section-inner legal-page-inner">
          <div className="legal-page-header">
            <p className="legal-page-meta">Ultimo aggiornamento: {lastUpdated}</p>
            <p className="legal-page-summary">
              Questa pagina descrive quali dati raccogliamo, per quali finalita li utilizziamo e come l utente puo
              esercitare i propri diritti.
            </p>
          </div>

          <div className="legal-card-list" id="privacy-policy-content">
            {sections.map((section) => (
              <article key={section.title} className="legal-card">
                <h2>{section.title}</h2>
                <div className="legal-card-copy">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default PrivacyPolicy;
