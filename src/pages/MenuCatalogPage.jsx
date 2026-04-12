import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CartStickyBar from '../components/cart/CartStickyBar';
import CartSummary from '../components/cart/CartSummary';
import StaggeredMenu from '../components/StaggeredMenu';
import MenuCategoryNav from '../components/menu/MenuCategoryNav';
import MenuProductSection from '../components/menu/MenuProductSection';
import { buildMenuGroups } from '../components/menu/menuGroups';
import StatusPanel from '../components/StatusPanel';
import CustomizationDrawer from '../components/customization/CustomizationDrawer';
import { useCart } from '../context/CartContext';
import { pageNavigation } from '../data/siteContent';
import { useMenuCatalog } from '../hooks/useMenuCatalog';
import { fetchMenuItemCustomization } from '../services/menuApi';
import '../styles/menu-catalog.css';

function MenuCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCollectionId = searchParams.get('categoria');
  const { categories, itemsById, loading, error, refetch } = useMenuCatalog();
  const { addConfiguredItem, itemCount, items, removeItem, replaceConfiguredItem, totals, updateQuantity } = useCart();
  const [activeGroupId, setActiveGroupId] = useState(null);
  const customizationRequestRef = useRef(0);
  const sectionRefs = useRef({});
  const subheaderRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const [drawerState, setDrawerState] = useState({
    open: false,
    loading: false,
    error: '',
    configuration: null,
    initialLine: null,
  });

  const menuGroups = useMemo(() => buildMenuGroups(categories).filter((group) => group.isAvailable), [categories]);

  const scrollToGroup = useCallback((groupId, behavior = 'smooth') => {
    const targetSection = sectionRefs.current[groupId];
    const firstGroupId = menuGroups[0]?.id ?? null;

    if (!targetSection) {
      return;
    }

    if (groupId === firstGroupId) {
      window.scrollTo({
        top: 0,
        behavior,
      });
      return;
    }

    const stickyOffset = (subheaderRef.current?.getBoundingClientRect().height ?? 0) + 16;
    const targetTop = window.scrollY + targetSection.getBoundingClientRect().top - stickyOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior,
    });
  }, [menuGroups]);

  useEffect(() => {
    if (!menuGroups.length) {
      setActiveGroupId(null);
      return;
    }

    const nextActiveGroupId =
      menuGroups.find((group) => group.id === requestedCollectionId)?.id ?? menuGroups[0].id;

    setActiveGroupId((currentGroupId) => {
      if (menuGroups.some((group) => group.id === currentGroupId)) {
        return currentGroupId;
      }

      return nextActiveGroupId;
    });
  }, [menuGroups, requestedCollectionId]);

  useEffect(() => {
    if (!menuGroups.length || !requestedCollectionId) {
      initialScrollDoneRef.current = false;
      return;
    }

    if (!menuGroups.some((group) => group.id === requestedCollectionId) || initialScrollDoneRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToGroup(requestedCollectionId, 'auto');
      initialScrollDoneRef.current = true;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [menuGroups, requestedCollectionId, scrollToGroup]);

  useEffect(() => {
    if (!menuGroups.length) {
      return undefined;
    }

    let frameId = 0;

    const updateActiveGroupFromScroll = () => {
      frameId = 0;

      const triggerLine =
        (subheaderRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
      let nextActiveSection = menuGroups[0]?.id ?? null;

      for (const group of menuGroups) {
        const section = sectionRefs.current[group.id];

        if (!section) {
          continue;
        }

        const rect = section.getBoundingClientRect();

        if (rect.top <= triggerLine) {
          nextActiveSection = group.id;
        }

        if (rect.bottom > triggerLine) {
          break;
        }
      }

      if (nextActiveSection) {
        setActiveGroupId(nextActiveSection);
      }
    };

    const requestUpdate = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(updateActiveGroupFromScroll);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [menuGroups]);

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

  const handleSelectGroup = useCallback(
    (groupId) => {
      setActiveGroupId(groupId);
      if (groupId === menuGroups[0]?.id) {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ categoria: groupId }, { replace: true });
      }
      scrollToGroup(groupId);
    },
    [menuGroups, scrollToGroup, setSearchParams],
  );

  return (
    <>
      <section className="section ordering-page menu-catalog-page" data-header-tone="dark">
        {!loading && !error && menuGroups.length ? (
          <div ref={subheaderRef} className="menu-catalog-subheader-shell">
            <div className="section-inner menu-catalog-subheader-inner">
              <section className="menu-catalog-page-header" aria-label="Navigazione della carta">
                <div className="menu-catalog-page-head">
                  <Link className="menu-catalog-brand-link" to="/" viewTransition>
                    Tavernetta
                  </Link>

                  <div className="menu-catalog-page-actions">
                    <StaggeredMenu
                      buttonColor="#241914"
                      colors={['#cda68f', '#9e6556', '#f4e8da']}
                      navigation={pageNavigation}
                      openButtonColor="#241914"
                    />
                  </div>
                </div>

                <MenuCategoryNav
                  groups={menuGroups}
                  activeGroupId={activeGroupId}
                  onSelect={handleSelectGroup}
                />
              </section>
            </div>
          </div>
        ) : null}

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

          {!loading && !error && categories.length > 0 && !menuGroups.length ? (
            <StatusPanel
              title="Nessuna sezione disponibile."
              message="La carta online non contiene ancora una sezione navigabile."
            />
          ) : null}

          {!loading && !error && menuGroups.length ? (
            <div className="ordering-layout menu-catalog-layout">
              <div className="ordering-main-column menu-catalog-main">
                <div className="menu-catalog-sections">
                  {menuGroups.map((group) => (
                    <MenuProductSection
                      key={group.id}
                      group={group}
                      setSectionRef={(node) => {
                        if (node) {
                          sectionRefs.current[group.id] = node;
                        } else {
                          delete sectionRefs.current[group.id];
                        }
                      }}
                      onSelectProduct={openCustomization}
                    />
                  ))}
                </div>
              </div>

              <aside className="ordering-sidebar menu-catalog-sidebar">
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
                  canEdit={(line) => Boolean(itemsById[String(line.menuItemId)])}
                  onEdit={(line) => {
                    const liveItem = itemsById[String(line.menuItemId)];

                    if (liveItem) {
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
