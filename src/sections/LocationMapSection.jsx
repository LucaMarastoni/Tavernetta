import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function LocationMapSection() {
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
          <iframe
            className="location-map-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={restaurant.reservation.mapEmbedUrl}
            title="Mappa di Tavernetta"
          />
        </Reveal>
      </div>
    </section>
  );
}

export default LocationMapSection;
