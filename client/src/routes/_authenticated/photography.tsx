import { EventServiceDirectory } from '@/components/event-service-directory';
import { createFileRoute } from '@/lib/routerCompat';

export const Route = createFileRoute('/_authenticated/photography')({
  component: () => (
    <EventServiceDirectory
      title="Photography"
      description="Approved event photographers and filmmakers from the regional Master Catalog."
      category="photography"
    />
  ),
});
