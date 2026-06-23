import { AuthGate } from '@/components/AuthGate';
import GardenMap from '@/components/GardenMap';

export default function HomePage() {
  return (
    <AuthGate>
      <GardenMap />
    </AuthGate>
  );
}
