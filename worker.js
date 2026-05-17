/**
 * worker.js — Visit Africa 21 Chat & Itinerary Worker
 * ────────────────────────────────────────────────────────
 * Cloudflare Worker that handles:
 * 1. Chat requests to Workers AI (binding: chatbot_llm_binding)
 * 2. Itinerary CRUD operations (binding: itineraries_kv)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // ── Handle CORS preflight ───────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    // ── Route to itinerary API ──────────────────────────────────────────────
    if (path === '/api/itineraries') {
      return handleItineraryAPI(request, env)
    }

    // ── Route to chat API ────────────────────────────────────────────────────
    if (path === '/api/chat') {
      return handleChatAPI(request, env)
    }

    // ── 404 for unknown paths ───────────────────────────────────────────────
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleItineraryAPI(request, env) {
  const method = request.method

  // GET all itineraries
  if (method === 'GET') {
    try {
      const data = await env.itineraries_kv.get('itineraries', { type: 'json' })
      const itineraries = data || []
      return new Response(JSON.stringify(itineraries), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    } catch (err) {
      console.error('Error reading itineraries:', err)
      return new Response(
        JSON.stringify({ error: 'Failed to read itineraries' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  // POST/PUT save itineraries
  if (method === 'POST' || method === 'PUT') {
    try {
      const itineraries = await request.json()
      if (!Array.isArray(itineraries)) {
        return new Response(
          JSON.stringify({ error: 'Invalid data: expected array' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
      await env.itineraries_kv.put('itineraries', JSON.stringify(itineraries))
      return new Response(JSON.stringify(itineraries), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      })
    } catch (err) {
      console.error('Error saving itineraries:', err)
      return new Response(
        JSON.stringify({ error: 'Failed to save itineraries' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  )
}

async function handleChatAPI(request, env) {
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
    console.log(system.slice(0, 200))

    const aiResponse = await env.chatbot_llm_binding.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: [
          { role: "system", content: system },
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 1024
      }
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
