// ============================================================
// FitOS — Claude API safe wrapper
// Rule 1: API key is server-only (never exported to client)
// Rule 4: All JSON parsed via parseClaudeJSON with Zod validation
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { type ZodSchema } from 'zod';

// Client is initialised server-side only (inside /app/api/ routes)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-5';

/**
 * Make a standard Claude API call and return the raw text response.
 * This function must only be called from server-side code (API routes, server components).
 */
export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4000
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }
  return block.text;
}

/**
 * Strip markdown fences from a Claude response and parse + validate JSON.
 * Retries once on failure with an error-context prompt.
 *
 * Rule 4: Never use raw JSON.parse() — always use this function.
 */
export async function parseClaudeJSON<T>(
  raw: string,
  schema: ZodSchema<T>
): Promise<T> {
  const clean = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(clean); // throws SyntaxError if invalid
  return schema.parse(parsed); // throws ZodError if wrong shape
}

/**
 * Call Claude and parse the response as typed JSON, with one automatic retry.
 * This is the primary function used by all API routes.
 */
export async function callClaudeJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<T>,
  maxTokens = 4000
): Promise<T> {
  const raw = await callClaude(systemPrompt, userPrompt, maxTokens);

  try {
    return await parseClaudeJSON(raw, schema);
  } catch {
    // One retry with explicit error context
    const retryPrompt = `${userPrompt}

IMPORTANT: Your previous response could not be parsed as valid JSON.
Return ONLY valid JSON matching the schema exactly.
Start your response with { or [ and end with } or ] — nothing before or after.`;

    const retryRaw = await callClaude(systemPrompt, retryPrompt, maxTokens);
    try {
      return await parseClaudeJSON(retryRaw, schema);
    } catch (retryError) {
      const message =
        retryError instanceof Error ? retryError.message : 'Unknown parse error';
      throw new Error(
        `Failed to parse Claude response after retry. Please try again. (${message})`
      );
    }
  }
}

/**
 * Create a streaming client for training plan generation (SSE).
 * Rule 7: Training plans must stream — never use standard JSON response.
 */
export function createStreamingClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
