import { AuthGate } from '@/components/AuthGate';
import { JournalPage } from '@/components/JournalPage';

interface PageProps {
  params: Promise<{ placementId: string }>;
}

export default async function PlantJournalPage({ params }: PageProps) {
  const { placementId } = await params;

  return (
    <AuthGate>
      <JournalPage placementId={placementId} />
    </AuthGate>
  );
}
