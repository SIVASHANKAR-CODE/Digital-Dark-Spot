import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ShieldCheck, Database, RefreshCw, Key, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    localStorage.removeItem('dds_saved_sessions_cache');
    setResetSuccess(true);
    setResetModalOpen(false);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your research account, Google authentication status, and local storage cache.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium">
          Local research session cache cleared successfully.
        </div>
      )}

      {/* Account Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Active Account & Identity</span>
          </CardTitle>
          <CardDescription>
            Your authenticated researcher profile and sign-in credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold border border-indigo-200 flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Researcher'}</p>
                  <Badge variant={user?.role === 'admin' ? 'indigo' : 'neutral'}>
                    {user?.role?.toUpperCase() || 'USER'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    Provider: {user?.authProvider === 'google' ? 'Google Account' : 'Email / Password'}
                  </span>
                  {user?.emailVerified && (
                    <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="self-start sm:self-auto text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Provider Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <span>AI Provider Configuration</span>
          </CardTitle>
          <CardDescription>
            Digital Dark Spot uses server-side adapters. API keys are securely held on the backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">Active Engine</span>
            <Badge variant="indigo">Google Gemini / Local Benchmark</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">Citation Grounding</span>
            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strict Zero-Hallucination Guardrail
            </span>
          </div>

          <p className="text-xs text-slate-500 pt-1">
            To switch to a live Gemini API key, configure <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GEMINI_API_KEY</code> in <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">apps/api/.env</code>. When no key is set, the built-in offline benchmark model executes automatically.
          </p>
        </CardContent>
      </Card>

      {/* Local Storage & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <span>Local Cache Management</span>
          </CardTitle>
          <CardDescription>
            Manage offline snapshots and browser session storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Cached research dossiers are stored locally in your browser for offline availability. You can flush this cache without affecting your login credentials.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
          >
            Clear Local Cache
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Clear Local Research Cache?"
        description="This will clear your client-side offline cache entries."
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
        <p className="text-xs sm:text-sm text-slate-600">
          Your browser's cached research data will be refreshed from the server on next access.
        </p>
      </Modal>
    </div>
  );
}
