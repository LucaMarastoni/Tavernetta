import { CartProvider } from '../context/CartContext';
import { CookieProvider } from '../context/CookieContext';
import { Outlet } from 'react-router-dom';
import { pageNavigation } from '../data/siteContent';
import CookieBanner from './cookie/CookieBanner';
import ConsentScriptsManager from './cookie/ConsentScriptsManager';
import CookiePreferencesModal from './cookie/CookiePreferencesModal';
import CursorFollower from './CursorFollower';
import Header from './Header';
import ScrollManager from './ScrollManager';

function SiteLayout() {
  return (
    <CookieProvider>
      <CartProvider>
        <div className="page-shell">
          <CursorFollower />
          <ScrollManager />
          <ConsentScriptsManager />
          <Header navigation={pageNavigation} />

          <main id="content">
            <Outlet />
          </main>

          <CookieBanner />
          <CookiePreferencesModal />
        </div>
      </CartProvider>
    </CookieProvider>
  );
}

export default SiteLayout;
