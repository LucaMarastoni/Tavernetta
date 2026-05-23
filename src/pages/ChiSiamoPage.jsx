import AboutPageHeroSection from '../sections/AboutPageHeroSection';
import { restaurant } from '../data/siteContent';
import ContactSection from '../sections/ContactSection';
import LocationMapSection from '../sections/LocationMapSection';
import StorySection from '../sections/StorySection';

function ChiSiamoPage() {
  return (
    <div className="chi-siamo-page">
      <AboutPageHeroSection />
      <StorySection content={restaurant.aboutPage.story} />
      <LocationMapSection />
      <ContactSection />
    </div>
  );
}

export default ChiSiamoPage;
