import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  // 기본적으로 사용자가 리스트의 맨 아래에 도달했는지를 감지하기 위해
  // observer를 사용하여 안전하게 함수 호출을 시작

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    // target이 설정되어 있다면, 비디오 섹션과 같은 리스트의 끝에 빈 div를 설정할거임.
    // UI가 div에 도달했는지 체크
    if (targetRef.current) {
      // 관찰자에게 지시
      observer.observe(targetRef.current);
    }

    // 관찰자 해제 과부하 발생하지 않도록 함.
    return () => observer.disconnect();
  }, [options]);

  return {
    targetRef,
    isIntersecting,
  };
};
