import { useEffect, useRef } from 'react';

function MenuCategoryNav({ groups, activeGroupId, onSelect }) {
  const tabRefs = useRef({});

  useEffect(() => {
    const activeTab = tabRefs.current[activeGroupId];

    if (!activeTab) {
      return;
    }

    activeTab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeGroupId]);

  return (
    <section className="menu-catalog-tabs-shell" aria-label="Categorie del menu">
      <div className="menu-catalog-tabs-bar">
        <nav className="menu-catalog-tabs" aria-label="Categorie del menu">
          {groups.map((group) => (
            <button
              key={group.id}
              ref={(node) => {
                if (node) {
                  tabRefs.current[group.id] = node;
                } else {
                  delete tabRefs.current[group.id];
                }
              }}
              className={`menu-catalog-tab ${activeGroupId === group.id ? 'is-active' : ''}`}
              type="button"
              aria-pressed={activeGroupId === group.id}
              onClick={() => onSelect(group.id)}
            >
              <span className="menu-catalog-tab-label">{group.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

export default MenuCategoryNav;
