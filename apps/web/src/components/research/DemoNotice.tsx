import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DemoNoticeProps {
  message?: string;
}

export function DemoNotice({
  message = 'Demonstration Mode: Using high-fidelity synthetic benchmark data for scholarship verification. Live AI analysis is active when API keys are configured.',
}: DemoNoticeProps) {
  return (
    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-4 text-indigo-900 flex items-start gap-3 shadow-xs">
      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-indigo-950">Grounding Benchmark Active</p>
        <p className="text-indigo-800/90 mt-0.5 leading-relaxed">{message}</p>
      </div>
      <Link
        to="/settings"
        className="text-xs font-semibold text-indigo-700 hover:text-indigo-950 underline underline-offset-2 flex-shrink-0 self-center"
      >
        Configure Keys
      </Link>
    </div>
  );
}

