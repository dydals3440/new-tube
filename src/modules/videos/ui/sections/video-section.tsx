'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { useTRPC } from '@/trpc/client';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  VideoPlayer,
  VideoPlayerSkeleton,
} from '@/modules/videos/ui/components/video-player';
import { VideoBanner } from '@/modules/videos/ui/components/video-banner';
import {
  VideoTopRow,
  VideoTopRowSkeleton,
} from '@/modules/videos/ui/components/video-top-row';
import { useAuth } from '@clerk/nextjs';

interface VideoSectionProps {
  videoId: string;
}

// Client Component 이기 때문에 Suspense를 만듬
// 서버 컴포넌트에서 수행한 프리페치 활용

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const VideoSectionSkeleton = () => {
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  );
};

export const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const { isSignedIn } = useAuth();
  const trpc = useTRPC();
  const { data: video } = useSuspenseQuery(
    trpc.videos.getOne.queryOptions({ id: videoId })
  );
  const queryClient = useQueryClient();

  const createView = useMutation(
    trpc.videoViews.create.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.videos.getOne.queryKey({ id: videoId }),
        }),
    })
  );
  const handlePlay = () => {
    if (!isSignedIn) return;

    createView.mutate({ videoId });
  };

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
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
