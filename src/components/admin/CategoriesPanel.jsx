import { useEffect, useState } from 'react';

function CategoriesPanel({ categories, onCreateCategory, onRenameCategory, onRemoveCategory }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    if (!categories.some((category) => category.id === editingCategoryId)) {
      setEditingCategoryId(null);
      setEditingValue('');
    }
  }, [categories, editingCategoryId]);

  const handleCreate = () => {
    const created = onCreateCategory(newCategoryName);

    if (created) {
      setNewCategoryName('');
      setIsCreating(false);
    }
  };

  const handleRename = () => {
    const renamed = onRenameCategory(editingCategoryId, editingValue);

    if (renamed) {
      setEditingCategoryId(null);
      setEditingValue('');
    }
  };

  return (
    <section className="admin-section admin-surface" aria-labelledby="admin-categories-title">
      <div className="admin-section-head">
        <div>
          <p className="admin-kicker">Categorie</p>
          <h2 id="admin-categories-title">Struttura menu</h2>
          <p className="admin-section-intro">Le categorie arrivano dal JSON, ma qui puoi simulare rinomina e gestione della struttura.</p>
        </div>

        <button className="admin-secondary-button" type="button" onClick={() => setIsCreating((current) => !current)}>
          {isCreating ? 'Chiudi' : 'Aggiungi categoria'}
        </button>
      </div>

      {isCreating ? (
        <div className="admin-inline-editor">
          <label className="admin-field">
            <span>Nuova categoria</span>
            <input
              type="text"
              placeholder="Es. Dessert"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
          </label>

          <div className="admin-inline-editor-actions">
            <button className="admin-secondary-button" type="button" onClick={() => setIsCreating(false)}>
              Annulla
            </button>
            <button className="admin-primary-button" type="button" onClick={handleCreate}>
              Crea
            </button>
          </div>
        </div>
      ) : null}

      <div className="admin-categories-list" role="list">
        {categories.map((category) => {
          const isEditing = editingCategoryId === category.id;

          return (
            <article key={category.id} className="admin-category-row" role="listitem">
              <div className="admin-category-row-main">
                {isEditing ? (
                  <label className="admin-field admin-field-inline">
                    <span className="sr-only">Nome categoria</span>
                    <input type="text" value={editingValue} onChange={(event) => setEditingValue(event.target.value)} />
                  </label>
                ) : (
                  <>
                    <h3>{category.name}</h3>
                    <p>{category.count === 1 ? '1 pizza in carta' : `${category.count} pizze in carta`}</p>
                  </>
                )}
              </div>

              <div className="admin-row-actions">
                {isEditing ? (
                  <>
                    <button className="admin-secondary-button" type="button" onClick={() => setEditingCategoryId(null)}>
                      Annulla
                    </button>
                    <button className="admin-primary-button" type="button" onClick={handleRename}>
                      Salva
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="admin-secondary-button"
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingValue(category.name);
                      }}
                    >
                      Rinomina
                    </button>
                    <button className="admin-danger-button" type="button" onClick={() => onRemoveCategory(category)}>
                      Rimuovi
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CategoriesPanel;
