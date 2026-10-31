import React from 'react';
import { FreshnessWarning, Source } from '@/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, AlertTriangle, Calendar, Info } from 'lucide-react';

export interface FreshnessListProps {
  warnings: FreshnessWarning[];
  sources: Source[];
}

export function FreshnessList({ warnings, sources }: FreshnessListProps) {
  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => sourceMap.set(s.id, s));

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'outdated_content':
        return <Badge variant="danger">Outdated Rules</Badge>;
      case 'missing_date':
        return <Badge variant="warning">Missing Publication Date</Badge>;
      case 'rapidly_evolving_topic':
        return <Badge variant="indigo">High Velocity Topic</Badge>;
      case 'superseded_information':
        return <Badge variant="danger">Superseded Reference</Badge>;
      default:
        return <Badge variant="neutral">Review Needed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-600" />
          <span>Information Freshness & Temporal Integrity ({warnings.length})</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluating publication dates, regulatory expiration cycles, and missing timestamp metadata
        </p>
      </div>

      <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold">Policy Note: </strong>
          Absence of a date tag is flagged for manual verification, but is not treated as definitive evidence of obsolescence without supporting domain signals.
        </p>
      </div>

      {warnings.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          All reviewed sources contain recent timestamps and consistent temporal markers.
        </div>
      ) : (
        <div className="space-y-4">
          {warnings.map((warning) => {
            const src = sourceMap.get(warning.sourceId);

            return (
              <Card key={warning.id} className="border-slate-200 shadow-2xs">
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getReasonBadge(warning.reason)}
                      <span className="text-xs font-mono text-slate-600 truncate max-w-xs">
                        {src?.domain || warning.sourceId}
                      </span>
                    </div>

                    {warning.publishedDate && (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Timestamp: {warning.publishedDate}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{warning.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{warning.explanation}</p>

                  {src?.url && (
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      Source URL: {src.url}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

