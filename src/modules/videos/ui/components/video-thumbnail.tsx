import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/utils';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';
import Image from 'next/image';

interface VideoThumbnailProps {
  // 이 작업을 하지 않았거나, 영상이 아직 준비되지 않은 경우를 대비해 선택사항일 수 있음.
  title: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  duration: number;
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className='relative w-full overflow-hidden rounded-xl aspect-video'>
      <Skeleton className='size-full' />
    </div>
  );
};

export const VideoThumbnail = ({
  title,
  imageUrl,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className='relative group'>
      {/* Thumbnail Wrapper */}
      <div className='relative w-full overflow-hidden rounded-xl aspect-video'>
        <Image
          src={imageUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className='size-full object-cover group-hover:opacity-0'
        />
        <Image
          // 미리보기 URL이 있으면 비최적화 상태
          unoptimized={!!previewUrl}
          src={previewUrl ?? THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className='size-full object-cover opacity-0 group-hover:opacity-100'
        />
      </div>

      {/* Video Duration Box */}
      <div className='absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white'>
        {formatDuration(duration)}
      </div>
    </div>
  );
};
