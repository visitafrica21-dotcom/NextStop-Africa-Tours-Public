/**
 * worker.js — Visit Africa 21 Chat Worker
 * ─────────────────────────────────────────
 * Cloudflare Worker that proxies chat requests to Workers AI.
 * Binding: chatbot_llm_binding → @cf/meta/llama-3.1-8b-instruct
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
  async fetch(request, env) {

    // ── Handle CORS preflight ───────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    // ── Reject non-POST requests ────────────────────────────────────────────
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // ── Parse request body ──────────────────────────────────────────────────
    let system, messages
    try {
      const body = await request.json()
      system   = body.system   ?? ''
      messages = body.messages ?? []
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // ── Call Workers AI ─────────────────────────────────────────────────────
    try {
      const aiResponse = await env.chatbot_llm_binding.run(
        '@cf/meta/llama-3.1-8b-instruct',
        { system, messages }
      )

      return new Response(JSON.stringify(aiResponse), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })

    } catch (err) {
      console.error('Workers AI error:', err)
      return new Response(
        JSON.stringify({ error: 'AI service error.', response: 'Sorry, the AI is temporarily unavailable. Please try again shortly.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }
}
