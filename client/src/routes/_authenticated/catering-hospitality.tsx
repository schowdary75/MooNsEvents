import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/catering-hospitality')({
  component: () => (
    <EventServiceDirectory
      title="Catering & Hospitality"
      description="Approved caterers and hospitality teams serving Telangana and Andhra Pradesh events."
      category="catering"
    />
  ),
});
