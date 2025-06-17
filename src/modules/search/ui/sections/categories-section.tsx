'use client';

import { useTRPC } from '@/trpc/client';
import { ErrorBoundary } from 'react-error-boundary';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { FilterCarousel } from '@/components/filter-carousel';
import { useRouter } from 'next/navigation';

interface CategoriesSectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// 나중에 로딩 요소에 많은 것 을 추가했을때 더 큰 역할을 넣을 수 있음.
const CategoriesSkeleton = () => {
  return <FilterCarousel isLoading data={[]} onSelect={() => {}} />;
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const router = useRouter();

  const trpc = useTRPC();
  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if (value) {
      url.searchParams.set('categoryId', value);
    } else {
      url.searchParams.delete('categoryId');
    }

    // router.push는 prefetch를 하지 않기 떄문에
    // 가장빠른 방법은 아니므로, 이를 더욱 빠르게할 수 있는 방법이 있음.
    // router.prefetch도 활용할 수 있음.
    router.push(url.toString());
  };

  return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />;
};
