function StatusPanel({ title, message, actionLabel, onAction, tone = 'default' }) {
  return (
    <div className={`status-panel status-panel-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="status-panel-copy">
        <p className="status-panel-title">{title}</p>
        <p className="status-panel-message">{message}</p>
      </div>

      {actionLabel && onAction ? (
        <button className="status-panel-action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default StatusPanel;
