import { VideoGetManyOutput } from '@/modules/videos/types';
import {
  VideoInfo,
  VideoInfoSkeleton,
} from '@/modules/videos/ui/components/video-info';
import {
  VideoThumbnail,
  VideoThumbnailSkeleton,
} from '@/modules/videos/ui/components/video-thumbnail';
import Link from 'next/link';

interface VideoGridCardProps {
  data: VideoGetManyOutput['items'][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className='flex flex-col gap-2 w-full group'>
      <Link href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};
