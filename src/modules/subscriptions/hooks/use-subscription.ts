import { toast, useToast } from '@/hooks/use-toast';
import { useTRPC } from '@/trpc/client';
import { useClerk } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseSubScriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscription = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubScriptionProps) => {
  const trpc = useTRPC();
  const clerk = useClerk();
  const queryClient = useQueryClient();

  const subscribe = useMutation(
    trpc.subscriptions.create.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Subscribed',
        });
        // TODO: reinvalidate subscriptions.getMany, users.getOne

        if (fromVideoId) {
          queryClient.invalidateQueries({
            queryKey: trpc.videos.getOne.queryKey({
              id: fromVideoId,
            }),
          });
        }
      },
      onError: (error) => {
        toast({
          title: 'Failed to subscribe',
          description: error.message,
        });

        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
      },
    })
  );
  const unsubscribe = useMutation(
    trpc.subscriptions.remove.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Subscribed',
        });
        // TODO: reinvalidate subscriptions.getMany, users.getOne

        if (fromVideoId) {
          queryClient.invalidateQueries({
            queryKey: trpc.videos.getOne.queryKey({
              id: fromVideoId,
            }),
          });
        }
      },
      onError: (error) => {
        toast({
          title: 'Failed to subscribe',
          description: error.message,
        });

        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
      },
    })
  );

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return {
    isPending,
    onClick,
  };
};
