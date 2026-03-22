import { useCallback, useEffect, useState } from 'react';
import { fetchMenuCatalog } from '../services/menuApi';

export function useMenuCatalog() {
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [itemsById, setItemsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const catalog = await fetchMenuCatalog();
      setCategories(catalog.categories ?? []);
      setFeaturedItems(catalog.featuredItems ?? []);
      setItemsById(catalog.itemsById ?? {});
    } catch (fetchError) {
      setError(fetchError.message || 'Non riusciamo a caricare il menu in questo momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return {
    categories,
    featuredItems,
    itemsById,
    loading,
    error,
    refetch: loadCatalog,
  };
}
