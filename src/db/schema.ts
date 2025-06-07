import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
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

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    // Optional
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('name_idx').on(t.name)]
);

export const categoryRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videoVisibility = pgEnum('video_visibility', [
  'private',
  'public',
]);

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  // Mux 관련 필드 (그들의 비디오 상태가 어떤지 알려줌)
  muxStatus: text('mux_status'),
  muxAssetId: text('mux_asset_id').unique(),
  muxUploadId: text('mux_upload_id').unique(),
  muxPlaybackId: text('mux_playback_id').unique(),
  muxTrackId: text('mux_track_id').unique(),
  muxTrackStatus: text('mux_track_status'),
  // AI로도 할 수 있기에 mux 안붙임
  thumbnailUrl: text('thumbnail_url'),
  previewUrl: text('preview_url'),
  duration: integer('duration').default(0).notNull(),
  visibility: videoVisibility('visibility').default('private').notNull(),
  // 외래키 아이디 추가 (user.id와 같게)
  userId: uuid('user_id')
    .references(() => users.id, {
      // 유저 아이디가 삭제되면, 해당 사용자의 모든 비디오도 삭제됨.
      onDelete: 'cascade',
    })
    .notNull(),
  categoryId: uuid('category_id').references(() => categories.id, {
    // 카테고리가 제거 된다고 비디오를 지울 필요 없음.
    // 카테고리는 애초에 필수가 아니므로 null로 설정
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Drizzle Relations 공식문서 참고
// relations가 foreign key와 비슷해보이고 references와도 비슷해보임.
// 테이블 간의 관계를 정의하는 것은 relations 개념과는 다른 수준에서 동작
// 외래키는 데이터베이스 수준의 제약 조건, 삽입 수정 삭제가 동작할떄마다 검증되며
// 제약 조건이 위반되면 오류
// 관계는 더 높은 수준의 추상화 애플리케이션 수준에서 테이블간의 관계정의
// 이는 데이터베이스 스키마에 어떠한 영향도 미치지 않음, 외래키를 암묵적으로 생성하지도 않음
// 기본적으로 이것은 관계와 외래키가 함께 사용할 수 있지만, 의존하지 않음. (외래키 없이, 관계 사용 가능 반대도 가능)
export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));
