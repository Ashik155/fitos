// ============================================================
// FitOS — Training plan generation API (SSE streaming)
// Rule 7: MUST use SSE — never standard JSON response.
// Rule 2: Profile loaded server-side from Supabase.
// ============================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { mapProfileRow } from '@/lib/profile';
import { buildTrainingSystemPrompt } from '@/lib/prompts/system';
import { buildTrainingPrompt } from '@/lib/prompts/training';
import { createStreamingClient } from '@/lib/claude';
import { SPLIT_TEMPLATES, SPLITS_META } from '@/lib/splits';
import type { SplitId } from '@/lib/types';

// Simple in-memory rate limit
const lastGenTime: Map<string, number> = new Map();

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const now = Date.now();
  const lastTime = lastGenTime.get(session.user.id) ?? 0;
  if (now - lastTime < 10_000) {
    return NextResponse.json(
      { error: 'Please wait 10 seconds before generating again.' },
      { status: 429 }
    );
  }
  lastGenTime.set(session.user.id, now);

  // ── Validate split ────────────────────────────────────────────────────────
  const body = await request.json();
  const splitId: string = body.split ?? '';

  if (!(splitId in SPLIT_TEMPLATES)) {
    return NextResponse.json({ error: 'Invalid split selection.' }, { status: 400 });
  }

  // ── Load profile server-side (Rule 2) ─────────────────────────────────────
  const { data: row, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (profileError || !row) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  const profile = mapProfileRow(row);
  const splitMeta = SPLITS_META[splitId as SplitId];
  const systemPrompt = buildTrainingSystemPrompt();
  const userPrompt = buildTrainingPrompt(splitId as SplitId, splitMeta.name, profile);

  // ── SSE Stream (Rule 7) ────────────────────────────────────────────────────
  const anthropic = createStreamingClient();

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 5000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const sseData = `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
