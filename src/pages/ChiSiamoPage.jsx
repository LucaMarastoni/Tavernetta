import AboutPageHeroSection from '../sections/AboutPageHeroSection';
import { restaurant } from '../data/siteContent';
import ContactSection from '../sections/ContactSection';
import GallerySection from '../sections/GallerySection';
import LocationMapSection from '../sections/LocationMapSection';
import PhilosophySection from '../sections/PhilosophySection';
import StorySection from '../sections/StorySection';
import TeamSection from '../sections/TeamSection';

function ChiSiamoPage() {
  return (
    <>
      <AboutPageHeroSection />
      <StorySection content={restaurant.aboutPage.story} />
      <PhilosophySection content={restaurant.aboutPage.philosophy} />
      <TeamSection content={restaurant.aboutPage.team} />
      <GallerySection />
      <LocationMapSection />
      <ContactSection />
    </>
  );
}

export default ChiSiamoPage;
