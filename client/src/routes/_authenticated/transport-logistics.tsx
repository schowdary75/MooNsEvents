import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/transport-logistics')({
  component: () => (
    <EventServiceDirectory title="Transport & Logistics" description="Approved guest, crew, equipment and event-logistics partners." category="logistics" />
  ),
});
