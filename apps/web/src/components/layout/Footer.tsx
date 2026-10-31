import React from 'react';
import { Compass, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white">
                <Compass className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-slate-900 text-base">Digital Dark Spot</span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed mb-4">
              AI-assisted research intelligence engineered to detect what information is missing,
              contradictory, outdated, or uncertain across verified web sources.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Evidence-grounded claims &bull; Shinchan Online Hackathon 2026</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/research" className="hover:text-indigo-600 transition-colors">
                  Research Workspace
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-indigo-600 transition-colors">
                  Saved Sessions
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-indigo-600 transition-colors">
                  Settings & Preferences
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Methodology
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
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
          <div className="flex items-center gap-4">
            <Link to="/settings" className="hover:text-slate-800">
              Privacy & Local Storage
            </Link>
            <span>&bull;</span>
            <span className="text-slate-400">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

