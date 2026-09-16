import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/catalog')({
  component: () => (
    <EventServiceDirectory
      title="Master Catalog"
      description="The authoritative directory of approved venues, photographers, decorators, caterers and organizers available to build event packages."
    />
  ),
});
