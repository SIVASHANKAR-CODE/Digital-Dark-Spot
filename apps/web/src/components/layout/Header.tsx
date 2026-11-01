import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Search, BookOpen, Settings, Menu, Wifi, WifiOff, LogOut, User, Compass } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAuth } from '@/contexts/AuthContext';
import { MobileNav } from './MobileNav';

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation items — ONLY visible when logged in
  const navItems = [
    { name: 'Research Workspace', to: '/research', icon: <Search className="w-4 h-4" /> },
    { name: 'Saved Analyses', to: '/saved', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base leading-none">
              Digital Dark Spot
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5 hidden xs:block">
              Info Gap Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation — strictly hidden before login, shown ONLY after login */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline Status */}
          <div
            className={clsx(
              'hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border',
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            )}
            title={isOnline ? 'Online mode active' : 'Offline mode - showing cached data'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>Offline</span>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* New Session CTA */}
              <Link
                to="/research"
                className="hidden sm:inline-flex items-center justify-center text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                New Session
              </Link>

              {/* User Avatar / Dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold hover:bg-indigo-200 transition-colors border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden"
                  title={user?.name || 'Account'}
                  aria-label="User menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                  )}
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 divide-y divide-slate-100">
                      <div className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Settings</span>
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          navItems={navItems}
          isOnline={isOnline}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}
