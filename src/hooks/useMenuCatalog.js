import { useCallback, useEffect, useState } from 'react';
import { fetchPublicMenuCatalog } from '../services/menuService';

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
      const catalog = await fetchPublicMenuCatalog();
      setCategories(catalog.categories);
      setFeaturedItems(catalog.featuredItems);
      setItemsById(catalog.itemsById);
    } catch (fetchError) {
      setError(fetchError.message || 'Non riusciamo a caricare la carta in questo momento.');
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
