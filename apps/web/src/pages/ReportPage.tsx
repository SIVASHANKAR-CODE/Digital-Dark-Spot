import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResearch } from '../lib/api';
import { ResearchSession } from '@/types';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  Printer,
  ChevronLeft,
  Compass,
  Calendar,
  AlertTriangle,
  GitCompare,
  Clock,
  CheckSquare,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const data = await getResearch(id);
        setSession(data);
      } catch (err: any) {
        setError(err.message || 'Unable to generate research dossier');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Spinner size="lg" label="Compiling report..." />
        <p className="mt-3 text-xs text-slate-500">Formatting research intelligence dossier...</p>
      </div>
    );
  }

  if (error || !session || !session.analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorAlert
          title="Dossier Incomplete"
          message={error || 'Analysis must be executed before generating the dossier.'}
        />
        <div className="mt-4">
          <Link to={`/research/${id}`} className="text-sm font-semibold text-indigo-600 hover:underline">
            &larr; Return to Workspace
          </Link>
        </div>
      </div>
    );
  }

  const { analysis, sources, checklist } = session;

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 print:bg-white print:py-0">
      {/* Print Control Toolbar */}
      <div className="max-w-4xl mx-auto px-4 mb-6 flex items-center justify-between print:hidden">
        <Link
          to={`/research/${session.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Formal Dossier Document Sheet */}
      <article className="max-w-4xl mx-auto bg-white border border-slate-200/90 shadow-md rounded-2xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-900">
        {/* Header Block */}
        <header className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                VeriScope Intelligence Dossier
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Information Gap & Contradiction Audit
            </h1>
          </div>
          <div className="text-left sm:text-right text-xs font-mono text-slate-500">
            <div>Dossier ID: {session.id.slice(0, 12)}</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </header>

        {/* Section 1: Research Question */}
        <section className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Subject Inquiry
          </span>
          <p className="text-base font-bold text-slate-950 leading-snug">{session.question}</p>
          {session.objective && (
            <p className="mt-2 text-xs text-slate-600">
              <strong>Objective: </strong>
              {session.objective}
            </p>
          )}
        </section>

        {/* Section 2: Executive Summary */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
            1. Executive Findings Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{analysis.summary.overview}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Core Facts</span>
              <p className="text-xl font-bold text-slate-900">{analysis.summary.keyFacts.length}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Detected Gaps</span>
              <p className="text-xl font-bold text-amber-800">{analysis.summary.totalGaps}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Contradictions</span>
              <p className="text-xl font-bold text-rose-800">{analysis.summary.totalContradictions}</p>
            </div>
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <span className="text-[10px] font-bold text-sky-700 uppercase">Freshness Flags</span>
              <p className="text-xl font-bold text-sky-800">{analysis.summary.totalFreshnessWarnings}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Information Gaps (Blind Spots) */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>2. Potential Information Gaps (Unstated & Missing Data)</span>
          </h2>

          <div className="space-y-4">
            {analysis.gaps.map((gap, idx) => (
              <div key={gap.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-900">
                    2.{idx + 1} {gap.title}
                  </span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {gap.importance} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{gap.description}</p>
                <div className="text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded border border-amber-200/60">
                  <strong>Verification Step: </strong>
                  {gap.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Contradictions */}
        {analysis.contradictions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-rose-600" />
              <span>3. Cross-Source Factual Discrepancies</span>
            </h2>

            <div className="space-y-4">
              {analysis.contradictions.map((c, idx) => (
                <div key={c.id} className="p-4 rounded-xl border border-rose-200 bg-white">
                  <span className="text-sm font-bold text-slate-900 block mb-2">
                    3.{idx + 1} {c.title}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-3 bg-slate-50 border rounded-lg">
                      <strong className="text-slate-800 block mb-1">Claim A Position:</strong>
                      <p className="text-slate-700 italic">"{c.claimA.statement}"</p>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <strong className="text-rose-900 block mb-1">Claim B Position:</strong>
                      <p className="text-rose-800 italic">"{c.claimB.statement}"</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Discrepancy Cause: </strong>
                    {c.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Verification Checklist */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>4. Actionable Verification Checkpoints</span>
          </h2>

          <div className="space-y-2 text-xs">
            {checklist.map((chk, idx) => (
              <div
                key={chk.id}
                className="flex items-start gap-2.5 p-2.5 rounded border border-slate-100 bg-slate-50"
              >
                <span className="font-mono text-slate-400 font-bold">{idx + 1}.</span>
                <div className="flex-1">
                  <span className={`font-semibold ${chk.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {chk.title}
                  </span>
                  {chk.description && <p className="text-slate-500 mt-0.5">{chk.description}</p>}
                </div>
                <span className="text-[10px] font-mono uppercase bg-white border px-1.5 py-0.5 rounded text-slate-600">
                  {chk.priority}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Sources Reviewed Bibliography */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
            5. Ingested Reference Sources
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
            {sources.map((s, idx) => (
              <li key={s.id} className="leading-relaxed">
                <span className="font-semibold text-slate-800">{s.title || s.domain}</span> &mdash;{' '}
                <span className="font-mono text-slate-500">{s.url}</span>
                {s.publishedDate && <span className="ml-1 text-slate-400">({s.publishedDate})</span>}
              </li>
            ))}
          </ol>
        </section>

        {/* Section 7: Audit Disclaimers */}
        <footer className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Epistemological Grounding Declaration</span>
          </div>
          <p>
            This dossier reports what was found and what was omitted in the specifically ingested web
            documents. Absence of a topic in these sources is classified as a potential information
            gap, not proof that the fact does not exist in wider literature.
          </p>
        </footer>
      </article>
    </div>
  );
}

