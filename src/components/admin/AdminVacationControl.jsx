function AdminVacationControl({ checked, error = '', loading = false, onChange, saving = false }) {
  const disabled = loading || saving;

  return (
    <section className={`admin-vacation-control ${checked ? 'is-active' : ''}`}>
      <div className="admin-vacation-copy">
        <p className="admin-kicker">Prenotazioni</p>
        <strong>In vacanza</strong>
        <p>{checked ? 'I nuovi ordini sono bloccati.' : 'I nuovi ordini sono aperti.'}</p>
      </div>

      <label className="admin-vacation-switch">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="admin-vacation-switch-track" aria-hidden="true">
          <span className="admin-vacation-switch-thumb" />
        </span>
        <span className="admin-vacation-switch-label">
          {loading ? 'Caricamento...' : saving ? 'Salvataggio...' : checked ? 'Attivo' : 'Disattivo'}
        </span>
      </label>

      {error ? <p className="admin-vacation-error" role="alert">{error}</p> : null}
    </section>
  );
}

export default AdminVacationControl;
