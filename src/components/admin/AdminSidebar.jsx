import { Link, NavLink } from 'react-router-dom';

const adminLinks = [
  { to: '/admin/menu', label: 'Menu', caption: 'Prodotti, categorie e filtri' },
  { to: '/admin/ordini', label: 'Ordini', caption: 'Servizio, stati e priorita' },
];

function AdminSidebar({ adminEmail = '', onSignOut = null, signingOut = false, usesStaticAuth = false }) {
  return (
    <aside className="admin-sidebar admin-surface">
      <div className="admin-sidebar-head">
        <p className="admin-kicker">Admin</p>
        <h2>Pannello gestione</h2>
        <p className="admin-sidebar-intro">Area operativa del ristorante, organizzata in due flussi distinti.</p>
        {usesStaticAuth && adminEmail ? <p className="admin-sidebar-intro">Sessione: {adminEmail}</p> : null}
      </div>

      <nav className="admin-sidebar-nav" aria-label="Navigazione admin">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'is-active' : ''}`}
            to={link.to}
            viewTransition
          >
            <span className="admin-sidebar-link-label">{link.label}</span>
            <small>{link.caption}</small>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link className="admin-primary-link" to="/menu/pizze" viewTransition>
          Apri menu cliente
        </Link>
        <Link className="admin-ghost-link" to="/" viewTransition>
          Torna al sito
        </Link>
        {usesStaticAuth && onSignOut ? (
          <button className="admin-ghost-button" type="button" onClick={onSignOut} disabled={signingOut}>
            {signingOut ? 'Disconnessione...' : 'Esci dall admin'}
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default AdminSidebar;
