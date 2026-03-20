import { Outlet } from 'react-router-dom';
import { pageNavigation } from '../data/siteContent';
import CursorFollower from './CursorFollower';
import Header from './Header';
import ScrollManager from './ScrollManager';

function SiteLayout() {
  return (
    <div className="page-shell">
      <CursorFollower />
      <ScrollManager />
      <Header navigation={pageNavigation} />

      <main id="content">
        <Outlet />
      </main>
    </div>
  );
}

export default SiteLayout;
