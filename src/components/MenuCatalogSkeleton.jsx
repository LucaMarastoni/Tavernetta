function MenuCatalogSkeleton({ variant = 'menu' }) {
  return (
    <div className={`menu-skeleton menu-skeleton-${variant}`} aria-hidden="true">
      <div className="menu-skeleton-sidebar">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="menu-skeleton-chip" />
        ))}
      </div>

      <div className="menu-skeleton-content">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="menu-skeleton-card">
            <span className="menu-skeleton-line menu-skeleton-line-title" />
            <span className="menu-skeleton-line menu-skeleton-line-copy" />
            <span className="menu-skeleton-line menu-skeleton-line-copy short" />

            <div className="menu-skeleton-items">
              {Array.from({ length: variant === 'order' ? 3 : 4 }).map((__, itemIndex) => (
                <div key={itemIndex} className="menu-skeleton-item">
                  <span className="menu-skeleton-line menu-skeleton-line-item" />
                  <span className="menu-skeleton-line menu-skeleton-line-copy short" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuCatalogSkeleton;
