import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
        404 Error
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
        The requested research dossier or page could not be located in this session.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Platform Home
        </Button>
      </Link>
    </div>
  );
}

