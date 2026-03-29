/**
 * chat-ui.js
 * ──────────
 * Self-contained chat widget module for Visit Africa 21.
 * Injects the bubble, panel, and all interaction logic into document.body.
 * No external libraries — vanilla JS + ES modules only.
 */

import { sendMessage } from './chat-api.js'
import { checkForLeadCapture, resetLeadCapture } from './lead-capture.js'

// ── Constants ────────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  'Tell me about your tours',
  'Destinations',
  'How to book',
  'Pricing'
]

const GREETING =
  "🌍 Jambo! I'm Amara, your Visit Africa 21 travel guide. " +
  "Whether you're dreaming of gorillas in Uganda, safaris in the Serengeti, " +
  "or the sands of the Sahara — I'm here to help. What can I plan for you today?"

// ── State ────────────────────────────────────────────────────────────────────

let isOpen = false
let isWaiting = false
let hasGreeted = false
let leadCaptureActive = false

/** @type {Array<{role: 'user'|'assistant', content: string}>} */
const history = []

// ── DOM References ────────────────────────────────────────────────────────────

let widget, bubble, badge, panel, messageList, inputArea, textarea, sendBtn

// ── Initialisation ───────────────────────────────────────────────────────────

function init() {
  injectHTML()
  bindEvents()
  scheduleUnreadBadge()
}

function injectHTML() {
  widget = document.createElement('div')
  widget.className = 'vaf-chat-widget'
  widget.setAttribute('aria-label', 'Chat with Visit Africa 21')
  widget.innerHTML = `
    <!-- Floating Bubble -->
    <button
      class="vaf-bubble"
      id="vaf-bubble"
      aria-label="Open chat"
      aria-expanded="false"
      aria-controls="vaf-panel"
    >
      <!-- Chat Icon -->
      <svg class="vaf-bubble-icon vaf-bubble-icon--chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <!-- Close Icon -->
      <svg class="vaf-bubble-icon vaf-bubble-icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <!-- Unread Badge -->
      <span class="vaf-badge" id="vaf-badge" aria-hidden="true">1</span>
    </button>

    <!-- Chat Panel -->
    <div class="vaf-panel" id="vaf-panel" role="dialog" aria-label="Visit Africa 21 Chat" aria-hidden="true">

      <!-- Header -->
      <div class="vaf-header">
        <div class="vaf-header-avatar" aria-hidden="true">🦁</div>
        <div class="vaf-header-text">
          <div class="vaf-header-name">Amara — Africa Travel Guide</div>
          <div class="vaf-header-status">
            <span class="vaf-status-dot"></span>
            Online · Visit Africa 21
          </div>
        </div>
      </div>

      <!-- Message List -->
      <div class="vaf-messages" id="vaf-messages" role="log" aria-live="polite" aria-label="Conversation"></div>

      <!-- Input Area -->
      <div class="vaf-input-area" id="vaf-input-area">
        <textarea
          class="vaf-textarea"
          id="vaf-textarea"
          placeholder="Ask me anything about Africa travel…"
          rows="1"
          aria-label="Your message"
          maxlength="1000"
        ></textarea>
        <button class="vaf-send-btn" id="vaf-send-btn" aria-label="Send message" disabled>
          <svg class="vaf-send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <span class="vaf-powered">Powered by Visit Africa 21 · AI assistant</span>
    </div>
  `

  document.body.appendChild(widget)

  // Cache references
  bubble      = widget.querySelector('#vaf-bubble')
  badge       = widget.querySelector('#vaf-badge')
  panel       = widget.querySelector('#vaf-panel')
  messageList = widget.querySelector('#vaf-messages')
  inputArea   = widget.querySelector('#vaf-input-area')
  textarea    = widget.querySelector('#vaf-textarea')
  sendBtn     = widget.querySelector('#vaf-send-btn')
}

// ── Events ───────────────────────────────────────────────────────────────────

function bindEvents() {
  // Toggle panel
  bubble.addEventListener('click', togglePanel)

  // Textarea input
  textarea.addEventListener('input', () => {
    autoGrow()
    sendBtn.disabled = textarea.value.trim().length === 0 || isWaiting
  })

  // Send on Enter (Shift+Enter = newline)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!sendBtn.disabled) handleSend()
    }
  })

  // Send button click
  sendBtn.addEventListener('click', handleSend)

  // Close panel on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel()
  })
}

function togglePanel() {
  isOpen ? closePanel() : openPanel()
}

function openPanel() {
  isOpen = true
  widget.classList.add('vaf-open')
  bubble.setAttribute('aria-expanded', 'true')
  panel.setAttribute('aria-hidden', 'false')
  hideBadge()

  if (!hasGreeted) {
    hasGreeted = true
    setTimeout(() => {
      showTyping()
      setTimeout(() => {
        hideTyping()
        appendBotMessage(GREETING)
        showQuickReplies()
      }, 900)
    }, 300)
  } else {
    scrollToBottom()
  }

  // Focus textarea after animation
  setTimeout(() => textarea.focus(), 320)
}

function closePanel() {
  isOpen = false
  widget.classList.remove('vaf-open')
  bubble.setAttribute('aria-expanded', 'false')
  panel.setAttribute('aria-hidden', 'true')
}

// ── Sending Messages ──────────────────────────────────────────────────────────

async function handleSend() {
  const text = textarea.value.trim()
  if (!text || isWaiting) return

  // Reset lead capture state if a new message is sent after form
  if (leadCaptureActive) {
    leadCaptureActive = false
    resetLeadCapture(inputArea)
  }

  appendUserMessage(text)
  textarea.value = ''
  autoGrow()
  sendBtn.disabled = true
  setWaiting(true)

  // Add to history
  history.push({ role: 'user', content: text })

  try {
    showTyping()
    const data = await sendMessage(history)
    hideTyping()

    const reply = data?.response ?? "I'm not sure about that — please email us at visitafrica21@gmail.com for help."

    // Check for lead capture trigger before rendering
    const tempDiv = document.createElement('div')
    tempDiv.textContent = reply
    const rawReply = tempDiv.textContent

    const triggered = checkForLeadCapture(rawReply, messageList, inputArea, (name) => {
      // After successful lead capture, restore input and continue convo
      leadCaptureActive = false
      resetLeadCapture(inputArea)
      const confirmMsg =
        `Thanks ${name}! We'll be in touch within 24 hours. 🌍 ` +
        `Is there anything else I can help you with?`
      appendBotMessage(confirmMsg)
      history.push({ role: 'assistant', content: confirmMsg })
    })

    if (!triggered) {
      appendBotMessage(rawReply)
      history.push({ role: 'assistant', content: rawReply })
    } else {
      leadCaptureActive = true
      // Add a neutral placeholder to history so the model doesn't re-trigger
      history.push({ role: 'assistant', content: '[Lead capture form displayed]' })
    }
  } catch (err) {
    hideTyping()
    const errMsg = "Sorry, something went wrong. Please try again or email visitafrica21@gmail.com."
    appendBotMessage(errMsg)
  } finally {
    setWaiting(false)
    if (!leadCaptureActive) {
      sendBtn.disabled = textarea.value.trim().length === 0
      textarea.focus()
    }
  }
}

// ── Quick Replies ─────────────────────────────────────────────────────────────

function showQuickReplies() {
  const chipsEl = document.createElement('div')
  chipsEl.className = 'vaf-chips'
  chipsEl.setAttribute('aria-label', 'Quick reply options')

  QUICK_REPLIES.forEach(label => {
    const chip = document.createElement('button')
    chip.className = 'vaf-chip'
    chip.textContent = label
    chip.setAttribute('type', 'button')
    chip.addEventListener('click', () => {
      chipsEl.remove()
      textarea.value = label
      autoGrow()
      handleSend()
    })
    chipsEl.appendChild(chip)
  })

  messageList.appendChild(chipsEl)
  scrollToBottom()
}

// ── Message Rendering ─────────────────────────────────────────────────────────

function appendUserMessage(text) {
  const msg = createMessageEl('user', text)
  messageList.appendChild(msg)
  scrollToBottom()
}

function appendBotMessage(text) {
  const msg = createMessageEl('bot', text)
  messageList.appendChild(msg)
  scrollToBottom()
}

function createMessageEl(role, text) {
  const wrap = document.createElement('div')
  wrap.className = `vaf-msg vaf-msg--${role}`

  const bubble = document.createElement('div')
  bubble.className = 'vaf-msg-bubble'
  // Use innerText-style assignment to safely render text (no XSS)
  bubble.textContent = text

  const time = document.createElement('span')
  time.className = 'vaf-msg-time'
  time.textContent = formatTime(new Date())
  time.setAttribute('aria-label', `Sent at ${time.textContent}`)

  wrap.appendChild(bubble)
  wrap.appendChild(time)
  return wrap
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

let typingEl = null

function showTyping() {
  if (typingEl) return
  typingEl = document.createElement('div')
  typingEl.className = 'vaf-typing'
  typingEl.setAttribute('aria-label', 'Amara is typing')
  typingEl.innerHTML = `
    <span class="vaf-typing-dot"></span>
    <span class="vaf-typing-dot"></span>
    <span class="vaf-typing-dot"></span>
  `
  messageList.appendChild(typingEl)
  scrollToBottom()
}

function hideTyping() {
  if (typingEl) {
    typingEl.remove()
    typingEl = null
  }
}

// ── Badge ─────────────────────────────────────────────────────────────────────

function scheduleUnreadBadge() {
  setTimeout(() => {
    if (!isOpen) badge.classList.add('vaf-badge--visible')
  }, 3000)
}

function hideBadge() {
  badge.classList.remove('vaf-badge--visible')
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function setWaiting(val) {
  isWaiting = val
  textarea.disabled = val
  sendBtn.disabled = val
}

function autoGrow() {
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messageList.scrollTop = messageList.scrollHeight
  })
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Boot ──────────────────────────────────────────────────────────────────────

// Run when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
