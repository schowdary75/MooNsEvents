import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/event-organizers')({
  component: () => (
    <EventServiceDirectory
      title="Event Organizers"
      description="Approved regional planners and event-execution teams available for package composition."
      category="organizer"
    />
  ),
});
