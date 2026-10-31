import React, { useState } from 'react';
import { Source } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExternalLink, ChevronDown, ChevronUp, Calendar, AlertCircle, FileText } from 'lucide-react';

export interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (source.status) {
      case 'extracted':
        return <Badge variant="success">Extracted</Badge>;
      case 'fetching':
        return <Badge variant="info">Fetching...</Badge>;
      case 'partial':
        return <Badge variant="warning">Partial Content</Badge>;
      case 'failed':
        return <Badge variant="danger">Extraction Failed</Badge>;
      case 'blocked':
        return <Badge variant="danger">Blocked / Restricted</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
            S{index + 1}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {source.title || source.domain || 'Source Document'}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-mono text-slate-600 truncate max-w-xs">{source.domain}</span>
              {source.publishedDate && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {source.publishedDate}
                  </span>
                </>
              )}
              {source.metadata?.wordCount && (
                <>
                  <span>&bull;</span>
                  <span>{source.metadata.wordCount.toLocaleString()} words</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusBadge()}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
            title="Open original source URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {source.error && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{source.error}</span>
        </div>
      )}

      {source.contentExcerpt && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{expanded ? 'Hide Extracted Evidence Excerpt' : 'View Extracted Excerpt'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs font-serif text-slate-700 leading-relaxed max-h-48 overflow-y-auto border border-slate-200/60">
              {source.contentExcerpt}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

