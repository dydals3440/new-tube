'use client';

import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';

import { Loader2, PlusIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const StudioUploadModal = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const create = useMutation(
    trpc.videos.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getMany.queryKey(),
        });
        toast.success('Video created successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  return (
    <Button
      variant='secondary'
      onClick={() => create.mutate()}
      disabled={create.isPending}
    >
      {create.isPending ? <Loader2 className='animate-spin' /> : <PlusIcon />}
      Create
    </Button>
  );
};
