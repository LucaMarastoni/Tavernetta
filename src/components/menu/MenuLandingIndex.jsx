function MenuLandingIndex({ groups, onSelectGroup }) {
  return (
    <section className="ordering-index-shell" aria-labelledby="ordering-index-title">
      <div className="ordering-index-head">
        <p id="ordering-index-title" className="ordering-index-intro">
          Clicca per scoprire nel dettaglio il nostro menu.
        </p>
      </div>

      <div className="ordering-index-stage" aria-label="Categorie principali del menu">
        {groups.map((group) => {
          return (
            <button
              key={group.id}
              className={`ordering-index-word is-${group.id} ${group.isAvailable ? 'is-available' : 'is-muted'}`}
              type="button"
              onClick={() => {
                if (group.isAvailable) {
                  onSelectGroup(group.id);
                }
              }}
              disabled={!group.isAvailable}
            >
              <span className="ordering-index-word-text">{group.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default MenuLandingIndex;
