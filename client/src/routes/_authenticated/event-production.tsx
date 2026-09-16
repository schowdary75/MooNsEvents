import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/event-production')({
  component: () => (
    <EventServiceDirectory title="Production & AV" description="Approved stage, sound, lighting, LED and technical production partners." category="production" />
  ),
});
