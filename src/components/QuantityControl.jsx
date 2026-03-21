function QuantityControl({ value, onDecrease, onIncrease, compact = false }) {
  return (
    <div className={`quantity-control ${compact ? 'is-compact' : ''}`} aria-label="Controllo quantita">
      <button className="quantity-control-button" type="button" aria-label="Riduci quantita" onClick={onDecrease}>
        -
      </button>

      <span className="quantity-control-value" aria-live="polite">
        {value}
      </span>

      <button className="quantity-control-button" type="button" aria-label="Aumenta quantita" onClick={onIncrease}>
        +
      </button>
    </div>
  );
}

export default QuantityControl;
