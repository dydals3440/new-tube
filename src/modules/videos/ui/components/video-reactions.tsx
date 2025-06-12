import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { VideoGetOneOutput } from '@/modules/videos/types';
import { useClerk } from '@clerk/nextjs';
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTRPC } from '@/trpc/client';

interface VideoReactionsProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput['viewerReaction'];
}

export const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReaction,
}: VideoReactionsProps) => {
  const clerk = useClerk();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const like = useMutation(
    trpc.videoReactions.like.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.videos.getOne.queryKey({ id: videoId }),
        });
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
    trpc.videoReactions.dislike.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.videos.getOne.queryKey({ id: videoId }),
        });
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
    <div className='flex items-center flex-none'>
      <Button
        variant='secondary'
        className='rounded-l-full rounded-r-none gap-2 pr-4'
        onClick={() => like.mutate({ videoId })}
      >
        <ThumbsUpIcon
          className={cn('size-5', viewerReaction === 'like' && 'fill-black')}
        />
        {likes}
      </Button>
      <Separator orientation='vertical' className='h-7' />
      <Button
        variant='secondary'
        className='rounded-l-none rounded-r-full gap-2 pr-4'
        onClick={() => dislike.mutate({ videoId })}
      >
        <ThumbsDownIcon
          className={cn('size-5', viewerReaction === 'dislike' && 'fill-black')}
        />
        {dislikes}
      </Button>
    </div>
  );
};
