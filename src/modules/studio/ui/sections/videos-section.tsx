'use client';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { useTRPC } from '@/trpc/client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail';
import { snakeCaseToTile } from '@/lib/utils';
import { format } from 'date-fns';
import { Globe2Icon, LockIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const VideosSection = () => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeleton = () => {
  return (
    <>
      <div className='border-y'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='pl-6 w-[510px]'>Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Views</TableHead>
              <TableHead className='text-right'>Comments</TableHead>
              <TableHead className='text-right pr-6'>Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className='pl-6'>
                  <div className='flex items-center gap-4'>
                    <Skeleton className='w-36 h-20' />
                    <div className='flex flex-col gap-2'>
                      <Skeleton className='w-[100px] h-4' />
                      <Skeleton className='w-[150px] h-3' />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className='w-20 h-4' />
                </TableCell>
                <TableCell>
                  <Skeleton className='w-16 h-4' />
                </TableCell>
                <TableCell>
                  <Skeleton className='w-24 h-4' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-4 w-12 ml-auto' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-4 w-12 ml-auto' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-4 w-12 ml-auto' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export const VideosSectionSuspense = () => {
  const trpc = useTRPC();

  const {
    data: videos,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.studio.getMany.infiniteQueryOptions(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  return (
    <div>
      <div className='border-y'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='pl-6 w-[510px]'>Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Views</TableHead>
              <TableHead className='text-right'>Comments</TableHead>
              <TableHead className='text-right pr-6'>Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages
              .flatMap((page) => page.items)
              .map((video) => (
                // legacyBehavior를 쓰면 테이블행을 링크로 감쌀 수 있음.
                // 만약 이걸 못쓰는 상황이면 Link를 제거하고, 테이블 행만 남기고,  키를 추가해.
                // useRouter 사용
                <Link
                  key={video.id}
                  href={`/studio/videos/${video.id}`}
                  legacyBehavior
                >
                  <TableRow className='cursor-pointer'>
                    <TableCell className='pl-6'>
                      <div className='flex items-center gap-4'>
                        <div className='relative aspect-video w-36 shrink-0'>
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl}
                            previewUrl={video.previewUrl}
                            title={video.title}
                            duration={video.duration || 0}
                          />
                        </div>
                        <div className='flex flex-col overflow-hidden gap-y-1'>
                          <span className='text-sm line-clamp-1'>
                            {video.title}
                          </span>
                          <span className='text-sm text-muted-foreground line-clamp-1'>
                            {video.description || 'No description'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        {video.visibility === 'private' ? (
                          <LockIcon className='size-4 mr-2' />
                        ) : (
                          <Globe2Icon className='size-4 mr-2' />
                        )}
                        {snakeCaseToTile(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        {snakeCaseToTile(video.muxStatus || 'error')}
                      </div>
                    </TableCell>
                    {/* 내용이 길어질 경우 잘리도록 */}
                    <TableCell className='text-sm truncate'>
                      {format(new Date(video.createdAt), 'd MMM yyyy')}
                    </TableCell>
                    <TableCell className='text-right text-sm'>views</TableCell>
                    <TableCell className='text-right text-sm'>
                      comments
                    </TableCell>
                    <TableCell className='text-right text-sm pr-6'>
                      likes
                    </TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        isManual
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  );
};
