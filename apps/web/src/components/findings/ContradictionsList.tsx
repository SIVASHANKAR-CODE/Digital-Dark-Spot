import React from 'react';
import { Contradiction, Source } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GitCompare, AlertOctagon, HelpCircle, ArrowRight } from 'lucide-react';

export interface ContradictionsListProps {
  contradictions: Contradiction[];
  sources: Source[];
}

export function ContradictionsList({ contradictions, sources }: ContradictionsListProps) {
  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => sourceMap.set(s.id, s));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed_conflict':
        return <Badge variant="danger">Confirmed Discrepancy</Badge>;
      case 'possible_conflict':
        return <Badge variant="warning">Potential Conflict</Badge>;
      default:
        return <Badge variant="neutral">Under Investigation</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-rose-600" />
          <span>Cross-Source Contradictions ({contradictions.length})</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Explicit factual disagreements or divergent guidelines identified across distinct sources
        </p>
      </div>

      {contradictions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No explicit contradictions found across the reviewed source documents.
        </div>
      ) : (
        <div className="space-y-5">
          {contradictions.map((item) => {
            const srcA = sourceMap.get(item.claimA.sourceId);
            const srcB = sourceMap.get(item.claimB.sourceId);

            return (
              <Card key={item.id} className="border-rose-200/80 shadow-2xs">
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-semibold text-slate-900 text-base">{item.title}</span>
                    {getStatusBadge(item.status)}
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{item.description}</p>

                  {/* Side-by-Side Claims */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Claim A */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                            Source A Position
                          </span>
                          <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]">
                            {srcA?.domain || item.claimA.sourceId}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-2.5">
                          "{item.claimA.statement}"
                        </p>
                      </div>
                      {item.claimA.excerpt && (
                        <div className="pt-2.5 border-t border-slate-200/70 text-xs text-slate-500 italic font-serif">
                          Excerpt: "{item.claimA.excerpt}"
                        </div>
                      )}
                    </div>

                    {/* Claim B */}
                    <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                            Source B Position
                          </span>
                          <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]">
                            {srcB?.domain || item.claimB.sourceId}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-2.5">
                          "{item.claimB.statement}"
                        </p>
                      </div>
                      {item.claimB.excerpt && (
                        <div className="pt-2.5 border-t border-rose-200/70 text-xs text-rose-900/70 italic font-serif">
                          Excerpt: "{item.claimB.excerpt}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnostic Explanation */}
                  <div className="p-3.5 rounded-lg bg-slate-100 text-xs text-slate-700 mb-3 space-y-1">
                    <span className="font-semibold text-slate-900 block">Root Cause of Discrepancy:</span>
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>

                  {/* Suggested Resolution */}
                  {item.suggestedResolution && (
                    <div className="flex items-start gap-2 text-xs text-indigo-900 bg-indigo-50/80 p-3 rounded-lg border border-indigo-200/60">
                      <ArrowRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-indigo-950">Resolution Strategy: </strong>
                        {item.suggestedResolution}
                      </div>
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

