import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getResearch,
  analyzeResearch,
  addSources,
  toggleChecklistItem,
  addChecklistItem,
} from '../lib/api';
import { ResearchSession, Priority } from '@/types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { Spinner } from '../components/ui/Spinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { SourceList } from '../components/sources/SourceList';
import { FindingsSummary } from '../components/findings/FindingsSummary';
import { GapsList } from '../components/findings/GapsList';
import { ContradictionsList } from '../components/findings/ContradictionsList';
import { FreshnessList } from '../components/findings/FreshnessList';
import { EvidenceExplorer } from '../components/findings/EvidenceExplorer';
import { VerificationChecklist } from '../components/checklist/VerificationChecklist';
import { AnalysisProgress } from '../components/research/AnalysisProgress';
import { DemoNotice } from '../components/research/DemoNotice';
import {
  FileText,
  AlertTriangle,
  GitCompare,
  Clock,
  ListChecks,
  Link as LinkIcon,
  Play,
  RotateCcw,
  Printer,
  ChevronLeft,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export function ResearchWorkspacePage() {
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<ResearchSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getResearch(id);
      setSession(data);
    } catch (err: any) {
      console.error('[Workspace] Fetch session error:', err);
      setError(err.message || 'Failed to retrieve research session');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const handleStartAnalysis = async () => {
    if (!id) return;
    try {
      setIsAnalyzing(true);
      setError(null);
      setSession((prev) => (prev ? { ...prev, status: 'extracting' } : null));

      await analyzeResearch(id);

      const updated = await getResearch(id);
      setSession(updated);
    } catch (err: any) {
      console.error('[Workspace] Run analysis error:', err);
      setError(err.message || 'Analysis run encountered an issue');
      try {
        const fallback = await getResearch(id);
        setSession(fallback);
      } catch {}
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSources = async (urls: string[]) => {
    if (!id) return;
    try {
      setIsLoading(true);
      await addSources(id, urls);
      await loadSession();
    } catch (err: any) {
      setError(err.message || 'Failed to append source URLs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!id || !session) return;
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      };
    });

    try {
      await toggleChecklistItem(id, itemId);
    } catch {
      loadSession();
    }
  };

  const handleAddChecklistItem = async (item: {
    title: string;
    description: string;
    priority: Priority;
  }) => {
    if (!id) return;
    try {
      await addChecklistItem(id, item);
      await loadSession();
    } catch (err: any) {
      setError(err.message || 'Failed to add verification checkpoint');
    }
  };

  if (isLoading && !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Spinner size="lg" label="Loading research session..." />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading session workspace...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full">
        <ErrorAlert title="Session Unavailable" message={error} onRetry={loadSession} />
        <div className="mt-4 text-center">
          <Link to="/research" className="text-sm font-semibold text-indigo-600 hover:underline">
            &larr; Return to New Research
          </Link>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const hasAnalysis = session.status === 'completed' && !!session.analysis;
  const isRunning = isAnalyzing || session.status === 'extracting' || session.status === 'analyzing';

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Summary & Facts',
      icon: <FileText className="w-4 h-4" />,
      badge: session.analysis?.summary?.keyFacts?.length,
    },
    {
      id: 'gaps',
      label: 'Information Gaps',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      badge: session.analysis?.gaps?.length,
    },
    {
      id: 'contradictions',
      label: 'Contradictions',
      icon: <GitCompare className="w-4 h-4 text-rose-500" />,
      badge: session.analysis?.contradictions?.length,
    },
    {
      id: 'freshness',
      label: 'Freshness Flags',
      icon: <Clock className="w-4 h-4 text-sky-500" />,
      badge: session.analysis?.freshnessWarnings?.length,
    },
    {
      id: 'evidence',
      label: 'Evidence Grounding',
      icon: <LinkIcon className="w-4 h-4" />,
      badge: session.analysis?.findings?.length,
    },
    {
      id: 'verification',
      label: 'Action Checklist',
      icon: <ListChecks className="w-4 h-4 text-emerald-600" />,
      badge: session.checklist?.length,
    },
    {
      id: 'sources',
      label: 'Source Ingestion',
      icon: <Layers className="w-4 h-4" />,
      badge: session.sources?.length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/research"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>New Research Session</span>
        </Link>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {hasAnalysis && (
            <Link to={`/research/${session.id}/report`} className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                View Dossier / Print
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleStartAnalysis}
            isLoading={isRunning}
            className="flex-1 sm:flex-initial"
            leftIcon={hasAnalysis ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          >
            {hasAnalysis ? 'Re-Analyze All Sources' : 'Run Gap Detection'}
          </Button>
        </div>
      </div>

      {/* Session Title Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <Badge
            variant={
              session.status === 'completed'
                ? 'success'
                : session.status === 'failed'
                ? 'danger'
                : isRunning
                ? 'info'
                : 'neutral'
            }
          >
            Status: {session.status.toUpperCase()}
          </Badge>
          <span className="text-xs text-slate-400 font-mono">ID: {session.id.slice(0, 8)}</span>
          {session.analyzedAt && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Analyzed {new Date(session.analyzedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
          {session.question}
        </h1>

        {session.objective && (
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            <span className="font-semibold text-slate-800">Target Objective: </span>
            {session.objective}
          </p>
        )}
      </div>

      {/* Demo Notification Banner if using benchmark mode */}
      {session.analysis?.modelUsed === 'demo' && <DemoNotice />}

      {error && <ErrorAlert title="Execution Alert" message={error} onRetry={loadSession} />}

      {/* Analysis Running Progress State */}
      {isRunning && (
        <AnalysisProgress status={session.status} sourceCount={session.sources.length} />
      )}

      {/* If Not Analyzed Yet, Prompt User to Review Sources and Analyze */}
      {!hasAnalysis && !isRunning && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Review Sources Prior to Grounding
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Verify your URLs below or add additional references. When ready, click{' '}
              <strong>"Run Gap Detection"</strong> to extract page contents, cross-verify claims,
              and identify missing information.
            </p>
          </div>

          <SourceList
            sources={session.sources}
            onAddSources={handleAddSources}
            isLoading={isLoading}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              size="lg"
              variant="primary"
              onClick={handleStartAnalysis}
              isLoading={isRunning}
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Sources Now
            </Button>
          </div>
        </div>
      )}

      {/* If Analysis is Complete, Show Full Multi-Tab Intelligence Dashboard */}
      {hasAnalysis && session.analysis && (
        <div className="space-y-6">
          {/* Navigation Tab Bar */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab)}
              className="bg-white rounded-xl border border-slate-200 px-3 sm:px-4 pt-1 shadow-2xs min-w-max sm:min-w-0"
            />
          </div>

          {/* Active Tab Panel */}
          <div>
            {activeTab === 'overview' && (
              <FindingsSummary analysis={session.analysis} sources={session.sources} />
            )}

            {activeTab === 'gaps' && (
              <GapsList gaps={session.analysis.gaps} sources={session.sources} />
            )}

            {activeTab === 'contradictions' && (
              <ContradictionsList
                contradictions={session.analysis.contradictions}
                sources={session.sources}
              />
            )}

            {activeTab === 'freshness' && (
              <FreshnessList
                warnings={session.analysis.freshnessWarnings}
                sources={session.sources}
              />
            )}

            {activeTab === 'evidence' && (
              <EvidenceExplorer
                findings={session.analysis.findings}
                sources={session.sources}
              />
            )}

            {activeTab === 'verification' && (
              <VerificationChecklist
                items={session.checklist}
                sources={session.sources}
                onToggleItem={handleToggleChecklist}
                onAddItem={handleAddChecklistItem}
              />
            )}

            {activeTab === 'sources' && (
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200">
                <SourceList
                  sources={session.sources}
                  onAddSources={handleAddSources}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
