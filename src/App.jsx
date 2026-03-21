import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import ChiSiamoPage from './pages/ChiSiamoPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/chi-siamo" element={<ChiSiamoPage />} />
          <Route path="/ordina" element={<OrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
