import Footer from '../components/Footer';
import PageIntro from '../components/PageIntro';
import { COOKIE_CATEGORIES } from '../utils/consentStorage';

const lastUpdated = '21 marzo 2026';

const sections = [
  {
    title: 'Cosa sono i cookie',
    body: [
      'I cookie sono piccoli file o informazioni memorizzate nel browser che aiutano il sito a ricordare preferenze, mantenere sessioni tecniche o abilitare funzionalita opzionali.',
      'Nel contesto del sito Tavernetta distinguiamo tra cookie necessari, cookie analitici e cookie di marketing o contenuti esterni.',
    ],
  },
  {
    title: 'Come raccogliamo il consenso',
    body: [
      'Al primo accesso mostriamo un banner che consente di accettare tutto, rifiutare tutto o scegliere in modo granulare le preferenze.',
      'Le scelte vengono salvate nel browser tramite storage locale e possono essere modificate in qualsiasi momento tramite il link "Gestisci cookie" presente nel footer.',
    ],
  },
  {
    title: 'Servizi che richiedono consenso',
    body: [
      'Gli strumenti analitici vengono caricati solo se la categoria "Analitici" viene attivata.',
      'I contenuti esterni opzionali, come Google Maps incorporato o futuri strumenti promozionali di terze parti, vengono caricati solo se la categoria "Marketing" e attiva.',
      'I Google Fonts sono stati portati in self-hosting locale, quindi non richiedono consenso e non generano richieste verso Google al caricamento della pagina.',
    ],
  },
  {
    title: 'Come disattivare o modificare i cookie',
    body: [
      'Puoi modificare le preferenze dal footer del sito in qualunque momento.',
      'Puoi inoltre intervenire dalle impostazioni del browser per cancellare cookie, bloccare il salvataggio o eliminare i dati gia memorizzati sul dispositivo.',
    ],
  },
];

function CookiePolicy() {
  return (
    <>
      <PageIntro
        className="privacy-page-intro"
        eyebrow="Cookie"
        title="Cookie Policy"
        intro="Dettaglio delle categorie di cookie e dei contenuti opzionali gestiti dal sistema di consenso di Tavernetta."
      />

      <section className="section legal-page" data-header-tone="dark" aria-labelledby="cookie-policy-content">
        <div className="section-inner legal-page-inner">
          <div className="legal-page-header">
            <p className="legal-page-meta">Ultimo aggiornamento: {lastUpdated}</p>
            <p className="legal-page-summary">
              Qui trovi le categorie usate dal banner, le finalita dei cookie e le modalita per revocare o aggiornare
              il consenso.
            </p>
          </div>

          <div className="legal-card-list legal-card-list-compact">
            {COOKIE_CATEGORIES.map((category) => (
              <article key={category.key} className="legal-card legal-card-cookie">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                <span>{category.required ? 'Sempre attivi' : 'Attivabili solo previo consenso'}</span>
              </article>
            ))}
          </div>

          <div className="legal-card-list" id="cookie-policy-content">
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

export default CookiePolicy;
