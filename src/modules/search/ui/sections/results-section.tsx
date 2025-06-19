'use client';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from '@/modules/videos/ui/components/video-grid-card';
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from '@/modules/videos/ui/components/video-row-card';
import { useTRPC } from '@/trpc/client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ResultsSectionProps {
  query?: string;
  categoryId?: string;
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  return (
    <Suspense
      key={`${query}-${categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<div>Error</div>}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ResultsSectionSkeleton = () => {
  return (
    <div>
      <div className='hidden flex-col gap-4 md:flex'>
        {Array.from({ length: 5 }).map((_, idx) => (
          <VideoRowCardSkeleton key={idx} />
        ))}
      </div>
      <div className='flex flex-col gap-4 p-4 gap-y-10 pt-6 md:hidden'>
        {Array.from({ length: 5 }).map((_, idx) => (
          <VideoGridCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};

export const ResultsSectionSuspense = ({
  query,
  categoryId,
}: ResultsSectionProps) => {
  const trpc = useTRPC();
  const results = useSuspenseInfiniteQuery(
    trpc.search.getMany.infiniteQueryOptions(
      {
        query,
        categoryId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  console.log(results.data.pages);

  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <div className='flex flex-col gap-4 gap-y-10'>
          {results.data.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoGridCard key={video.id} data={video} />
            ))}
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {results.data.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoRowCard key={video.id} data={video} />
            ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={results.hasNextPage}
        isFetchingNextPage={results.isFetchingNextPage}
        fetchNextPage={results.fetchNextPage}
      />
    </div>
  );
};
