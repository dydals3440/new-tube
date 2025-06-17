import { DEFAULT_LIMIT } from '@/constants';
import { SearchView } from '@/modules/search/ui/views/search-view';
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
  }>;
}

const SearchPage = async ({ searchParams }: PageProps) => {
  const { query, categoryId } = await searchParams;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  queryClient.prefetchInfiniteQuery(
    trpc.search.getMany.infiniteQueryOptions({
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default SearchPage;
