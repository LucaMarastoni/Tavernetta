import { Outlet } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import {
  createAdminMenuState,
  flattenAdminMenu,
  getAdminAllergenOptions,
  normalizeAdminText,
  slugifyAdminValue,
} from '../data/adminMenu';
import {
  AdminOrdersApiError,
  fetchAdminOrders,
  usesStaticAdminSource,
} from '../services/adminOrdersApi';
import '../styles/admin.css';

function sortItemsByName(items) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
}

function AdminPage() {
  const staticAdminEnabled = usesStaticAdminSource();
  const [menuState, setMenuState] = useState(() => createAdminMenuState());
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const items = useMemo(() => flattenAdminMenu(menuState), [menuState]);
  const categories = useMemo(
    () => menuState.map((category) => ({ id: category.id, name: category.name, slug: category.slug, count: category.items.length })),
    [menuState],
  );
  const allergenOptions = useMemo(() => getAdminAllergenOptions(menuState), [menuState]);

  const savePizza = (draft, previousPizza = null) => {
    setMenuState((currentState) => {
      const nextCategoryName = draft.categoryName.trim();
      const normalizedCategoryName = normalizeAdminText(nextCategoryName);

      let nextState = currentState.map((category) => ({
        ...category,
        items: [...category.items],
      }));

      if (previousPizza) {
        nextState = nextState.map((category) =>
          category.id === previousPizza.categoryId
            ? { ...category, items: category.items.filter((item) => item.id !== previousPizza.id) }
            : category,
        );
      }

      let targetCategoryIndex = nextState.findIndex(
        (category) => normalizeAdminText(category.name) === normalizedCategoryName,
      );

      if (targetCategoryIndex === -1) {
        const nextSlug = slugifyAdminValue(nextCategoryName) || `categoria-${nextState.length + 1}`;
        nextState = [
          ...nextState,
          {
            id: `category-${nextSlug}-${Date.now()}`,
            name: nextCategoryName,
            slug: nextSlug,
            items: [],
          },
        ];
        targetCategoryIndex = nextState.length - 1;
      }

      const targetCategory = nextState[targetCategoryIndex];
      const itemSlug = slugifyAdminValue(draft.name) || `pizza-${Date.now()}`;
      const nextItem = {
        id: previousPizza?.id ?? `pizza-${targetCategory.slug}-${itemSlug}-${Date.now()}`,
        name: draft.name.trim(),
        price: draft.price,
        allergens: draft.allergens,
        spicy: draft.spicy,
        vegetarian: draft.vegetarian,
        ingredients: draft.ingredients,
        note: draft.note,
      };

      nextState[targetCategoryIndex] = {
        ...targetCategory,
        items: sortItemsByName([...targetCategory.items, nextItem]),
      };

      return nextState;
    });
  };

  const deletePizza = (pizza) => {
    setMenuState((currentState) =>
      currentState.map((category) =>
        category.id === pizza.categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== pizza.id) }
          : category,
      ),
    );
  };

  const createCategory = (name) => {
    const cleanName = name.trim();

    if (!cleanName || categories.some((category) => normalizeAdminText(category.name) === normalizeAdminText(cleanName))) {
      return false;
    }

    setMenuState((currentState) => [
      ...currentState,
      {
        id: `category-${slugifyAdminValue(cleanName) || Date.now()}-${Date.now()}`,
        name: cleanName,
        slug: slugifyAdminValue(cleanName) || `categoria-${currentState.length + 1}`,
        items: [],
      },
    ]);

    return true;
  };

  const renameCategory = (categoryId, nextName) => {
    const cleanName = nextName.trim();

    if (!cleanName) {
      return false;
    }

    const alreadyExists = categories.some(
      (category) => category.id !== categoryId && normalizeAdminText(category.name) === normalizeAdminText(cleanName),
    );

    if (alreadyExists) {
      return false;
    }

    setMenuState((currentState) =>
      currentState.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              name: cleanName,
              slug: slugifyAdminValue(cleanName) || category.slug,
            }
          : category,
      ),
    );

    return true;
  };

  const deleteCategory = (categoryId) => {
    setMenuState((currentState) => currentState.filter((category) => category.id !== categoryId));
  };

  const refreshOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setOrdersLoading(true);
    }

    try {
      const nextOrders = await fetchAdminOrders();
      setOrders(nextOrders);
      setOrdersError('');
    } catch (error) {
      const message =
        error instanceof AdminOrdersApiError
          ? error.message
          : 'Non siamo riusciti a leggere gli ordini ricevuti.';
      setOrdersError(message);
    } finally {
      if (!silent) {
        setOrdersLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    let refreshTimerId = null;

    const loadOrders = async () => {
      setOrdersLoading(true);

      try {
        const nextOrders = await fetchAdminOrders();

        if (!isActive) {
          return;
        }

        setOrders(nextOrders);
        setOrdersError('');
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof AdminOrdersApiError
            ? error.message
            : 'Non siamo riusciti a leggere gli ordini ricevuti.';
        setOrdersError(message);
      } finally {
        if (!isActive) {
          return;
        }

        setOrdersLoading(false);
      }
    };

    loadOrders();
    refreshTimerId = window.setInterval(() => {
      refreshOrders({ silent: true });
    }, 15000);

    return () => {
      isActive = false;

      if (refreshTimerId) {
        window.clearInterval(refreshTimerId);
      }
    };
  }, [refreshOrders]);

  const contextValue = useMemo(
    () => ({
      items,
      categories,
      allergenOptions,
      orders,
      ordersLoading,
      ordersError,
      staticAdminEnabled,
      savePizza,
      deletePizza,
      createCategory,
      renameCategory,
      deleteCategory,
      refreshOrders,
    }),
    [
      items,
      categories,
      allergenOptions,
      orders,
      ordersLoading,
      ordersError,
      staticAdminEnabled,
      refreshOrders,
    ],
  );

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <AdminSidebar />

        <main className="admin-main">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
