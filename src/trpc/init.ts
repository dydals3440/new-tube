import { db } from '@/db';
import { users } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import superjson from 'superjson';
import { ratelimit } from '@/lib/ratelimit';

export const createTRPCContext = cache(async () => {
  // context는 모든 프로시쳐가 실행될떄 실행 공개든 비공개든 상관없음.
  // 그래서 JWT를 구조분해하는게 제일 좋음, 이 방법은 fetch 호출 X
  // next-auth는 이 부분이 getSession이 될 것임. (api 호출을 하지 않는 무언가)
  /**
   * @see: https://trpc.io/docs/server/context
   */
  // 직접 디비 쿼리는 별로.
  // context는 모든 API 호출마다 사용 가능해야하므로, 가능한 가볍게 유지하는 것이 중요함.
  // 이를 위해 완벽한 방법은
  const { userId } = await auth();
  // AuthHelper가 현재 활성화된 사용자의 auth 객체를 반환하기 때문
  // 서버 컴포넌트나 라우트 핸들러같은 서버 사이드에서만 동작함
  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// base procedure를 활장 후 사용
export const protectedProcedure = t.procedure.use(async function isAuthed(
  opts
) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId))
    .limit(1);

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  //
  const { success } = await ratelimit.limit(user.id);

  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// 아무도 우리 trpc 엔드포인트를 스팸할 수 없도록 rate-limiting을 사용한다.

// 백그라운드 작업을 위해 up-stash 활용, 이는 재시도와 작업 순서 유지 up-stash에 완전히 맡기는 장기 실행 작업에 적합.

// 길게 실행되는 AI 작업, 일반적인 non-edge나 서버리스 함수에서는 대부분 타임 아웃이 발생
// 작업이 1분 이상, 심지어 몇 시간까지 걸릴 수 있음.
// 그런 경우에 app stash workflow가 완벽한 해결책이 될 것.
// Redis를 도입.
// 지금은 앱을 몇번 새로고침해도, 항상 로드됩니다. 아무리 반복해도 문제 없음.*:
