import PageIntro from '../components/PageIntro';
import { restaurant } from '../data/siteContent';
import ContactSection from '../sections/ContactSection';
import FullMenuSection from '../sections/FullMenuSection';
import ReservationSection from '../sections/ReservationSection';

function MenuPage() {
  return (
    <>
      <PageIntro
        eyebrow={restaurant.menuPage.eyebrow}
        intro={restaurant.menuPage.intro}
        title={restaurant.menuPage.title}
      />
      <FullMenuSection compact />
      <ReservationSection />
      <ContactSection />
    </>
  );
}

export default MenuPage;
