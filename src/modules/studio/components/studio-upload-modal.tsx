'use client';

import { Button } from '@/components/ui/button';
import { useTRPC } from '@/trpc/client';

import { Loader2, Loader2Icon, PlusIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ResponsiveModal } from '@/components/responsive-dialog';
import { StudioUploader } from '@/modules/studio/components/studio-uploader';
import { useRouter } from 'next/navigation';

export const StudioUploadModal = () => {
  const router = useRouter();
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

  const onSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`/studio/videos/${create.data?.video.id}`);
  };

  return (
    <>
      <ResponsiveModal
        title='Upload a video'
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endPoint={create.data.url} onSuccess={onSuccess} />
        ) : (
          <Loader2Icon />
        )}
      </ResponsiveModal>
      <Button
        variant='secondary'
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? <Loader2 className='animate-spin' /> : <PlusIcon />}
        Create
      </Button>
    </>
  );
};
