import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/tickets', label: 'Tickets', icon: '🎟️' },
  { to: '/admin/parchi-types', label: 'Parchi Types', icon: '🏷️' },
  { to: '/admin/membership-types', label: 'Memberships', icon: '🎫' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-sidebar-gradient flex flex-col shadow-teal-lg
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto lg:shrink-0
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl">🎫</div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Parchi System</h1>
              <p className="text-teal-200 text-xs">Admin Panel</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-teal-200 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDark}
              className="flex-1 text-teal-100 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-medium transition-all text-center"
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 text-teal-100 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-medium transition-all text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-sidebar-gradient px-4 py-3 flex items-center gap-3 shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg hover:bg-white/30 transition-all"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎫</span>
            <span className="text-white font-bold text-base">Parchi System</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="text-white/80 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-white/10 border border-white/20"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}