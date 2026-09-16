import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/entertainment-artists')({
  component: () => (
    <EventServiceDirectory title="Entertainment & Artists" description="Approved performers, hosts and entertainment partners for regional events." category="entertainment" />
  ),
});
