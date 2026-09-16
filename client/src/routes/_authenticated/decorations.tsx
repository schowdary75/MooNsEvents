import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/decorations')({
  component: () => (
    <EventServiceDirectory
      title="Decorations"
      description="Approved wedding, stage, floral and celebration decorators from the regional Master Catalog."
      category="decoration"
    />
  ),
});
