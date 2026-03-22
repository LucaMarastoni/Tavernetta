import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { COOKIE_CATEGORIES } from '../../utils/consentStorage';

function CookiePreferencesModal() {
  const { closePreferences, isPreferencesOpen, preferences, rejectAll, savePreferences } = useCookieConsent();
  const [draftPreferences, setDraftPreferences] = useState(preferences);

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraftPreferences(preferences);
    }
  }, [isPreferencesOpen, preferences]);

  if (!isPreferencesOpen) {
    return null;
  }

  const handleToggle = (key) => {
    setDraftPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: !currentPreferences[key],
    }));
  };

  return (
    <div className="cookie-modal-shell" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
      <button className="cookie-modal-backdrop" type="button" aria-label="Chiudi preferenze cookie" onClick={closePreferences} />

      <section className="cookie-modal">
        <header className="cookie-modal-header">
          <div>
            <p className="cookie-banner-eyebrow">Preferenze cookie</p>
            <h2 id="cookie-modal-title">Scegli con precisione quali categorie attivare.</h2>
            <p>
              Manteniamo sempre attivi i cookie necessari. Le altre categorie si attivano solo se lo desideri e puoi
              modificarle in qualsiasi momento dal footer.
            </p>
          </div>

          <button className="cookie-button cookie-button-ghost" type="button" onClick={closePreferences}>
            Chiudi
          </button>
        </header>

        <div className="cookie-category-list">
          {COOKIE_CATEGORIES.map((category) => (
            <article key={category.key} className="cookie-category-card">
              <div className="cookie-category-copy">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>

              <label className={`cookie-toggle ${category.required ? 'is-disabled' : ''}`}>
                <input
                  checked={category.required ? true : Boolean(draftPreferences[category.key])}
                  disabled={category.required}
                  type="checkbox"
                  onChange={() => handleToggle(category.key)}
                />
                <span className="cookie-toggle-track" aria-hidden="true">
                  <span className="cookie-toggle-thumb" />
                </span>
                <span className="cookie-toggle-label">
                  {category.required ? 'Sempre attivi' : draftPreferences[category.key] ? 'Attivi' : 'Disattivi'}
                </span>
              </label>
            </article>
          ))}
        </div>

        <footer className="cookie-modal-footer">
          <p>
            Dettagli completi in{' '}
            <Link to="/privacy-policy" viewTransition onClick={closePreferences}>
              Privacy Policy
            </Link>{' '}
            e{' '}
            <Link to="/cookie-policy" viewTransition onClick={closePreferences}>
              Cookie Policy
            </Link>.
          </p>

          <div className="cookie-banner-actions">
            <button className="cookie-button cookie-button-ghost" type="button" onClick={rejectAll}>
              Rifiuta tutto
            </button>
            <button className="cookie-button cookie-button-primary" type="button" onClick={() => savePreferences(draftPreferences)}>
              Salva preferenze
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default CookiePreferencesModal;
