'use client';

import { ResponsiveModal } from '@/components/responsive-dialog';
import { UploadDropzone } from '@/lib/uploadthing';
import { useTRPC } from '@/trpc/client';
import { useQueryClient } from '@tanstack/react-query';

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const onUploadComplete = () => {
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.studio.getMany.queryKey(),
      }),
    ]);
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title='Upload Thumbnail'
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint='thumbnailUploader'
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  );
};
