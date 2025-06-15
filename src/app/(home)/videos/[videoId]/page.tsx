import { DEFAULT_LIMIT } from '@/constants';
import { VideoView } from '@/modules/videos/ui/views/video-view';
import { trpc, prefetch, HydrateClient, getQueryClient } from '@/trpc/server';

interface PageProps {
  params: Promise<{
    videoId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;
  const queryClient = getQueryClient();

  void prefetch(trpc.videos.getOne.queryOptions({ id: videoId }));

  queryClient.prefetchInfiniteQuery(
    trpc.comments.getMany.infiniteQueryOptions({
      videoId,
      limit: DEFAULT_LIMIT,
    })
  );

  queryClient.prefetchInfiniteQuery(
    trpc.suggestions.getMany.infiniteQueryOptions({
      videoId,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
