import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    // uuid slow 그치만 표준, nanoId나, cuid 상관없음.
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').unique().notNull(),
    name: text('name').notNull(),
    // TODO: add banner fields
    // imageUrl이 얼마나 길어질지 모름, 따라서 text로 설정(varChar로 변경하고 익숙한 정확한 길이해도 상관없음)
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  // clerkId에 유니크 인덱스 생성 더 빠르게 찾음
  (t) => [uniqueIndex('clerk_id_idx').on(t.clerkId)]
);
