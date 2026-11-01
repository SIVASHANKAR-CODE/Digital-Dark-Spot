import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, ArrowRight, Globe, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface ResearchFormProps {
  onSubmit: (data: { question: string; objective?: string; sourceUrls: string[] }) => void;
  isLoading?: boolean;
}

export function ResearchForm({ onSubmit, isLoading = false }: ResearchFormProps) {
  const [question, setQuestion] = useState('');
  const [objective, setObjective] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ question?: string; urls?: string }>({});

  const handleAddUrl = () => {
    if (urls.length < 10) {
      setUrls([...urls, '']);
    }
  };

  const handleRemoveUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    } else {
      setUrls(['']);
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
  };

  const loadScholarshipDemo = () => {
    setQuestion('What should a student verify before applying for a college scholarship?');
    setObjective(
      'Identify hidden eligibility catches, conflicting deadlines, unstated tax implications, and application verification steps across scholarship portals.'
    );
    setUrls([
      'https://www.studentaid.gov/scholarships-eligibility-overview',
      'https://www.fastweb.com/financial-aid/articles/scholarship-application-deadlines',
      'https://www.irs.gov/taxtopics/tc421-scholarship-grants-taxability',
    ]);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { question?: string; urls?: string } = {};

    if (!question.trim() || question.trim().length < 5) {
      newErrors.question = 'Please provide a clear question of at least 5 characters.';
    } else if (question.trim().length > 500) {
      newErrors.question = 'Question cannot exceed 500 characters.';
    }

    const filteredUrls = urls.map((u) => u.trim()).filter(Boolean);

    for (const u of filteredUrls) {
      if (!u.startsWith('http://') && !u.startsWith('https://')) {
        newErrors.urls = 'All URLs must begin with http:// or https://';
        break;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      question: question.trim(),
      objective: objective.trim() || undefined,
      sourceUrls: filteredUrls,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-md border-slate-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Initiate Research Session</CardTitle>
            <CardDescription>
              State your research inquiry and provide initial web URLs to analyze.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadScholarshipDemo}
            className="self-start sm:self-auto border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Load Scholarship Demo
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <Textarea
            label="Research Question or Investigation Topic"
            placeholder="e.g. What specific criteria determine renewable status for state STEM scholarships?"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            error={errors.question}
            maxChars={500}
            required
            helperText="Formulate as a specific question for optimal contradiction and blind spot discovery."
          />

          {/* Objective */}
          <Input
            label="Specific Research Objective (Optional)"
            placeholder="e.g. Focus on GPA renewal thresholds, residency requirements, and gap years."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            helperText="Directs the AI to prioritize specific dimensions of the topic."
          />

          {/* Source URLs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Source URLs to Ingest & Cross-Examine
              </label>
              <span className="text-xs text-slate-400">{urls.length}/10 sources</span>
            </div>

            {errors.urls && <p className="text-xs text-rose-600">{errors.urls}</p>}

            <div className="space-y-2.5">
              {urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="https://example.edu/program-rules"
                      value={url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      leftIcon={<Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUrl(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 flex-shrink-0"
                    title="Remove URL"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {urls.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddUrl}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="mt-1"
              >
                Add Another URL
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>SSRF-protected content extraction & normalization</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Analysis
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
