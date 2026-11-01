import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Spinner } from '../components/ui/Spinner';
import { ProtectedRoute } from '../components/ProtectedRoute';

const LandingPage = lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ResearchPage = lazy(() =>
  import('../pages/ResearchPage').then((m) => ({ default: m.ResearchPage }))
);
const ResearchWorkspacePage = lazy(() =>
  import('../pages/ResearchWorkspacePage').then((m) => ({ default: m.ResearchWorkspacePage }))
);
const SavedResearchPage = lazy(() =>
  import('../pages/SavedResearchPage').then((m) => ({ default: m.SavedResearchPage }))
);
const ReportPage = lazy(() =>
  import('../pages/ReportPage').then((m) => ({ default: m.ReportPage }))
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

function PageLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12">
      <Spinner size="lg" label="Loading page..." />
    </div>
  );
}

export const router = createBrowserRouter([
  // Login page — standalone layout (no Header/Footer)
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  // Main app layout
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: 'research',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProtectedRoute>
              <ResearchPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'research/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProtectedRoute>
              <ResearchWorkspacePage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'research/:id/report',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'saved',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProtectedRoute>
              <SavedResearchPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoading />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
