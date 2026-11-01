import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllResearch, deleteResearch, createResearch, analyzeResearch } from '../lib/api';
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
  Sparkles,
} from 'lucide-react';

const SAVED_CACHE_KEY = 'dds_saved_sessions_cache';

export function SavedResearchPage() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllResearch();
      setSessions(data);
      try {
        localStorage.setItem(SAVED_CACHE_KEY, JSON.stringify(data));
      } catch {}
    } catch (err: any) {
      console.warn('[SavedResearch] API unavailable, checking local cache:', err);
      // Attempt local cache fallback
      try {
        const cached = localStorage.getItem(SAVED_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            setIsLoading(false);
            return;
          }
        }
      } catch {}

      setError(
        err.status === 500
          ? 'Connecting to research intelligence engine... Please ensure the API service is running, or start a new analysis.'
          : err.message || 'Unable to retrieve research archives.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      setError(null);
      const session = await createResearch({
        question: 'What should a student verify before applying for a college scholarship?',
        objective: 'Identify hidden eligibility catches, conflicting deadlines, and unstated tax rules.',
        sourceUrls: [
          'https://www.studentaid.gov/scholarships-eligibility-overview',
          'https://www.fastweb.com/financial-aid/articles/scholarship-application-deadlines',
          'https://www.irs.gov/taxtopics/tc421-scholarship-grants-taxability',
        ],
      });

      await analyzeResearch(session.id);
      await loadSessions();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize sample investigation.');
    } finally {
      setIsSeeding(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const targetId = deleteId;
    setDeleteId(null);
    setError(null);

    // Immediately update local UI and cache
    const updated = sessions.filter((s) => s.id !== targetId);
    setSessions(updated);
    try {
      localStorage.setItem(SAVED_CACHE_KEY, JSON.stringify(updated));
    } catch {}

    // Send delete command to backend (idempotent)
    try {
      await deleteResearch(targetId);
    } catch (err: any) {
      console.warn('[SavedResearch] Backend delete notification:', err?.message || err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
        <Spinner size="lg" label="Loading saved research..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Research Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access previous investigation dossiers, verification progress, and citation records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/research" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="md" className="w-full sm:w-auto" leftIcon={<Plus className="w-4 h-4" />}>
              New Research
            </Button>
          </Link>
        </div>
      </div>

      {error && <ErrorAlert title="Connection Notice" message={error} onRetry={loadSessions} />}

      {sessions.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          title="No Saved Research Sessions"
          description="Start a new investigation session to detect information gaps and cross-reference sources."
          action={
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link to="/research" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto">Start Your First Session</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleSeedDemo}
                isLoading={isSeeding}
                leftIcon={<Sparkles className="w-4 h-4 text-indigo-600" />}
              >
                Load Sample Scholarship Study
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {sessions.map((item) => (
            <Card
              key={item.id}
              className="border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="p-4 sm:p-5">
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

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
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

              <div className="bg-slate-50 px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
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
