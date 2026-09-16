import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';

type LegacyRouteModule = {
  Route: {
    options: {
      component?: ComponentType;
      loader?: (...args: any[]) => unknown;
      errorComponent?: ComponentType;
    };
  };
};

const lazyRoute = (importer: () => Promise<LegacyRouteModule>) => async () => {
  const module = await importer();
  const options = module.Route.options;
  if (!options.component) throw new Error('Legacy route has no component');
  return {
    Component: options.component,
    loader: options.loader,
    ErrorBoundary: options.errorComponent,
  };
};

export const LEGACY_AUTHENTICATED_ROUTE_COUNT = 58;

export const legacyAuthenticatedRoutes: RouteObject[] = [
  /* — Event onboarding & governance — */
  { path: 'onboarding', lazy: lazyRoute(() => import('./_authenticated/onboarding')) },
  { path: 'approvals', lazy: lazyRoute(() => import('./_authenticated/approvals')) },

  /* — Event assets & banners — */
  { path: 'assets', lazy: lazyRoute(() => import('./_authenticated/assets')) },
  { path: 'banners', lazy: lazyRoute(() => import('./_authenticated/banners')) },

  /* — Event bookings — */
  { path: 'bookings/all', lazy: lazyRoute(() => import('./_authenticated/bookings/all')) },

  /* — Event careers — */
  { path: 'careers', lazy: lazyRoute(() => import('./_authenticated/careers')) },

  /* — Event transportation & logistics — */
  { path: 'cars', lazy: lazyRoute(() => import('./_authenticated/cars/index')) },

  /* — Event catalog (types, items, packages) — */
  { path: 'catalog', lazy: lazyRoute(() => import('./_authenticated/catalog')) },
  { path: 'venues-halls', lazy: lazyRoute(() => import('./_authenticated/venues-halls')) },
  { path: 'photography', lazy: lazyRoute(() => import('./_authenticated/photography')) },
  { path: 'decorations', lazy: lazyRoute(() => import('./_authenticated/decorations')) },
  { path: 'catering-hospitality', lazy: lazyRoute(() => import('./_authenticated/catering-hospitality')) },
  { path: 'event-organizers', lazy: lazyRoute(() => import('./_authenticated/event-organizers')) },
  { path: 'event-production', lazy: lazyRoute(() => import('./_authenticated/event-production')) },
  { path: 'entertainment-artists', lazy: lazyRoute(() => import('./_authenticated/entertainment-artists')) },
  { path: 'transport-logistics', lazy: lazyRoute(() => import('./_authenticated/transport-logistics')) },
  { path: 'event-staffing', lazy: lazyRoute(() => import('./_authenticated/event-staffing')) },

  /* — Event command center — */
  { path: 'command-center', lazy: lazyRoute(() => import('./_authenticated/command-center')) },

  /* — Event content management — */
  { path: 'content/eventhub', lazy: lazyRoute(() => import('./_authenticated/content/eventhub')) },
  { path: 'content/permit', lazy: lazyRoute(() => import('./_authenticated/content/permit')) },

  /* — Event CRM: clients, pipeline, production, incidents — */
  { path: 'crm/clients/:id', lazy: lazyRoute(() => import('./_authenticated/crm/clients/$id')) },
  { path: 'crm/clients', lazy: lazyRoute(() => import('./_authenticated/crm/clients/index')) },
  { path: 'crm/pipeline', lazy: lazyRoute(() => import('./_authenticated/crm/pipeline')) },
  { path: 'crm/production-manager', lazy: lazyRoute(() => import('./_authenticated/crm/production-manager')) },
  { path: 'crm/incident-desk', lazy: lazyRoute(() => import('./_authenticated/crm/incident-desk')) },

  /* — Event venue productions — */

  /* — Event locations & destinations — */
  { path: 'locations', lazy: lazyRoute(() => import('./_authenticated/locations/index')) },

  /* — Event escrow & financial — */
  { path: 'escrow', lazy: lazyRoute(() => import('./_authenticated/escrow')) },

  /* — Maya Event AI operations — */
  { path: 'maya-ops', lazy: lazyRoute(() => import('./_authenticated/maya-ops')) },


  /* — Event schedules & run-of-show — */

  /* — Event dashboard (home) — */
  { index: true, lazy: lazyRoute(() => import('./_authenticated/index')) },

  /* — Event invoices — */
  { path: 'invoices', lazy: lazyRoute(() => import('./_authenticated/invoices')) },

  /* — Event leads & follow-ups — */
  { path: 'leads/followups', lazy: lazyRoute(() => import('./_authenticated/leads/followups')) },
  { path: 'leads', lazy: lazyRoute(() => import('./_authenticated/leads/index')) },

  /* — Event marketing: audiences, automations, campaigns — */
  { path: 'marketing/audiences', lazy: lazyRoute(() => import('./_authenticated/marketing/audiences')) },
  { path: 'marketing/automations', lazy: lazyRoute(() => import('./_authenticated/marketing/automations')) },
  { path: 'marketing/campaigns/:campaignId', lazy: lazyRoute(() => import('./_authenticated/marketing/campaigns/$campaignId')) },
  { path: 'marketing/campaigns', lazy: lazyRoute(() => import('./_authenticated/marketing/campaigns/index')) },

  /* — Event mission control — */
  { path: 'mission-control', lazy: lazyRoute(() => import('./_authenticated/mission-control')) },

  /* — Event packages — */
  { path: 'packages/:id', lazy: lazyRoute(() => import('./_authenticated/packages/$id')) },
  { path: 'packages', lazy: lazyRoute(() => import('./_authenticated/packages/index')) },

  /* — Event performance & visual AI — */
  { path: 'ppm/analytics', lazy: lazyRoute(() => import('./_authenticated/ppm/analytics')) },
  { path: 'ppm/visual-ai', lazy: lazyRoute(() => import('./_authenticated/ppm/visual-ai')) },

  /* — Event promo codes & offers — */
  { path: 'promo-codes', lazy: lazyRoute(() => import('./_authenticated/promo-codes')) },
  { path: 'promotions', lazy: lazyRoute(() => import('./_authenticated/promotions')) },

  /* — Event quotations — */
  { path: 'quotes', lazy: lazyRoute(() => import('./_authenticated/quotes/index')) },

  /* — Event refunds — */
  { path: 'refunds', lazy: lazyRoute(() => import('./_authenticated/refunds')) },


  /* — Event SEO management — */
  { path: 'seo', lazy: lazyRoute(() => import('./_authenticated/seo/index')) },

  /* — Event settings — */
  { path: 'settings/billing', lazy: lazyRoute(() => import('./_authenticated/settings/billing')) },
  { path: 'settings/company-security', lazy: lazyRoute(() => import('./_authenticated/settings/company-security')) },
  { path: 'settings/email-templates', lazy: lazyRoute(() => import('./_authenticated/settings/email-templates')) },
  { path: 'settings/security', lazy: lazyRoute(() => import('./_authenticated/settings/security')) },
  { path: 'settings/users', lazy: lazyRoute(() => import('./_authenticated/settings/users')) },

  /* — Event venue accommodations — */
  { path: 'stays', lazy: lazyRoute(() => import('./_authenticated/stays/index')) },

  /* — Event types & themes — */
  { path: 'themes', lazy: lazyRoute(() => import('./_authenticated/themes')) },

  /* — Event trends & market intelligence — */

  /* — Event vendor marketplace — */
  { path: 'vendors', lazy: lazyRoute(() => import('./_authenticated/vendors/index')) },
];
