import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/venues-halls')({
  component: () => (
    <EventServiceDirectory
      title="Venues & Halls"
      description="Approved convention centres, wedding halls and event venues in Telangana and Andhra Pradesh."
      category="venue"
    />
  ),
});
