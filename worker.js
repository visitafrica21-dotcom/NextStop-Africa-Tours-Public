export default {
  async fetch(request, env) {

    const response = await env.chatbot_llm_binding.run(
      '@cf/meta/llama-3.1-8b-instruct',
      {
        messages: [
          { role: 'user', content: 'Say hello and introduce yourself in one sentence.' }
        ]
      }
    )

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
