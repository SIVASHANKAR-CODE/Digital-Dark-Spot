import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Search,
  GitCompare,
  Clock,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ScrollReveal } from '../components/ui/ScrollReveal';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="down" delayMs={50}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Information Gap Detection Intelligence</span>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delayMs={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
                  Discover what’s <span className="text-indigo-600">missing</span> in your research.
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delayMs={150}>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl">
                  Most AI tools summarize what sources say. <strong>Digital Dark Spot</strong> analyzes what sources leave out, contradict, or leave unverified.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delayMs={200}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link to="/research">
                    <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Launch Research Session
                    </Button>
                  </Link>
                  <a href="#workflow">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Explore Detection Engine
                    </Button>
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delayMs={250}>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Strict Source Grounding
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Uncertainty Calibration
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Offline Installable PWA
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Dynamic Architectural Workflow Diagram */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="left" delayMs={200}>
                <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">VeriScope Engine v1.0</span>
                  </div>

                  {/* Flow Steps Visualizer */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          1
                        </span>
                        <span className="font-semibold text-slate-700">Source Ingestion</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">3 URLs Normalized</span>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                          2
                        </span>
                        <span className="font-semibold text-indigo-950">Grounding Matrix</span>
                      </div>
                      <Badge variant="indigo" size="sm">Cross-Referenced</Badge>
                    </div>

                    {/* Detected Output Cards */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                        <div className="flex items-center gap-1 text-amber-800 font-semibold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Blind Spot Found</span>
                        </div>
                        <p className="text-[11px] text-amber-900/80 line-clamp-2">
                          Unstated GPA renewal threshold in portal rules.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
                        <div className="flex items-center gap-1 text-rose-800 font-semibold mb-1">
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>Contradiction</span>
                        </div>
                        <p className="text-[11px] text-rose-900/80 line-clamp-2">
                          Deadline March 15 vs April 1 postmark rule.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-950">Prioritized Verification Plan</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700">4 Checkpoints</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal direction="up">
              <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                System Methodology
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                How Information Gap Detection Works
              </p>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Ordinary summaries compress text and hide omissions. Digital Dark Spot treats omissions and conflicting evidence as primary signals.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delayMs={50}>
              <Card className="h-full border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Multi-Source Ingestion</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Submit topic questions and external URLs. The platform extracts content via an SSRF-hardened pipeline, normalizing text and recording publication timestamps.
                  </p>
                </div>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={150}>
              <Card className="h-full border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Contrastive Grounding</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The engine extracts claims, aligns them into semantic matrices, and isolates areas where facts diverge, dates are stale, or crucial context is completely unaddressed.
                  </p>
                </div>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={250}>
              <Card className="h-full border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="p-6 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Verification Synthesis</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Rather than guessing answers, the system compiles a prioritized, user-editable verification checklist and exportable intelligence dossier with exact citations.
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal direction="up">
              <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                Core Capabilities
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Engineered for High-Stakes Investigation
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal direction="up" delayMs={50}>
              <Card className="p-6 bg-white border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Information Gap Isolation</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Identifies unanswered questions and absent disclosures across documents with prioritized severity labels.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={100}>
              <Card className="p-6 bg-white border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <GitCompare className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Discrepancy Cross-Examination</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pairs conflicting claims side-by-side with supporting excerpts and structural root cause analysis.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={150}>
              <Card className="p-6 bg-white border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Freshness & Decay Analysis</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Monitors publication timestamps and flags potentially outdated policies without assuming undated items are false.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={200}>
              <Card className="p-6 bg-white border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Zero-Hallucination Guardrails</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Strict rejection of synthetic URLs, invented citations, or unverified facts. Findings must trace to actual sources.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={250}>
              <Card className="p-6 bg-white border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Interactive Action Checklist</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Turns analytical blind spots into actionable next steps that researchers can check off and customize.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delayMs={300}>
              <Card className="p-6 bg-white border-slate-200 shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Formal Intelligence Dossiers</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Generates print-optimized, citation-rich research reports formatted for academic and professional review.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Interactive Scholarship Demo Preview */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                Demonstration Scenario
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                College Scholarship Verification Case Study
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                See how the system catches hidden traps that standard chatbots miss
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delayMs={100}>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Investigated Question</span>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  "What should a student verify before applying for a college scholarship?"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Example Gap */}
                <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="warning">Detected Blind Spot</Badge>
                    <span className="text-xs text-amber-700 font-medium">Critical</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Omission of Scholarship Displacement Policies
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reviewed articles outline application tips, but omit whether external awards cause universities to reduce institutional need-based grants dollar-for-dollar.
                  </p>
                  <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 p-2 rounded">
                    Action: Verify your university's outside-award displacement formula.
                  </div>
                </div>

                {/* Example Contradiction */}
                <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="danger">Discovered Contradiction</Badge>
                    <span className="text-xs text-rose-700 font-medium">High</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Submission Timestamp vs. Postmark Deadline
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Source A states submissions close at 11:59 PM EST online, whereas Source B instructs paper transcripts must be physically received 5 business days prior.
                  </p>
                  <div className="text-[11px] font-semibold text-rose-800 bg-rose-50 p-2 rounded">
                    Resolution: Request registrar transcripts 2 weeks in advance.
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link to="/research">
                  <Button variant="primary" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Try This Scenario in Live Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <ScrollReveal direction="up">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Begin your next investigation with clarity.
            </h2>
            <p className="text-slate-300 text-base max-w-xl mx-auto mt-3">
              Uncover the unknowns, eliminate contradictions, and verify before you decide.
            </p>
            <div className="pt-4">
              <Link to="/research">
                <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-md">
                  Start Information Gap Analysis
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

