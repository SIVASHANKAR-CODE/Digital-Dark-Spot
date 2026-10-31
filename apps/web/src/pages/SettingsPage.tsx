import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ShieldCheck, Moon, Sun, Database, RefreshCw, Key, Info } from 'lucide-react';

export function SettingsPage() {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    localStorage.clear();
    setResetSuccess(true);
    setResetModalOpen(false);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Preferences & Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage local client storage, accessibility settings, and API provider information.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          Local client cache and browser storage cleared successfully.
        </div>
      )}

      {/* Application Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Platform Overview & Architecture</span>
          </CardTitle>
          <CardDescription>
            Core engine build and runtime parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">Platform Name</span>
            <span className="font-semibold text-slate-900">Digital Dark Spot</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">Client Engine</span>
            <span className="font-mono text-xs text-slate-800">VeriScope PWA v1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">Hackathon Edition</span>
            <Badge variant="indigo">Shinchan Online Hackathon 2026</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">SSRF Protection Filter</span>
            <span className="text-emerald-700 font-semibold text-xs">Enabled (Loopback / RFC1918 Blocked)</span>
          </div>
        </CardContent>
      </Card>

      {/* Provider Connectivity Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <span>AI Provider Integration</span>
          </CardTitle>
          <CardDescription>
            Digital Dark Spot uses server-side adapters. Keys are never exposed to client browsers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p className="leading-relaxed">
            To enable live Google Gemini or OpenAI analysis, set the corresponding environment variables in your server configuration:
          </p>
          <div className="p-3.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
            <div className="text-slate-400"># apps/api/.env</div>
            <div>GEMINI_API_KEY=AIzaSy...</div>
            <div>AI_PROVIDER=gemini</div>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-900 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p>
              When running without an active key, the built-in high-fidelity benchmark model operates automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Local Storage & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <span>Data Privacy & Client Storage</span>
          </CardTitle>
          <CardDescription>
            All state is retained in your private browser session and the server you deploy to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            No research topics or extracted text are transmitted to unauthorized third parties. You can clear your local cache at any time.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
          >
            Clear Browser Cache
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Clear Client Storage?"
        description="This will clear your client-side theme and offline cache entries."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetData}>
              Clear Cache
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Local browser state will be reset. Active server sessions remain intact on the backend.
        </p>
      </Modal>
    </div>
  );
}

