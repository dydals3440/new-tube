import { DEFAULT_LIMIT } from '@/constants';
import { StudioView } from '@/modules/studio/ui/views/studio-view';
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server';

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.studio.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default Page;
