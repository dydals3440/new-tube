import { VideoView } from '@/modules/videos/ui/views/video-view';
import { trpc, prefetch, HydrateClient } from '@/trpc/server';

interface PageProps {
  params: Promise<{
    videoId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  void prefetch(trpc.videos.getOne.queryOptions({ id: videoId }));

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
