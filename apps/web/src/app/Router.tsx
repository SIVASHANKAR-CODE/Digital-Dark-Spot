import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Spinner } from '../components/ui/Spinner';

const LandingPage = lazy(() =>
  import('../pages/LandingPage').then((m) => ({ default: m.LandingPage }))
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
            <ResearchPage />
          </Suspense>
        ),
      },
      {
        path: 'research/:id',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ResearchWorkspacePage />
          </Suspense>
        ),
      },
      {
        path: 'research/:id/report',
        element: (
          <Suspense fallback={<PageLoading />}>
            <ReportPage />
          </Suspense>
        ),
      },
      {
        path: 'saved',
        element: (
          <Suspense fallback={<PageLoading />}>
            <SavedResearchPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoading />}>
            <SettingsPage />
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

