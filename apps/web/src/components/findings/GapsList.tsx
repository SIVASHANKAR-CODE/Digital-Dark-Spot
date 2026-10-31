import React, { useState } from 'react';
import { InformationGap, Source } from '@/types';
import { Badge } from '../ui/Badge';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { AlertCircle, HelpCircle, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export interface GapsListProps {
  gaps: InformationGap[];
  sources: Source[];
}

export function GapsList({ gaps, sources }: GapsListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);

  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => sourceMap.set(s.id, s));

  const filteredGaps = gaps.filter((g) => {
    if (filter === 'all') return true;
    return g.importance === filter;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">Critical Blind Spot</Badge>;
      case 'high':
        return <Badge variant="warning">High Priority</Badge>;
      case 'medium':
        return <Badge variant="indigo">Moderate Gap</Badge>;
      default:
        return <Badge variant="neutral">Low Priority</Badge>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Identified Information Gaps ({gaps.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key questions and missing dimensions not resolved by reviewed sources
          </p>
        </div>

        {/* Priority Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['all', 'critical', 'high', 'medium'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filter === lvl
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredGaps.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No information gaps matching the selected priority filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGaps.map((gap) => {
            const isExpanded = expandedGapId === gap.id;

            return (
              <Card
                key={gap.id}
                className="border-slate-200 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(gap.importance)}
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {getCategoryLabel(gap.category)}
                      </span>
                    </div>
                    <ConfidenceBadge level={gap.confidence} />
                  </div>

                  <h4 className="text-base font-semibold text-slate-900 mb-1.5">{gap.title}</h4>
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">{gap.description}</p>

                  {/* Suggested Verification Action */}
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 mb-3">
                    <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-950">Recommended Action: </span>
                      {gap.suggestedAction}
                    </div>
                  </div>

                  {/* Expandable Evidence Reviewed section */}
                  <div>
                    <button
                      onClick={() => setExpandedGapId(isExpanded ? null : gap.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Evidence Reviewed' : 'Review Checked Evidence'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-2">
                        <p>
                          <strong className="text-slate-800">Evaluated Prior to Flagging Gap:</strong>{' '}
                          {gap.evidenceReviewed}
                        </p>
                        {gap.relatedSourceIds && gap.relatedSourceIds.length > 0 && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                            <span className="text-slate-500">Related Ingested Sources:</span>
                            <div className="flex flex-wrap gap-1">
                              {gap.relatedSourceIds.map((sid) => {
                                const src = sourceMap.get(sid);
                                return (
                                  <span
                                    key={sid}
                                    className="px-1.5 py-0.5 bg-white border rounded font-mono text-slate-700"
                                  >
                                    {src?.domain || sid}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

