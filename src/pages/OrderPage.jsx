import Button from '../components/Button';
import PageIntro from '../components/PageIntro';
import { restaurant } from '../data/siteContent';
import { useMenuCatalog } from '../hooks/useMenuCatalog';
import ContactSection from '../sections/ContactSection';
import OrderExperienceSection from '../sections/OrderExperienceSection';
import ReservationSection from '../sections/ReservationSection';

function OrderPage() {
  const { categories, error, featuredItems, itemsById, loading, refetch } = useMenuCatalog();

  return (
    <>
      <PageIntro
        eyebrow={restaurant.orderPage.eyebrow}
        intro={restaurant.orderPage.intro}
        title={restaurant.orderPage.title}
      >
        <Button to="/menu" variant="secondary">
          Consulta il menu
        </Button>
      </PageIntro>

      <OrderExperienceSection
        categories={categories}
        error={error}
        featuredItems={featuredItems}
        itemsById={itemsById}
        loading={loading}
        onRetry={refetch}
      />

      <ReservationSection />
      <ContactSection />
    </>
  );
}

export default OrderPage;
