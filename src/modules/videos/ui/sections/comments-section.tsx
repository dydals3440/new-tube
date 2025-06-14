'use client';

import { CommentForm } from '@/modules/comments/ui/components/comment-form';
import { CommentItem } from '@/modules/comments/ui/components/comment-item';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface CommentSectionProps {
  videoId: string;
}

export const CommentsSectionSkeleton = () => {
  return <div>CommentsSectionSkeleton</div>;
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
  const { data: comments } = useSuspenseQuery(
    trpc.comments.getMany.queryOptions({ videoId })
  );

  return (
    <div className='mt-6'>
      <div className='flex flex-col gap-6'>
        <h1>0 Comments</h1>
        <CommentForm videoId={videoId} />
        <div className='flex flex-col gap-4 mt-2'>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};
