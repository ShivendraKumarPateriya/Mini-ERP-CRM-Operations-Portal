import { Box, FileText, LayoutDashboard, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../store/auth';
import type { Role } from '../../types';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[] },
  { to: '/products', label: 'Products', icon: Box, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[] },
  { to: '/challans', label: 'Challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[] }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const visibleNav = nav.filter((item) => user && item.roles.includes(user.role));
  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <>
      <aside className={clsx('sidebar', open && 'open')}>
        <div className="mobile-close">
          <button className="icon-btn" onClick={onClose} aria-label="Close navigation">
            <X size={16} />
          </button>
        </div>
        <div className="brand">
          <div className="brand-mark">O</div>
          <div>
            <div className="brand-name">OpsPro</div>
            <div className="brand-sub">ERP - CRM</div>
          </div>
        </div>
        <div className="nav-section-label">Overview</div>
        {visibleNav.slice(0, 1).map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx('nav-item', isActive && 'active')} onClick={onClose}>
            <item.icon className="ic" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="nav-section-label">Operations</div>
        {visibleNav.slice(1).map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx('nav-item', isActive && 'active')} onClick={onClose}>
            <item.icon className="ic" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="sidebar-foot">
          <div className="role-pill">
            <div className="role-avatar">{initials}</div>
            <div>
              <div className="role-name">{user?.name}</div>
              <div className="role-tag">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
      {open ? <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" /> : null}
    </>
  );
}
