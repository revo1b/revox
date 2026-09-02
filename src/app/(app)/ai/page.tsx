import { AiBrainChat } from '@/components/AiBrainChat';

export const dynamic = 'force-dynamic';

export default async function AiBrainPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="page">
      <AiBrainChat initialQuestion={params.q} />
    </div>
  );
}
