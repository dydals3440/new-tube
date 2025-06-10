'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import { VideoBanner } from '@/modules/videos/ui/components/video-banner';
import { VideoTopRow } from '@/modules/videos/ui/components/video-top-row';

interface VideoSectionProps {
  videoId: string;
}

// Client Component 이기 때문에 Suspense를 만듬
// 서버 컴포넌트에서 수행한 프리페치 활용

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const trpc = useTRPC();
  const { data: video } = useSuspenseQuery(
    trpc.videos.getOne.queryOptions({ id: videoId })
  );

  return (
    <>
      <div
        className={cn(
          'aspect-video bg-black rounded-xl overflow-hidden relative',
          video.muxStatus !== 'ready' && 'rounded-b-none'
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={() => {}}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
