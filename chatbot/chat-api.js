/**
 * chat-api.js
 * Handles communication between the chat widget and the Cloudflare Worker.
 */

import { buildSystemPrompt } from './system-prompt.js'

export const WORKER_URL = 'https://nextstop-africa-tours-public.visitafrica21.workers.dev'

export async function sendMessage(history) {
  if (!WORKER_URL) {
    return {
      response:
        'The chat service is not yet configured. Please set WORKER_URL in chatbot/chat-api.js.'
    }
  }

  try {
    const prompt = buildSystemPrompt()

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: prompt,
        messages: history
      })
    })

    if (!response.ok) {
      throw new Error(`Worker responded with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[NextStop Africa Chat] Worker error:', error)
    return {
      response:
        "Sorry, I'm having trouble connecting right now. Please try again in a moment, or reach us directly at inquire@nextstopafricatours.com."
    }
  }
}
