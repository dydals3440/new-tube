import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useEffect } from 'react';

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    // 임계값
    // InfiniteScroll가 화면에 보이는 경우 데이터를 가져오기 위해 사용
    threshold: 0.5,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isManual,
  ]);

  return (
    <div className='flex flex-col items-center gap-4 p-4'>
      <div ref={targetRef} className='h-1'></div>
      {/* intersect가 동작하지 않을때 다른 이유로 실패할때 fallback 수동으로 항상 더불러오기 클릭 가능 다만 백엔드에서 다음 페이지가 있을때만 가능. */}
      {hasNextPage ? (
        <Button
          variant='secondary'
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </Button>
      ) : (
        <p className='text-xs text-muted-foreground'>
          You have reached the end of the list
        </p>
      )}
    </div>
  );
};
