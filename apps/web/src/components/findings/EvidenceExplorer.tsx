import React, { useState } from 'react';
import { Finding, Source } from '@/types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { Search, ExternalLink, Quote, Filter, Link as LinkIcon } from 'lucide-react';

export interface EvidenceExplorerProps {
  findings: Finding[];
  sources: Source[];
}

export function EvidenceExplorer({ findings, sources }: EvidenceExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => sourceMap.set(s.id, s));

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.evidence.some((e) => e.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || f.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-indigo-600" />
            <span>Evidence Grounding Explorer ({findings.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit verbatim citations and excerpts that directly substantiate each generated finding
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search claims or citations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {filteredFindings.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No evidence items matching your query.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFindings.map((finding) => (
            <Card key={finding.id} className="border-slate-200 shadow-2xs">
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {finding.type}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">{finding.title}</h4>
                  </div>
                  <ConfidenceBadge level={finding.confidence} />
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{finding.description}</p>

                {/* Excerpts List */}
                {finding.evidence && finding.evidence.length > 0 && (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Substantiating Source Excerpts
                    </span>
                    {finding.evidence.map((ev, i) => {
                      const src = sourceMap.get(ev.sourceId);

                      return (
                        <div
                          key={i}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-mono font-medium text-indigo-700">
                              {src?.domain || ev.sourceId}
                            </span>
                            <span className="capitalize px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600 text-[10px]">
                              {ev.relevance} Evidence
                            </span>
                          </div>
                          <p className="font-serif italic text-slate-700 leading-relaxed">
                            "{ev.text}"
                          </p>
                          {src?.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start mt-1"
                            >
                              <span>View Source Context</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

