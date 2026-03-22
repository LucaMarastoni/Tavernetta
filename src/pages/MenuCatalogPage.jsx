import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CartStickyBar from '../components/cart/CartStickyBar';
import CartSummary from '../components/cart/CartSummary';
import MenuCategoryNav from '../components/menu/MenuCategoryNav';
import MenuItemCard from '../components/menu/MenuItemCard';
import { buildMenuGroups } from '../components/menu/menuGroups';
import StatusPanel from '../components/StatusPanel';
import CustomizationDrawer from '../components/customization/CustomizationDrawer';
import { useCart } from '../context/CartContext';
import { useMenuCatalog } from '../hooks/useMenuCatalog';
import { fetchMenuItemCustomization } from '../services/menuApi';
import { createCartLine } from '../utils/cart';

function MenuCatalogPage() {
  const [searchParams] = useSearchParams();
  const requestedCollectionId = searchParams.get('categoria');
  const { categories, itemsById, loading, error, refetch } = useMenuCatalog();
  const { addConfiguredItem, itemCount, items, removeItem, replaceConfiguredItem, totals, updateQuantity } = useCart();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const customizationRequestRef = useRef(0);
  const [drawerState, setDrawerState] = useState({
    open: false,
    loading: false,
    error: '',
    configuration: null,
    initialLine: null,
  });

  const menuGroups = useMemo(() => buildMenuGroups(categories), [categories]);
  const activeCollection = useMemo(
    () =>
      menuGroups.find((group) => group.id === requestedCollectionId && group.isAvailable) ??
      menuGroups.find((group) => group.isAvailable) ??
      null,
    [menuGroups, requestedCollectionId],
  );
  const visibleCategories = activeCollection?.categories ?? [];

  useEffect(() => {
    if (!visibleCategories.length) {
      setActiveCategoryId(null);
      return;
    }

    setActiveCategoryId((currentCategoryId) => {
      if (visibleCategories.some((category) => category.id === currentCategoryId)) {
        return currentCategoryId;
      }

      return visibleCategories[0].id;
    });
  }, [visibleCategories]);

  const activeCategory = useMemo(
    () => visibleCategories.find((category) => category.id === activeCategoryId) ?? visibleCategories[0] ?? null,
    [activeCategoryId, visibleCategories],
  );

  const openCustomization = async (item, initialLine = null) => {
    const requestId = customizationRequestRef.current + 1;
    customizationRequestRef.current = requestId;

    setDrawerState({
      open: true,
      loading: true,
      error: '',
      configuration: null,
      initialLine,
    });

    try {
      const configuration = await fetchMenuItemCustomization(item.id);

      if (customizationRequestRef.current !== requestId) {
        return;
      }

      setDrawerState({
        open: true,
        loading: false,
        error: '',
        configuration,
        initialLine,
      });
    } catch (fetchError) {
      if (customizationRequestRef.current !== requestId) {
        return;
      }

      setDrawerState({
        open: true,
        loading: false,
        error: fetchError.message || 'Non riusciamo a caricare questo prodotto.',
        configuration: null,
        initialLine,
      });
    }
  };

  const handleQuickAdd = (item) => {
    addConfiguredItem(
      createCartLine({
        item,
        quantity: 1,
        basePrice: item.basePrice,
        finalUnitPrice: item.basePrice,
      }),
    );
  };

  const handleConfirmCustomization = (nextLine, previousLineId) => {
    if (previousLineId) {
      replaceConfiguredItem(previousLineId, nextLine);
    } else {
      addConfiguredItem(nextLine);
    }

    setDrawerState({
      open: false,
      loading: false,
      error: '',
      configuration: null,
      initialLine: null,
    });
  };

  return (
    <>
      <section className="section ordering-page" data-header-tone="dark">
        <div className="section-inner ordering-page-inner">
          {loading ? (
            <div className="ordering-loading-grid" aria-hidden="true">
              <div className="ordering-loading-block is-nav" />
              <div className="ordering-loading-block" />
              <div className="ordering-loading-block" />
              <div className="ordering-loading-block" />
            </div>
          ) : null}

          {!loading && error ? (
            <StatusPanel
              title="Il menu non e disponibile."
              message={error}
              actionLabel="Riprova"
              onAction={refetch}
              tone="error"
            />
          ) : null}

          {!loading && !error && categories.length === 0 ? (
            <StatusPanel
              title="Nessuna proposta disponibile."
              message="La carta online e temporaneamente vuota. Riprova tra poco."
            />
          ) : null}

          {!loading && !error && categories.length > 0 && !activeCollection ? (
            <StatusPanel
              title="Nessuna sezione disponibile."
              message="La carta online non contiene ancora una sezione navigabile."
            />
          ) : null}

          {!loading && !error && activeCollection && activeCategory ? (
            <div className="ordering-layout">
              <div className="ordering-main-column">
                <section className="ordering-collection-intro" aria-labelledby="ordering-collection-title">
                  <Link className="ordering-secondary-cta ordering-collection-back" to="/menu" viewTransition>
                    Torna al menu
                  </Link>

                  <div className="ordering-collection-copy">
                    <p className="ordering-eyebrow">Carta disponibile</p>
                    <h1 id="ordering-collection-title">{activeCollection.title}</h1>
                    <p>{activeCollection.description}</p>
                  </div>

                  <div className="ordering-collection-meta" aria-label="Dettagli della selezione">
                    <span>{activeCollection.itemCount} proposte</span>
                    <strong>{activeCollection.categorySummary}</strong>
                  </div>
                </section>

                <MenuCategoryNav
                  categories={visibleCategories}
                  activeCategoryId={activeCategory.id}
                  onSelect={setActiveCategoryId}
                />

                <div className="ordering-menu-grid">
                  {activeCategory.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onConfigure={openCustomization}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </div>

              <aside className="ordering-sidebar">
                <CartSummary
                  eyebrow="Ordine"
                  title="Il tuo carrello"
                  subtitle="Su desktop resta sempre visibile; su mobile lo richiami dalla barra fissa in basso."
                  items={items}
                  totals={totals}
                  emptyTitle="Il carrello e ancora vuoto."
                  emptyBody="Scegli una pizza o un piatto dalla carta e il riepilogo si aggiornera qui in tempo reale."
                  onDecrease={(line) => updateQuantity(line.lineId, line.quantity - 1)}
                  onIncrease={(line) => updateQuantity(line.lineId, line.quantity + 1)}
                  onRemove={(line) => removeItem(line.lineId)}
                  canEdit={(line) => Boolean(itemsById[String(line.menuItemId)]?.hasCustomization)}
                  onEdit={(line) => {
                    const liveItem = itemsById[String(line.menuItemId)];

                    if (liveItem?.hasCustomization) {
                      openCustomization(liveItem, line);
                    }
                  }}
                  footer={
                    items.length ? (
                      <Link className="ordering-primary-cta is-full-width" to="/ordina" viewTransition>
                        Continua
                      </Link>
                    ) : null
                  }
                />
              </aside>
            </div>
          ) : null}
        </div>
      </section>

      <CartStickyBar itemCount={itemCount} total={totals.total} />

      <CustomizationDrawer
        open={drawerState.open}
        loading={drawerState.loading}
        error={drawerState.error}
        configuration={drawerState.configuration}
        initialLine={drawerState.initialLine}
        onClose={() => {
          customizationRequestRef.current += 1;

          setDrawerState({
            open: false,
            loading: false,
            error: '',
            configuration: null,
            initialLine: null,
          });
        }}
        onConfirm={handleConfirmCustomization}
      />
    </>
  );
}

export default MenuCatalogPage;
