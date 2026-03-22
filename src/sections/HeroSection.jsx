import Button from '../components/Button';
import HeroCarousel from '../components/HeroCarousel';
import { heroSlides, restaurant } from '../data/siteContent';

function HeroSection() {
  return (
    <section
      className="hero-section"
      data-header-tone="light"
      id="home"
      aria-label={`Intro visuale di ${restaurant.name}`}
    >
      <h1 className="sr-only">
        {restaurant.name}, {restaurant.label} a {restaurant.location}
      </h1>

      <HeroCarousel slides={heroSlides} />

      <div className="hero-chrome">
        <div className="hero-order-cta-wrap">
          <Button className="hero-order-cta" to={restaurant.hero.orderCta.to} variant="ghost">
            {restaurant.hero.orderCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
