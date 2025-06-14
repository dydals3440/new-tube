import { CommentsGetManyOutput } from '@/modules/comments/type';
import { UserAvatar } from '@/components/user-avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from 'lucide-react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';
import { DEFAULT_LIMIT } from '@/constants';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: CommentsGetManyOutput['items'][number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const clerk = useClerk();

  const remove = useMutation(
    trpc.comments.remove.mutationOptions({
      onSuccess: async () => {
        // ✅ 삭제 성공 시 invalidate
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.infiniteQueryOptions({
            videoId: comment.videoId,
            limit: DEFAULT_LIMIT,
          }).queryKey,
        });
        toast.success('Comment deleted');
      },
      onError: (error) => {
        toast.error('Something went wrong');
        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
      },
    })
  );

  const like = useMutation(
    trpc.commentReactions.like.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.infiniteQueryOptions({
            videoId: comment.videoId,
            limit: DEFAULT_LIMIT,
          }).queryKey,
        });

        toast.success('Liked');
      },
      onError: (error) => {
        toast.error('Something went wrong');
        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
      },
    })
  );

  const dislike = useMutation(
    trpc.commentReactions.dislike.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: trpc.comments.getMany.infiniteQueryOptions({
            videoId: comment.videoId,
            limit: DEFAULT_LIMIT,
          }).queryKey,
        });

        toast.success('Disliked');
      },
      onError: (error) => {
        toast.error('Something went wrong');
        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
      },
    })
  );

  return (
    <div>
      <div className='flex gap-4'>
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size='lg'
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className='flex-1 min-w-0'>
          <Link href={`/users/${comment.userId}`}>
            <div className='flex items-center gap-2 mb-0.5'>
              <span className='font-medium text-sm pb-0.5'>
                {comment.user.name}
              </span>
              <span className='text-xs text-muted-foreground'>
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className='text-sm'>{comment.value}</p>
          <div className='flex items-center gap-2 mt-1'>
            <div className='flex items-center'>
              <Button
                disabled={false}
                variant='ghost'
                size='icon'
                className='size-8'
                onClick={() => {
                  like.mutate({ commentId: comment.id });
                }}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === 'like' && 'fill-black'
                  )}
                />
              </Button>
              <span className='text-xs text-muted-foreground'>
                {comment.likeCount}
              </span>
            </div>
            <div className='flex items-center'>
              <Button
                disabled={false}
                variant='ghost'
                size='icon'
                className='size-8'
                onClick={() => {
                  dislike.mutate({ commentId: comment.id });
                }}
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === 'dislike' && 'fill-black'
                  )}
                />
              </Button>
              <span className='text-xs text-muted-foreground'>
                {comment.dislikeCount}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='size-8'>
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className='size-4' />
              Reply
            </DropdownMenuItem>
            {comment.user.clerkId === userId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className='size-4' />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
