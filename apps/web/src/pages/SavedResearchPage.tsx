import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllResearch, deleteResearch } from '../lib/api';
import { ResearchSession } from '@/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  BookOpen,
  Calendar,
  Layers,
  AlertTriangle,
  GitCompare,
  Trash2,
  ArrowRight,
  Plus,
} from 'lucide-react';

export function SavedResearchPage() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllResearch();
      setSessions(data);
    } catch (err: any) {
      console.error('[SavedResearch] Fetch error:', err);
      setError(err.message || 'Unable to load saved research archives.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteResearch(deleteId);
      setSessions((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove research session.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Spinner size="lg" label="Loading saved research..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Research Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access previous investigation dossiers, verification progress, and citation records.
          </p>
        </div>

        <Link to="/research">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Research
          </Button>
        </Link>
      </div>

      {error && <ErrorAlert title="Archive Alert" message={error} onRetry={loadSessions} />}

      {sessions.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          title="No Saved Research Sessions"
          description="Start a new investigation session to detect information gaps and cross-reference sources."
          action={
            <Link to="/research">
              <Button variant="primary">Start Your First Session</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((item) => (
            <Card
              key={item.id}
              className="border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'success'
                          : item.status === 'failed'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.id.slice(0, 8)}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/research/${item.id}`} className="group block">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.question}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {item.sources?.length || 0} Sources
                  </span>

                  {item.analysis && (
                    <>
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.analysis.gaps?.length || 0} Gaps
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-700">
                        <GitCompare className="w-3.5 h-3.5" />
                        {item.analysis.contradictions?.length || 0} Conflicts
                      </span>
                    </>
                  )}

                  <span className="flex items-center gap-1.5 ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                <span className="text-xs text-slate-500">
                  {item.checklist?.filter((c) => c.completed).length || 0}/
                  {item.checklist?.length || 0} Checkpoints Done
                </span>
                <Link
                  to={`/research/${item.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Session Deletion"
        description="Are you sure you want to delete this research dossier? This action is permanent and cannot be undone."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          All extracted excerpts, identified information gaps, and verification progress for this
          inquiry will be removed from local storage and backend state.
        </p>
      </Modal>
    </div>
  );
}

