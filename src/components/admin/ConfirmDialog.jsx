function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Conferma',
  tone = 'danger',
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
      <button className="admin-modal-backdrop" type="button" aria-label="Chiudi conferma" onClick={onCancel} />

      <div className="admin-modal-panel admin-confirm-modal">
        <div className="admin-modal-content">
          <div className="admin-modal-head">
            <div>
              <p className="admin-kicker">Conferma</p>
              <h2 id="admin-confirm-title">{title}</h2>
            </div>
          </div>

          <p className="admin-confirm-message">{message}</p>

          <div className="admin-modal-actions">
            <button className="admin-secondary-button" type="button" onClick={onCancel}>
              Annulla
            </button>
            <button
              className={tone === 'danger' ? 'admin-danger-button' : 'admin-primary-button'}
              type="button"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
