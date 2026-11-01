import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResearchForm } from '../components/research/ResearchForm';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { createResearch } from '../lib/api';
import { Compass } from 'lucide-react';

export function ResearchPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    question: string;
    objective?: string;
    sourceUrls: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await createResearch({
        question: data.question,
        objective: data.objective,
        sourceUrls: data.sourceUrls,
      });

      navigate(`/research/${session.id}`);
    } catch (err: any) {
      console.error('[ResearchPage] Creation error:', err);
      setError(
        err.message || 'Unable to initialize research session. Please verify backend connectivity.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
      <div className="max-w-3xl mx-auto mb-6 sm:mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          <span>New Research Intelligence Project</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Define Your Research Scope
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Enter the subject of your query and provide external URLs to begin systematic gap detection.
        </p>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <ErrorAlert title="Session Error" message={error} onRetry={() => setError(null)} />
        </div>
      )}

      <ResearchForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
