import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Search, Compass, BookOpen, Settings, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { MobileNav } from './MobileNav';

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const navItems = [
    { name: 'Research Workspace', to: '/research', icon: <Search className="w-4 h-4" /> },
    { name: 'Saved Analyses', to: '/saved', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
              Digital Dark Spot
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
              Info Gap Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Online / Offline Status + Action */}
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
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

          <Link
            to="/research"
            className="hidden sm:inline-flex items-center justify-center text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            New Session
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navItems={navItems}
        isOnline={isOnline}
      />
    </header>
  );
}

