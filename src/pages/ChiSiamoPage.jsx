import PageIntro from '../components/PageIntro';
import { restaurant } from '../data/siteContent';
import ContactSection from '../sections/ContactSection';
import GallerySection from '../sections/GallerySection';
import PhilosophySection from '../sections/PhilosophySection';
import ReservationSection from '../sections/ReservationSection';
import StorySection from '../sections/StorySection';
import TeamSection from '../sections/TeamSection';

function ChiSiamoPage() {
  return (
    <>
      <PageIntro
        eyebrow={restaurant.aboutPage.eyebrow}
        intro={restaurant.aboutPage.intro}
        title={restaurant.aboutPage.title}
      />
      <StorySection />
      <PhilosophySection />
      <TeamSection />
      <GallerySection />
      <ReservationSection />
      <ContactSection />
    </>
  );
}

export default ChiSiamoPage;
