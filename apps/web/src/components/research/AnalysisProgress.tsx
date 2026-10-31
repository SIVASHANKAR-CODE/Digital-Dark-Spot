import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from '../ui/Progress';

export interface AnalysisProgressProps {
  status: 'draft' | 'collecting_sources' | 'extracting' | 'analyzing' | 'completed' | 'failed' | string;
  sourceCount: number;
}

export function AnalysisProgress({ status, sourceCount }: AnalysisProgressProps) {
  const steps = [
    { id: 'validate', label: 'Validate Parameters & URLs' },
    { id: 'extract', label: `Extract & Sanitize Content (${sourceCount} sources)` },
    { id: 'analyze', label: 'Cross-Reference Claims & Gap Detection' },
    { id: 'checklist', label: 'Generate Prioritized Verification Plan' },
  ];

  let currentStepIndex = 0;
  let progressPercentage = 10;

  if (status === 'draft') {
    currentStepIndex = 0;
    progressPercentage = 15;
  } else if (status === 'extracting' || status === 'collecting_sources') {
    currentStepIndex = 1;
    progressPercentage = 45;
  } else if (status === 'analyzing') {
    currentStepIndex = 2;
    progressPercentage = 80;
  } else if (status === 'completed') {
    currentStepIndex = 4;
    progressPercentage = 100;
  } else if (status === 'failed') {
    progressPercentage = 100;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Running Research Intelligence</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-verifying source texts and isolating blind spots
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          {progressPercentage}% Completed
        </div>
      </div>

      <Progress value={progressPercentage} className="mb-6" />

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = currentStepIndex > idx || status === 'completed';
          const isCurrent = currentStepIndex === idx && status !== 'completed' && status !== 'failed';
          const isFailed = status === 'failed' && currentStepIndex === idx;

          return (
            <div
              key={step.id}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors',
                isCurrent && 'bg-indigo-50/50 border-indigo-200 font-medium text-indigo-950',
                isDone && 'bg-slate-50 border-slate-200/60 text-slate-700',
                !isCurrent && !isDone && 'bg-white border-transparent text-slate-400',
                isFailed && 'bg-rose-50 border-rose-200 text-rose-800'
              )}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : isFailed ? (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <span className="flex-1">{step.label}</span>
              {isCurrent && (
                <span className="text-xs text-indigo-600 font-medium animate-pulse">Processing...</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

