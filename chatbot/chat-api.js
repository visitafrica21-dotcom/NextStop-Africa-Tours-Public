/**
 * chat-api.js
 * ───────────
 * Handles all communication between the chat widget and the Cloudflare Worker.
 */

import { buildSystemPrompt } from './system-prompt.js'

// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
// Your deployed Cloudflare Worker URL.
export const WORKER_URL = 'https://nextstop-africa-tours-public.visitafrica21.workers.dev'
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Sends the conversation history to the Cloudflare Worker and returns the
 * AI's reply.
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} history
 *   The full conversation history (excluding the system prompt).
 * @returns {Promise<{response: string}>}
 *   Resolves to an object with a `response` string field.
 */
export async function sendMessage(history) {
  if (!WORKER_URL) {
    return {
      response:
        'The chat service is not yet configured. Please set WORKER_URL in chatbot/chat-api.js.'
    }
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: buildSystemPrompt(),
        messages: history
      })
    })

    if (!res.ok) {
      throw new Error(`Worker responded with status ${res.status}`)
    }

    const data = await res.json()
    return data
  } catch (err) {
    console.error('[Visit Africa Chat] Worker error:', err)
    return {
      response:
        'Sorry, I\'m having trouble connecting right now. Please try again in a moment, or reach us directly at visitafrica21@gmail.com.'
    }
  }
}
