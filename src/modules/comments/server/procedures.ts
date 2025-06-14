import { db } from '@/db';
import { commentReactions, comments, users } from '@/db/schema';
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from '@/trpc/init';
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from 'drizzle-orm';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    // .input(commentsInsertSchema)
    .input(
      z.object({
        // null 가능
        parentId: z.string().uuid().nullish(),
        videoId: z.string().uuid(),
        value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId, value, parentId } = input;
      const { id: userId } = ctx.user;

      // 답글에 또 답글을 안달고 싶음. 너무 깊기 떄문에 한단계만 유지하고 싶음.
      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent comment not found',
        });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reply to a reply',
        });
      }

      const [createdComment] = await db
        .insert(comments)
        .values({ userId, videoId, value, parentId })
        .returning();

      return createdComment;
    }),

  remove: protectedProcedure
    // .input(commentsInsertSchema)
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      return deletedComment;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        cursor: z
          .object({
            id: z.string().uuid(),
            // updatedAt을 기준으로 정렬할 것 이기에 필요.
            updatedAt: z.date(),
          })
          // not-required
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      const { videoId, cursor, limit, parentId } = input;

      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(clerkUserId ? eq(users.clerkId, clerkUserId) : undefined);
      // .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with('viewer_reactions').as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const replies = db.$with('replies').as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as('count'),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      const [totalData, data] = await Promise.all([
        db
          .select({
            count: count(),
          })
          .from(comments)
          // null 인 것만 조회.
          .where(and(eq(comments.videoId, videoId), isNull(comments.parentId))),
        db
          .with(viewerReactions, replies)
          .select({
            ...getTableColumns(comments),
            user: users,
            viewerReaction: viewerReactions.type,
            replyCount: replies.count,
            // total: count(comments.id),
            // totalCount: db.$count(comments, eq(comments.videoId, videoId)),
            likeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, 'like'),
                eq(commentReactions.commentId, comments.id)
              )
            ),
            dislikeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, 'dislike'),
                eq(commentReactions.commentId, comments.id)
              )
            ),
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId),
              parentId
                ? eq(comments.parentId, parentId)
                : isNull(comments.parentId),
              cursor
                ? or(
                    lt(comments.updatedAt, cursor.updatedAt),
                    and(
                      eq(comments.updatedAt, cursor.updatedAt),
                      lt(comments.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .innerJoin(users, eq(comments.userId, users.id))
          // viewer로 부터 반드시 반응을 찾아야하는 것은 아니기에 leftJoin 활용.
          .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
          .leftJoin(replies, eq(replies.parentId, comments.id))
          .orderBy(desc(comments.updatedAt), desc(comments.id))
          .limit(limit + 1),
      ]);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        totalCount: totalData[0].count,
        items,
        nextCursor,
      };
    }),
});
