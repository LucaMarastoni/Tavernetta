import Button from '../components/Button';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant, socialLinks } from '../data/siteContent';

function ContactSection() {
  return (
    <section className="section contact-section" id="contacts" aria-labelledby="contacts-title">
      <div className="section-inner contact-grid">
        <Reveal className="contact-copy">
          <SectionTitle
            eyebrow={restaurant.contact.eyebrow}
            id="contacts-title"
            intro={restaurant.contact.intro}
            title={restaurant.contact.title}
          />

          <div className="contact-stack">
            <a href={restaurant.reservation.phoneHref}>{restaurant.reservation.phoneLabel}</a>
            <a href={restaurant.reservation.emailHref}>{restaurant.reservation.emailLabel}</a>
            <address>{restaurant.reservation.address}</address>
          </div>

          <div className="contact-hours">
            <p className="contact-hours-label">Orari</p>
            <ul className="hours-list">
              {restaurant.reservation.hours.map((slot) => (
                <li key={slot.day}>
                  <span>{slot.day}</span>
                  <span>{slot.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="social-links" aria-label="Social media">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} rel="noreferrer" target="_blank">
                {link.label}
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal className="contact-map-card" delay={100} direction="left">
          <p className="contact-map-label">Mappa</p>
          <h3>{restaurant.contact.mapTitle}</h3>
          <p>{restaurant.contact.mapDescription}</p>
          <Button href={restaurant.reservation.mapUrl} rel="noreferrer" target="_blank" variant="secondary">
            Apri Google Maps
          </Button>
        </Reveal>
      </div>

      <Footer />
    </section>
  );
}

export default ContactSection;
