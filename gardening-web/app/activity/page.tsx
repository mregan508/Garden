import { AuthGate } from '@/components/AuthGate';
import { ActivityPage } from '@/components/ActivityPage';

export default function ActivityRoute() {
  return (
    <AuthGate>
      <ActivityPage />
    </AuthGate>
  );
}
