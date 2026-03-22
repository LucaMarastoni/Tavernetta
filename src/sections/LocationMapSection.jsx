import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';
import { useCookieConsent } from '../hooks/useCookieConsent';

function LocationMapSection() {
  const { openPreferences, preferences } = useCookieConsent();

  return (
    <section
      className="section location-map-section"
      data-header-tone="dark"
      id="reservation"
      aria-labelledby="location-map-title"
    >
      <div className="section-inner">
        <Reveal className="location-map-heading">
          <SectionTitle
            eyebrow={restaurant.locationSection.eyebrow}
            id="location-map-title"
            intro={restaurant.locationSection.intro}
            title={restaurant.locationSection.title}
          />
        </Reveal>

        <Reveal className="location-map-frame-shell" delay={80}>
          {preferences.marketing ? (
            <iframe
              className="location-map-frame"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={restaurant.reservation.mapEmbedUrl}
              title="Mappa di Tavernetta"
            />
          ) : (
            <div className="external-content-card">
              <div className="external-content-copy">
                <p className="section-eyebrow">Contenuto esterno</p>
                <h3>La mappa Google e disattivata finche non la autorizzi.</h3>
                <p>
                  Per visualizzare Google Maps direttamente nel sito devi attivare i cookie marketing. In alternativa
                  puoi aprire la mappa in una nuova scheda.
                </p>
              </div>

              <div className="external-content-actions">
                <button className="button button-secondary" type="button" onClick={openPreferences}>
                  Gestisci cookie
                </button>
                <a className="button button-ghost-dark" href={restaurant.reservation.mapUrl} rel="noreferrer" target="_blank">
                  Apri la mappa
                </a>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export default LocationMapSection;
