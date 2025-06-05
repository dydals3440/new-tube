import { Ratelimit } from '@upstash/ratelimit';

import { redis } from './redis';

export const ratelimit = new Ratelimit({
  redis,
  // 10초내에 10번의 요청이 발생하면 타임아웃이 발생.
  // 10초내에 50개의 요청을 하면, 요청이 타임아웃 됨.
  limiter: Ratelimit.slidingWindow(10, '10s'),
});
