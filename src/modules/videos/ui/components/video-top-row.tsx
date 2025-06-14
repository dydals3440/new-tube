import { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';

import { VideoGetOneOutput } from '@/modules/videos/types';
import { VideoDescription } from '@/modules/videos/ui/components/video-description';
import { VideoMenu } from '@/modules/videos/ui/components/video-menu';
import { VideoOwner } from '@/modules/videos/ui/components/video-owner';
import { VideoReactions } from '@/modules/videos/ui/components/video-reactions';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className='flex flex-col gap-4 mt-4'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-6 w-4/5 md:w-2/5' />
      </div>
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center gap-3 w-[70%]'>
          <Skeleton className='h-10 w-10 rounded-full shrink-0' />
          <div className='flex flex-col gap-2 w-full'>
            <Skeleton className='h-5 w-4/5 md:w-2/6' />
            <Skeleton className='h-5 w-3/5 md:w-1/5' />
          </div>
        </div>
        <Skeleton className='h-9 w-2/6 md:1/6 rounded-full' />
      </div>
      <div className='h-[120px] w-full' />
    </div>
  );
};

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  // 여기서 compact view와 compact date를 만듬
  // 이렇게 하는 이유는 단순, 비디오 설명은 비디오 페이지 외에 재사용되지 않음.*
  // Date 객체를 props로 전달하는건 피하고 싶어서, 완전히 계산된 형태로 전달하는게 좋아보임.

  // compactViews는 변경되는 값이기 때문에 최적화가 필요
  // 뷰의 경우에는 메모이제이션이 바뀔 수 있으니 필요할 수 있음.
  const compactViews = useMemo(() => {
    return Intl.NumberFormat('en', {
      notation: 'compact',
    }).format(video.viewCount);
  }, [video.viewCount]);

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat('en', {
      notation: 'compact',
    }).format(video.viewCount);
  }, [video.viewCount]);

  // 솔직히 여기서 많은 메모리 할당은 과투자일수도있음. (그래도 연습삼아 진행)
  const compactDate = useMemo(() => {
    return format(video.createdAt, 'MMM d, yyyy');
  }, [video.createdAt]);

  const expandedDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, [video.createdAt]);

  return (
    <div className='flex flex-col gap-4 mt-4'>
      <h1 className='text-xl font-semibold'>{video.title}</h1>
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
        <VideoOwner user={video.user} videoId={video.id} />
        <div className='flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 gap-2'>
          <VideoReactions
            videoId={video.id}
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            viewerReaction={video.viewerReaction}
          />
          <VideoMenu
            videoId={video.id}
            variant='secondary'
            onRemove={() => {}}
          />
        </div>
      </div>
      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};
