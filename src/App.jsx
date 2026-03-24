import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CookiePolicy from './pages/CookiePolicy';
import AdminPage from './pages/AdminPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import SiteLayout from './components/SiteLayout';
import ChiSiamoPage from './pages/ChiSiamoPage';
import HomePage from './pages/HomePage';
import MenuCatalogPage from './pages/MenuCatalogPage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<Navigate replace to="menu" />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="ordini" element={<AdminOrdersPage />} />
        </Route>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/pizze" element={<MenuCatalogPage />} />
          <Route path="/chi-siamo" element={<ChiSiamoPage />} />
          <Route path="/ordina" element={<OrderPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
