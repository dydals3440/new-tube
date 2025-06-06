import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from '@mux/mux-node/resources/webhooks.mjs';
import { NextRequest } from 'next/server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { mux } from '@/lib/mux';
import { db } from '@/db';
import { videos } from '@/db/schema';

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebHookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

export const POST = async (request: NextRequest) => {
  if (!SIGNING_SECRET) {
    throw new Error('MUX_WEBHOOK_SECRET is not set');
  }

  const headersPayload = await headers();
  const muxSignature = headersPayload.get('mux-signature');

  // 악의적 요청 방지
  if (!muxSignature) {
    return new Response('No signature found');
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      'mux-signature': muxSignature,
    },
    SIGNING_SECRET
  );

  switch (payload.type as WebHookEvent['type']) {
    case 'video.asset.created': {
      const data = payload.data as VideoAssetCreatedWebhookEvent['data'];

      if (!data.upload_id) {
        return new Response('No upload ID found', { status: 400 });
      }

      await db
        .update(videos)
        .set({ muxAssetId: data.id, muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
  }

  // 웹 훅이 너무 실패많으면 안될 수 있음.
  return new Response('Webhook received', { status: 200 });
};
