import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CategoriesPanel from '../components/admin/CategoriesPanel';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import MenuManager from '../components/admin/MenuManager';
import PizzaEditorModal from '../components/admin/PizzaEditorModal';

function AdminMenuPage() {
  const {
    items,
    categories,
    allergenOptions,
    savePizza,
    deletePizza,
    createCategory,
    renameCategory,
    deleteCategory,
  } = useOutletContext();

  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    spicyOnly: false,
    vegetarianOnly: false,
    sortBy: 'name-asc',
  });
  const [editorState, setEditorState] = useState({
    open: false,
    mode: 'create',
    pizza: null,
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    target: null,
    title: '',
    message: '',
    confirmLabel: 'Conferma',
  });

  const filteredItems = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    let nextItems = items.filter((item) => {
      if (filters.categoryId !== 'all' && item.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.spicyOnly && !item.spicy) {
        return false;
      }

      if (filters.vegetarianOnly && !item.vegetarian) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [item.name, item.categoryName, item.ingredients.join(' '), item.note]
        .join(' ')
        .toLowerCase()
        .includes(searchValue);
    });

    nextItems = [...nextItems].sort((left, right) => {
      if (filters.sortBy === 'price-asc') {
        return left.price - right.price;
      }

      if (filters.sortBy === 'price-desc') {
        return right.price - left.price;
      }

      if (filters.sortBy === 'category-asc') {
        return `${left.categoryName}-${left.name}`.localeCompare(`${right.categoryName}-${right.name}`, 'it', {
          sensitivity: 'base',
        });
      }

      return left.name.localeCompare(right.name, 'it', { sensitivity: 'base' });
    });

    return nextItems;
  }, [filters, items]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.search.trim()) {
      count += 1;
    }

    if (filters.categoryId !== 'all') {
      count += 1;
    }

    if (filters.spicyOnly) {
      count += 1;
    }

    if (filters.vegetarianOnly) {
      count += 1;
    }

    return count;
  }, [filters]);

  const updateFilters = (key, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  };

  const closeEditor = () => {
    setEditorState({ open: false, mode: 'create', pizza: null });
  };

  const openCreatePizza = () => {
    setEditorState({ open: true, mode: 'create', pizza: null });
  };

  const openEditPizza = (pizza) => {
    setEditorState({ open: true, mode: 'edit', pizza });
  };

  const openDeletePizzaDialog = (pizza) => {
    setConfirmState({
      open: true,
      type: 'pizza',
      target: pizza,
      title: `Rimuovere ${pizza.name}?`,
      message: 'La voce verra tolta solo dalla sessione corrente dell’admin.',
      confirmLabel: 'Rimuovi pizza',
    });
  };

  const openDeleteCategoryDialog = (category) => {
    setConfirmState({
      open: true,
      type: 'category',
      target: category,
      title: `Rimuovere ${category.name}?`,
      message:
        category.count > 0
          ? `La categoria contiene ${category.count} voci e verra rimossa insieme alla sua preview locale.`
          : 'La categoria vuota verra rimossa dalla vista corrente.',
      confirmLabel: 'Rimuovi categoria',
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      type: null,
      target: null,
      title: '',
      message: '',
      confirmLabel: 'Conferma',
    });
  };

  const handleConfirm = () => {
    if (confirmState.type === 'pizza' && confirmState.target) {
      deletePizza(confirmState.target);
    }

    if (confirmState.type === 'category' && confirmState.target) {
      deleteCategory(confirmState.target.id);
    }

    closeConfirm();
  };

  const handleSavePizza = (draft) => {
    savePizza(draft, editorState.mode === 'edit' ? editorState.pizza : null);
    closeEditor();
  };

  return (
    <>
      <MenuManager
        categories={categories}
        items={filteredItems}
        filters={filters}
        summary={{
          visibleCount: filteredItems.length,
          totalCount: items.length,
          categoryCount: categories.length,
          activeFilterCount,
        }}
        onFilterChange={updateFilters}
        onCreatePizza={openCreatePizza}
        onEditPizza={openEditPizza}
        onDeletePizza={openDeletePizzaDialog}
      />

      <CategoriesPanel
        categories={categories}
        onCreateCategory={createCategory}
        onRenameCategory={renameCategory}
        onRemoveCategory={openDeleteCategoryDialog}
      />

      <PizzaEditorModal
        open={editorState.open}
        mode={editorState.mode}
        pizza={editorState.pizza}
        categories={categories}
        allergenOptions={allergenOptions}
        onClose={closeEditor}
        onSave={handleSavePizza}
      />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default AdminMenuPage;
