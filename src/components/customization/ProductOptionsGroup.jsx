import { formatPrice } from '../../utils/formatPrice';

function getSelectionInstruction(group) {
  if (group.description) {
    return group.description;
  }

  if (group.selectionType === 'single') {
    return group.required ? 'Scegli 1 opzione' : 'Puoi scegliere 1 opzione';
  }

  if (group.minSelections > 0 && group.maxSelections < group.options.length) {
    return `Seleziona da ${group.minSelections} a ${group.maxSelections} opzioni`;
  }

  if (group.minSelections > 0) {
    return `Seleziona almeno ${group.minSelections} opzioni`;
  }

  if (group.maxSelections < group.options.length) {
    return `Puoi scegliere fino a ${group.maxSelections} opzioni`;
  }

  return 'Selezione multipla';
}

function ProductOptionsGroup({ group, selectedOptionIds, onToggle }) {
  const selectedCount = group.options.filter((option) => selectedOptionIds.includes(option.id)).length;
  const isInvalid = selectedCount < group.minSelections;

  return (
    <section className={`menu-product-options-group ${isInvalid ? 'is-invalid' : ''}`}>
      <div className="menu-product-options-head">
        <div>
          <h3>{group.name}</h3>
          <p>{getSelectionInstruction(group)}</p>
        </div>

        <span>{group.required ? 'Obbligatorio' : 'Facoltativo'}</span>
      </div>

      <div className="menu-product-options-list">
        {group.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);

          return (
            <button
              key={option.id}
              className={`menu-product-option ${isSelected ? 'is-selected' : ''}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(group, option.id)}
            >
              <span className="menu-product-option-check" aria-hidden="true" />

              <span className="menu-product-option-copy">
                <strong>{option.optionName}</strong>
                {option.description ? <small>{option.description}</small> : null}
              </span>

              <span className="menu-product-option-price">
                {option.priceDelta ? `+ ${formatPrice(option.priceDelta)}` : 'Incluso'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ProductOptionsGroup;
