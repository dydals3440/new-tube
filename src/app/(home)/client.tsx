'use client';

import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';

export const PageClient = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.hello.queryOptions({
      text: 'matthew',
    })
  );

  return <div>I will Load videos in the future {data.greeting}</div>;
};
