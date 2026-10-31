import React, { useState } from 'react';
import { Source } from '@/types';
import { SourceCard } from './SourceCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Globe } from 'lucide-react';

export interface SourceListProps {
  sources: Source[];
  onAddSources?: (urls: string[]) => void;
  isLoading?: boolean;
}

export function SourceList({ sources, onAddSources, isLoading = false }: SourceListProps) {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      setError('URL must begin with http:// or https://');
      return;
    }

    setError('');
    onAddSources?.([newUrl.trim()]);
    setNewUrl('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">
          Source Collection ({sources.length})
        </h3>
        <span className="text-xs text-slate-500">
          All external inputs undergo SSRF filtering and HTML sanitization
        </span>
      </div>

      <div className="space-y-3">
        {sources.map((source, index) => (
          <SourceCard key={source.id} source={source} index={index} />
        ))}
      </div>

      {onAddSources && (
        <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add another source URL (e.g. https://example.com/facts)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                error={error}
                leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={isLoading || !newUrl.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Source
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

