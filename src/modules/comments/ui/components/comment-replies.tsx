import { Button } from '@/components/ui/button';
import { DEFAULT_LIMIT } from '@/constants';
import { CommentItem } from '@/modules/comments/ui/components/comment-item';
import { useTRPC } from '@/trpc/client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { CornerDownRightIcon, Loader2Icon } from 'lucide-react';

interface CommentRepliesProps {
  parentId: string;
  videoId: string;
}

export const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSuspenseInfiniteQuery(
      trpc.comments.getMany.infiniteQueryOptions(
        {
          videoId,
          parentId,
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
      )
    );

  return (
    <div className='pl-14'>
      <div className='flex flex-col gap-4 mt-2'>
        {isLoading && (
          <div className='flex items-center justify-center'>
            <Loader2Icon className='size-6 animate-spin text-muted-foreground' />
          </div>
        )}
        {!isLoading &&
          data.pages
            .flatMap((page) => page.items)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} variant='reply' />
            ))}
        {/* 댓글을 무한히 로드하면 다음 댓글로 스크롤할 수 없게 되니 여기서는 버튼 방식으로  */}
        {hasNextPage && (
          <Button
            variant='tertiary'
            size='sm'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            <CornerDownRightIcon />
            Show more replies
          </Button>
        )}
      </div>
    </div>
  );
};
