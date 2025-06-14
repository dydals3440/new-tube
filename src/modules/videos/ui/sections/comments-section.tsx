'use client';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { CommentForm } from '@/modules/comments/ui/components/comment-form';
import { CommentItem } from '@/modules/comments/ui/components/comment-item';
import { useTRPC } from '@/trpc/client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface CommentSectionProps {
  videoId: string;
}

// 댓글에 스켈레톤을 사용하지 않는 이유 : 너무 동적이기 떄문
export const CommentsSectionSkeleton = () => {
  return (
    <div className='mt-6 flex justify-center items-center'>
      <Loader2Icon className='text-muted-foreground size-7 animate-spin' />
    </div>
  );
};

export const CommentsSection = ({ videoId }: CommentSectionProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary fallbackRender={() => <p>Error</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// comment section은 video view에 있기 떄문에, modules/videos 경로에 존재
export const CommentsSectionSuspense = ({ videoId }: CommentSectionProps) => {
  const trpc = useTRPC();

  const {
    data: comments,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.comments.getMany.infiniteQueryOptions(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  return (
    <div className='mt-6'>
      <div className='flex flex-col gap-6'>
        <h1 className='text-lg font-bold'>
          {comments.pages[0].totalCount} Comments
        </h1>
        <CommentForm videoId={videoId} />
        <div className='flex flex-col gap-4 mt-2'>
          {comments.pages
            .flatMap((page) => page.items)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </div>
    </div>
  );
};
