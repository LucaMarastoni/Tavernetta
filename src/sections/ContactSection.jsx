import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant, socialLinks } from '../data/siteContent';

function ContactSection() {
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

          <div className="social-links" aria-label="Social media">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} rel="noreferrer" target="_blank">
                {link.label}
              </a>
            ))}
          </div>
        </Reveal>

        <div className="contact-info-grid">
          <Reveal className="contact-info-card" delay={80} direction="left">
            <p className="contact-card-label">Contatti</p>
            <div className="contact-stack">
              <a href={restaurant.reservation.phoneHref}>{restaurant.reservation.phoneLabel}</a>
              <a href={restaurant.reservation.emailHref}>{restaurant.reservation.emailLabel}</a>
              <address>{restaurant.reservation.address}</address>
              <a href={restaurant.reservation.mapUrl} rel="noreferrer" target="_blank">
                Apri su Google Maps
              </a>
            </div>
          </Reveal>

          <Reveal className="contact-info-card contact-hours-card" delay={140} direction="left">
            <p className="contact-card-label">Orari</p>
            <ul className="hours-list">
              {restaurant.reservation.hours.map((slot) => (
                <li key={slot.day}>
                  <span>{slot.day}</span>
                  <span>{slot.time}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <Footer />
    </section>
  );
}

export default ContactSection;
