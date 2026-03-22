import Button from '../components/Button';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function ReservationSection() {
  return (
    <section
      className="section reservation-section"
      data-header-tone="dark"
      id="reservation"
      aria-labelledby="reservation-title"
    >
      <div className="section-inner">
        <Reveal className="reservation-panel">
          <div className="reservation-copy">
            <SectionTitle
              eyebrow={restaurant.reservation.eyebrow}
              id="reservation-title"
              intro={restaurant.reservation.intro}
              title={restaurant.reservation.title}
            />

            <div className="reservation-actions">
              <Button href={restaurant.reservation.bookingHref} variant="primary">
                {restaurant.reservation.bookingLabel}
              </Button>
              <Button href={restaurant.reservation.phoneHref} variant="ghost-dark">
                Chiama la sala
              </Button>
            </div>
          </div>

          <div className="reservation-details">
            <div className="reservation-card">
              <p className="reservation-card-label">Orari</p>
              <ul className="hours-list">
                {restaurant.reservation.hours.map((slot) => (
                  <li key={slot.day}>
                    <span>{slot.day}</span>
                    <span>{slot.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="reservation-card">
              <p className="reservation-card-label">Contatti diretti</p>
              <div className="reservation-contact-stack">
                <a href={restaurant.reservation.phoneHref}>{restaurant.reservation.phoneLabel}</a>
                <p>{restaurant.reservation.address}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default ReservationSection;
