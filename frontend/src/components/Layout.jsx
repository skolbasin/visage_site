import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main style={{ paddingTop: 'var(--header-height)' }}>
        <Outlet />
      </main>
    </div>
  );
}