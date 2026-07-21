import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import type { Role } from '../../types';
import { Sidebar } from './Sidebar';

const pageNames: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  challans: 'Challans'
};

function pageCrumb(pathname: string) {
  const [root, child] = pathname.split('/').filter(Boolean);
  const label = pageNames[root] ?? 'Dashboard';
  if (child === 'new') return `${label} / New`;
  if (child) return `${label} / Detail`;
  return label;
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <span className="page-crumb">
            <strong>{pageCrumb(location.pathname)}</strong>
          </span>
          <div className="topbar-search">
            <Search size={14} />
            <span>Search customer, SKU, challan...</span>
          </div>
          <div className="topbar-actions">
            <span className="role-short">{user?.role}</span>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <button className="icon-btn" onClick={logout} aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export function RoleGate({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}

export function PageActions({ children }: { children: React.ReactNode }) {
  return <div className="page-actions">{children}</div>;
}

export function HeaderBlock({ title, subtitle, actionTo, actionLabel }: { title: string; subtitle: string; actionTo?: string; actionLabel?: string }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{subtitle}</p>
      </div>
      {actionTo && actionLabel ? (
        <Link className="btn btn-primary" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function TabButton({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button className={active ? 'filter-tab active' : 'filter-tab'} onClick={onClick}>
      {children}
    </button>
  );
}
