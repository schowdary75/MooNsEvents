import { createBrowserRouter } from 'react-router';
import { Component as NotFoundPage } from '../pages/NotFoundPage';
import { legacyAuthenticatedRoutes } from './legacyRouteManifest';

// React Router renders this only while it resolves the initial lazy route.
// Keeping it empty preserves the existing UI while avoiding the hydration
// warning emitted when no fallback is configured.
function HydrationFallback() {
  return null;
}

async function loadAuthenticatedLayout() {
  const { Route } = await import('./_authenticated');
  const Component = Route.options.component;
  if (!Component) throw new Error('Authenticated layout is not configured');
  return { Component };
}

export const router = createBrowserRouter([
  {
    path: '/',
    HydrateFallback: HydrationFallback,
    children: [
      { path: 'pricing', lazy: async () => ({ Component: (await import('./pricing')).default }) },
      { path: 'register', lazy: async () => ({ Component: (await import('./register')).default }) },
      {
        path: 'verify-email',
        lazy: async () => ({ Component: (await import('./verify-email')).default }),
      },
      {
        path: 'activate-owner',
        lazy: async () => ({ Component: (await import('./activate-owner')).default }),
      },
      {
        path: 'provisioning/:jobId',
        lazy: async () => ({ Component: (await import('./provisioning')).default }),
      },
      {
        path: 'legal/:document',
        lazy: async () => ({ Component: (await import('./legal')).default }),
      },
      {
        path: 'accept-invitation',
        lazy: async () => ({ Component: (await import('./accept-invitation')).default }),
      },
      {
        path: 'auth/sso/callback',
        lazy: async () => ({ Component: (await import('./sso-callback')).default }),
      },
      {
        path: 'platform-ops',
        lazy: async () => ({ Component: (await import('./platform-ops')).default }),
      },
      {
        path: 'login',
        lazy: async () => ({ Component: (await import('./login')).Route.options.component! }),
      },
      {
        path: 'lounge',
        lazy: async () => ({ Component: (await import('./lounge')).Route.options.component! }),
      },
      {
        path: 'client-hub',
        lazy: async () => ({
          Component: (await import('./client-hub')).Route.options.component!,
        }),
      },
      { lazy: loadAuthenticatedLayout, children: legacyAuthenticatedRoutes },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
