import { HomeView } from '@/modules/home/ui/views/home-view';
import { HydrateClient, prefetch, trpc } from '@/trpc/server';

// build error protected
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams;

  // 실제로 무언가 프리페칭하는걸 모르기 떄문에 page.tsx에서 사전 프리페칭에서는 앱내에서 추적
  prefetch(trpc.categories.getMany.queryOptions());

  return (
    // 여기서 클라이언트를 하이드레이트 하는 이유는
    // 홈 뷰 안에서 하는 대신, 실수로 클라이언트를 하이드레이트 해야하는 것을 잊지않게 하기 위해
    // prefetch를 하는 모든 위치에 hydrate 추가. (일관성 유지)
    // 서버컴포넌트는 데이터를 미리가져오고 클라이언트를 하이드레이션 하며, 각자의 홈뷰를 렌더링하는데 사용
    // 홈 뷰는 순수하게 장식용
    // 홈 뷰는 화면을 여러 구역으로 분할하는 기능만 수행
    // 카테고리 섹션은, 서버 컴포넌트에서 미리 가져오기를 활용한 클라이언트 컴포넌트가 될것
    // 섹션을 나누는 이유 각 섹션마다 자체적인 서스펜스와 에러바운더리가 있기 떄문
    // 즉 여기에는 카테고리 섹션이 있고 그 아래에는 비디오 섹션이 있음. 둘은 독립적으로 로드 됨.
    // 하나가 충돌하더라도 전체 뷰가 함께 충돌하는 대신, 깔끔하게 캡슐화되어있겟죠, 바로 그점을 달성할려고 함.
    // 너무 세분화된 suspending과 예를들어 전체 홈 뷰를 suspending하는 것 처럼 너무 거대한 suspending 사이의 균형을 찾음, 각 섹션을 조금 깊게 다룸.
    // 이 방식이 너무 세세하지도 않고, 적절한 균형을 찾음.
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
