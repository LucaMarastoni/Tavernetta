import AboutSection from '../sections/AboutSection';
import ContactSection from '../sections/ContactSection';
import GallerySection from '../sections/GallerySection';
import HeroSection from '../sections/HeroSection';
import LocationMapSection from '../sections/LocationMapSection';
import MenuPreviewSection from '../sections/MenuPreviewSection';
import PhilosophySection from '../sections/PhilosophySection';

function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <PhilosophySection />
      <MenuPreviewSection />
      <GallerySection />
      <LocationMapSection />
      <ContactSection />
    </>
  );
}

export default HomePage;
