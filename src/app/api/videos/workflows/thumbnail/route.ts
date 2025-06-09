import { db } from '@/db';
import { videos } from '@/db/schema';
import { serve } from '@upstash/workflow/nextjs';
import { and, eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const utapi = new UTApi();

  const input = context.requestPayload as InputType;
  const { userId, videoId, prompt } = input;

  const video = await context.run('get-video', async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) {
      throw new Error('Not Found');
    }

    return existingVideo;
  });

  const { body } = await context.call<{ data: Array<{ url: string }> }>(
    'generate-thumbnail',
    {
      url: 'https://api.openai.com/v1/images/generations',
      method: 'POST',
      body: {
        prompt,
        n: 1,
        model: 'dall-e-3',
        size: '1792x1024',
      },
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const tempThumbnailUrl = body.data[0].url;

  if (!tempThumbnailUrl) {
    throw new Error('Bad request');
  }

  // Cleanup old thumbnail (썸네일이 업로드 되기 전에 실행)
  await context.run('cleanup-thumbnail', async () => {
    if (video.thumbnailKey) {
      await utapi.deleteFiles(video.thumbnailKey);
      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    }
  });

  const uploadedThumbnail = await context.run('upload-thumbnail', async () => {
    const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

    if (!data) {
      throw new Error('Bad request');
    }

    return data;
  });

  await context.run('update-video', async () => {
    await db
      .update(videos)
      .set({
        thumbnailUrl: uploadedThumbnail.url,
        thumbnailKey: uploadedThumbnail.key,
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
