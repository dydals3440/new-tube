import { VideoView } from '@/modules/studio/ui/views/video-view';
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server';

// 실제로 아무것도 await 하지 않음
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.studio.getOne.queryOptions({
      id: videoId,
    })
  );

  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
