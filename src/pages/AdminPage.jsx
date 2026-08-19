import { Outlet } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import {
  createAdminMenuStateFromCatalog,
  createEmptyAdminMenuState,
  flattenAdminMenu,
  getAdminAllergenOptions,
  normalizeAdminText,
  slugifyAdminValue,
} from '../data/adminMenu';
import { fetchMenuCatalog } from '../services/menuApi';
import {
  AdminOrdersApiError,
  fetchAdminOrders,
  updateAdminOrder,
  usesStaticAdminSource,
} from '../services/adminOrdersApi';
import { getBrowserSupabase, hasBrowserSupabaseConfig } from '../lib/supabaseBrowser';
import { fetchOrderingStatus, updateOrderingPaused } from '../services/orderingSettingsApi';
import '../styles/admin.css';

function sortItemsByName(items) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
}

function AdminLogin({ error = '', onLogin, signingIn = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="admin-page admin-login-page">
      <form className="admin-login-card admin-surface" onSubmit={handleSubmit}>
        <div className="admin-login-copy">
          <p className="admin-kicker">Admin</p>
          <h1>Accesso area gestione</h1>
          <p>Accedi con il profilo admin configurato su Supabase.</p>
        </div>

        <label className="admin-field">
          <span>Email</span>
          <input
            autoComplete="email"
            autoFocus
            name="adminEmail"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            name="adminPassword"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="admin-login-error" role="alert">{error}</p> : null}

        <button className="admin-primary-button" type="submit" disabled={signingIn}>
          {signingIn ? 'Accesso...' : 'Entra'}
        </button>
      </form>
    </div>
  );
}

function AdminPage() {
  const staticAdminEnabled = usesStaticAdminSource();
  const [adminSession, setAdminSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [menuState, setMenuState] = useState(createEmptyAdminMenuState);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderingStatus, setOrderingStatus] = useState({ ordersPaused: false, updatedAt: null });
  const [orderingStatusLoading, setOrderingStatusLoading] = useState(false);
  const [orderingStatusSaving, setOrderingStatusSaving] = useState(false);
  const [orderingStatusError, setOrderingStatusError] = useState('');

  const items = useMemo(() => flattenAdminMenu(menuState), [menuState]);
  const categories = useMemo(
    () => menuState.map((category) => ({ id: category.id, name: category.name, slug: category.slug, count: category.items.length })),
    [menuState],
  );
  const allergenOptions = useMemo(() => getAdminAllergenOptions(menuState), [menuState]);
  const isAdminAuthenticated = Boolean(adminSession);
  const adminEmail = adminSession?.user?.email ?? '';

  useEffect(() => {
    if (!hasBrowserSupabaseConfig()) {
      setAuthLoading(false);
      setAuthError('Supabase Auth non e configurato per l area admin.');
      return undefined;
    }

    const client = getBrowserSupabase();
    let isActive = true;
    let subscription = null;

    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          setAuthError('Non riusciamo a verificare la sessione admin.');
        }

        setAdminSession(data?.session ?? null);
        setAuthLoading(false);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setAuthError('Non riusciamo a verificare la sessione admin.');
        setAdminSession(null);
        setAuthLoading(false);
      });

    const authState = client.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session);
      setAuthError('');
      setAuthLoading(false);
    });

    subscription = authState.data?.subscription ?? null;

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, []);

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
        slug: previousPizza?.slug ?? itemSlug,
        price: draft.price,
        allergens: draft.allergens,
        spicy: draft.spicy,
        vegetarian: draft.vegetarian,
        imagePath: draft.imagePath,
        active: draft.active,
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

  const refreshMenu = useCallback(async () => {
    if (!isAdminAuthenticated) {
      return;
    }

    setMenuLoading(true);

    try {
      const catalog = await fetchMenuCatalog();
      setMenuState(createAdminMenuStateFromCatalog(catalog));
      setMenuError('');
    } catch (error) {
      setMenuState(createEmptyAdminMenuState());
      setMenuError(error.message || 'Non riusciamo a leggere il menu.');
    } finally {
      setMenuLoading(false);
    }
  }, [isAdminAuthenticated]);

  const refreshOrders = useCallback(async ({ silent = false } = {}) => {
    if (!isAdminAuthenticated) {
      return;
    }

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
  }, [isAdminAuthenticated]);

  const changeOrderStatus = useCallback(async (orderId, status) => {
    const updatedOrder = await updateAdminOrder(orderId, status);

    if (updatedOrder) {
      setOrders((currentOrders) =>
        currentOrders.map((order) => (String(order.id) === String(orderId) ? updatedOrder : order)),
      );
    } else {
      await refreshOrders({ silent: true });
    }

    return updatedOrder;
  }, [refreshOrders]);

  const refreshOrderingStatus = useCallback(async () => {
    if (!isAdminAuthenticated) {
      return;
    }

    setOrderingStatusLoading(true);

    try {
      setOrderingStatus(await fetchOrderingStatus());
      setOrderingStatusError('');
    } catch (error) {
      setOrderingStatusError(error.message || 'Non riusciamo a leggere lo stato delle prenotazioni.');
    } finally {
      setOrderingStatusLoading(false);
    }
  }, [isAdminAuthenticated]);

  const changeOrderingPaused = useCallback(async (ordersPaused) => {
    setOrderingStatusSaving(true);
    setOrderingStatusError('');

    try {
      setOrderingStatus(await updateOrderingPaused(ordersPaused));
    } catch (error) {
      setOrderingStatusError(error.message || 'Non riusciamo ad aggiornare lo stato delle prenotazioni.');
    } finally {
      setOrderingStatusSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      setMenuState(createEmptyAdminMenuState());
      setMenuError('');
      setMenuLoading(false);
      return;
    }

    refreshMenu();
  }, [isAdminAuthenticated, refreshMenu]);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      setOrders([]);
      setOrdersError('');
      setOrdersLoading(false);
      return undefined;
    }

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
  }, [isAdminAuthenticated, refreshOrders]);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      setOrderingStatus({ ordersPaused: false, updatedAt: null });
      setOrderingStatusError('');
      setOrderingStatusLoading(false);
      return;
    }

    refreshOrderingStatus();
  }, [isAdminAuthenticated, refreshOrderingStatus]);

  const handleAdminLogin = useCallback(async ({ email, password }) => {
    const cleanEmail = String(email || '').trim();
    const cleanPassword = String(password || '');

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Inserisci email e password.');
      return;
    }

    const client = getBrowserSupabase();

    if (!client) {
      setAuthError('Supabase Auth non e configurato per l area admin.');
      return;
    }

    setSigningIn(true);
    setAuthError('');

    const { error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      setAuthError('Credenziali admin non valide.');
    }

    setSigningIn(false);
  }, []);

  const handleAdminSignOut = useCallback(async () => {
    const client = getBrowserSupabase();

    if (!client) {
      setAdminSession(null);
      return;
    }

    setSigningOut(true);
    await client.auth.signOut();
    setAdminSession(null);
    setSigningOut(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      items,
      categories,
      allergenOptions,
      menuLoading,
      menuError,
      orders,
      ordersLoading,
      ordersError,
      staticAdminEnabled,
      savePizza,
      deletePizza,
      createCategory,
      renameCategory,
      deleteCategory,
      refreshMenu,
      refreshOrders,
      changeOrderStatus,
    }),
    [
      items,
      categories,
      allergenOptions,
      menuLoading,
      menuError,
      orders,
      ordersLoading,
      ordersError,
      staticAdminEnabled,
      refreshMenu,
      refreshOrders,
      changeOrderStatus,
    ],
  );

  if (authLoading) {
    return (
      <div className="admin-page admin-login-page">
        <div className="admin-login-card admin-surface">
          <div className="admin-login-copy">
            <p className="admin-kicker">Admin</p>
            <h1>Verifica sessione</h1>
            <p>Controllo l accesso Supabase.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin error={authError} signingIn={signingIn} onLogin={handleAdminLogin} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <AdminSidebar
          adminEmail={adminEmail}
          onSignOut={handleAdminSignOut}
          signingOut={signingOut}
          usesStaticAuth
          vacationMode={orderingStatus.ordersPaused}
          vacationModeError={orderingStatusError}
          vacationModeLoading={orderingStatusLoading}
          vacationModeSaving={orderingStatusSaving}
          onVacationModeChange={changeOrderingPaused}
        />

        <main className="admin-main">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
