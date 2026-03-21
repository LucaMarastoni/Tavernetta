import Button from '../components/Button';
import PageIntro from '../components/PageIntro';
import { restaurant } from '../data/siteContent';
import { useMenuCatalog } from '../hooks/useMenuCatalog';
import ContactSection from '../sections/ContactSection';
import FullMenuSection from '../sections/FullMenuSection';
import ReservationSection from '../sections/ReservationSection';

function MenuPage() {
  const { categories, error, loading, refetch } = useMenuCatalog();

  return (
    <>
      <PageIntro
        className="page-intro-menu"
        eyebrow={restaurant.menuPage.eyebrow}
        intro={restaurant.menuPage.intro}
        title={restaurant.menuPage.title}
      >
        <Button to="/ordina" variant="secondary">
          Ordina online
        </Button>
      </PageIntro>
      <FullMenuSection categories={categories} compact error={error} loading={loading} onRetry={refetch} />
      <ReservationSection />
      <ContactSection />
    </>
  );
}

export default MenuPage;
