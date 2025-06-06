import { db } from '@/db';
import { videos } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, desc, eq, lt, or } from 'drizzle-orm';
import { z } from 'zod';

export const studioRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          // 첫 요청인 경우 필수가 아님,
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        // 1을 더하는 이유, 한도를 하나 더 추가하여 더 많은 데이터가 있는지 체크
        // 프론트엔드가 요청한 것 보다 항상 한개 더 많은 항목을 확인하여, 추가 데이터가 있는지 체크
        .limit(limit + 1);

      const hasMore = data.length > limit;
      // Remove the last item if there is more data;
      const items = hasMore ? data.slice(0, -1) : data;

      // Set the next cursor to the last item if there is more data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
