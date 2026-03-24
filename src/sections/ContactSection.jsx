import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant, socialLinks } from '../data/siteContent';

function ContactSection() {
  const instagramLink = socialLinks.find((link) => link.label.toLowerCase() === 'instagram');

  return (
    <section className="section contact-section" data-header-tone="dark" id="contacts" aria-labelledby="contacts-title">
      <div className="section-inner contact-shell">
        <Reveal className="contact-copy">
          <SectionTitle
            eyebrow={restaurant.contact.eyebrow}
            id="contacts-title"
            intro={restaurant.contact.intro}
            title={restaurant.contact.title}
          />

          <div className="contact-quick-actions" aria-label="Azioni rapide">
            <a className="contact-quick-action is-primary" href={restaurant.reservation.phoneHref}>
              Chiama
            </a>
            {instagramLink ? (
              <a className="contact-quick-action" href={instagramLink.href} rel="noreferrer" target="_blank">
                Instagram
              </a>
            ) : null}
          </div>
        </Reveal>

        <div className="contact-info-grid">
          <Reveal className="contact-info-card contact-primary-card" delay={80} direction="left">
            <p className="contact-card-label">Contatti</p>

            <div className="contact-primary-links">
              <a className="contact-primary-phone" href={restaurant.reservation.phoneHref}>
                {restaurant.reservation.phoneLabel}
              </a>
            </div>

            <address className="contact-address">{restaurant.reservation.address}</address>

            <div className="contact-stack">
              <a className="contact-utility-link contact-map-link" href={restaurant.reservation.mapUrl} rel="noreferrer" target="_blank">
                Apri indicazioni su Google Maps
              </a>
            </div>
          </Reveal>

          <Reveal className="contact-info-card contact-hours-card" delay={140} direction="left">
            <p className="contact-card-label">Orari</p>
            <ul className="hours-list contact-hours-list">
              {restaurant.reservation.hours.map((slot) => (
                <li key={slot.day}>
                  <span className="contact-hours-day">{slot.day}</span>
                  <span className="contact-hours-time">{slot.time}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="contact-map-block" delay={180} id="reservation">
          <div className="contact-map-copy">
            <p className="contact-card-label">Indicazioni</p>
            <h3>{restaurant.contact.mapTitle}</h3>
            <p>{restaurant.contact.mapDescription}</p>
          </div>

          <div className="location-map-frame-shell contact-map-frame-shell">
            <iframe
              className="location-map-frame contact-map-frame"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={restaurant.reservation.mapEmbedUrl}
              title="Mappa di Tavernetta"
            />
          </div>
        </Reveal>
      </div>

      <Footer />
    </section>
  );
}

export default ContactSection;
