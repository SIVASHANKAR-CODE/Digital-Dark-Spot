import React from 'react';
import { AnalysisResult, Source } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import {
  FileText,
  AlertTriangle,
  GitCompare,
  Clock,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export interface FindingsSummaryProps {
  analysis: AnalysisResult;
  sources: Source[];
}

export function FindingsSummary({ analysis, sources }: FindingsSummaryProps) {
  const { summary, limitations } = analysis;

  const sourceMap = new Map<string, Source>();
  sources.forEach((s, idx) => {
    sourceMap.set(s.id, { ...s, title: s.title || `Source ${idx + 1}` });
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Core Facts
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.keyFacts?.length || 0}</p>
          <span className="text-[11px] text-slate-400">Grounded in texts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Information Gaps
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary.totalGaps || 0}</p>
          <span className="text-[11px] text-slate-400">Unanswered questions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <GitCompare className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contradictions
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600">{summary.totalContradictions || 0}</p>
          <span className="text-[11px] text-slate-400">Cross-source disputes</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-sky-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Freshness Flags
            </span>
          </div>
          <p className="text-2xl font-bold text-sky-600">{summary.totalFreshnessWarnings || 0}</p>
          <span className="text-[11px] text-slate-400">Time-sensitive items</span>
        </div>
      </div>

      {/* Synthesis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Executive Synthesis & Grounding Context</span>
            <div className="flex items-center gap-1.5 text-xs font-normal text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
              <span>Strict AI Grounding Protocol Applied</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {summary.overview}
          </p>

          <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold">Verification Notice: </strong>
              {summary.confidenceNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Verified Core Facts */}
      {summary.keyFacts && summary.keyFacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Directly Supported Facts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.keyFacts.map((fact) => (
              <div
                key={fact.id}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 leading-snug">
                    {fact.statement}
                  </p>
                  <ConfidenceBadge level={fact.confidence} />
                </div>
                {fact.sourceIds && fact.sourceIds.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Sources:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {fact.sourceIds.map((sid) => {
                        const src = sourceMap.get(sid);
                        return (
                          <span
                            key={sid}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px]"
                          >
                            {src?.domain || sid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Epistemological Limitations */}
      {limitations && limitations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Investigation Limitations & Scope
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
            {limitations.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

