import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-slate-900 text-base">Digital Dark Spot</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed mb-4">
              AI-assisted research intelligence engineered to detect what information is missing,
              contradictory, outdated, or uncertain across verified web sources.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Evidence-grounded claims &bull; Shinchan Online Hackathon 2026</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to={isAuthenticated ? '/research' : '/login'} className="hover:text-indigo-600 transition-colors">
                  Research Workspace
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? '/saved' : '/login'} className="hover:text-indigo-600 transition-colors">
                  Saved Sessions
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/settings" className="hover:text-indigo-600 transition-colors">
                    Settings
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Methodology
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <span className="text-slate-500">SSRF Safe Fetching</span>
              </li>
              <li>
                <span className="text-slate-500">Grounding Cross-Check</span>
              </li>
              <li>
                <span className="text-slate-500">Uncertainty Scoring</span>
              </li>
              <li>
                <span className="text-slate-500">Offline PWA Shell</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>&copy; {new Date().getFullYear()} Digital Dark Spot. All rights reserved.</p>
          <span className="text-slate-400">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
