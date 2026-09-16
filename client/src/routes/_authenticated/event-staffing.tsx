import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/event-staffing')({
  component: () => (
    <EventServiceDirectory title="Event Staffing" description="Approved hosts, ushers, valet, security and hospitality staffing partners." category="staffing" />
  ),
});
