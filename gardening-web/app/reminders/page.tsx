import { AuthGate } from '@/components/AuthGate';
import { RemindersPage } from '@/components/RemindersPage';

export default function RemindersRoute() {
  return (
    <AuthGate>
      <RemindersPage />
    </AuthGate>
  );
}
