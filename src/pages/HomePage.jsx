import AboutSection from '../sections/AboutSection';
import ContactSection from '../sections/ContactSection';
import GallerySection from '../sections/GallerySection';
import HeroSection from '../sections/HeroSection';
import MenuPreviewSection from '../sections/MenuPreviewSection';
import PhilosophySection from '../sections/PhilosophySection';
import ReservationSection from '../sections/ReservationSection';

function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <PhilosophySection />
      <MenuPreviewSection />
      <GallerySection />
      <ReservationSection />
      <ContactSection />
    </>
  );
}

export default HomePage;
