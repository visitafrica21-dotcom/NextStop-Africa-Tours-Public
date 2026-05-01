/**
 * chat-ui.js
 * Self-contained chat widget module for NextStop Africa Tours Agency.
 * Injects the bubble, panel, and interaction logic into document.body.
 */

import { sendMessage } from './chat-api.js'
import { checkForLeadCapture, resetLeadCapture } from './lead-capture.js'

const WELCOME_ACTIONS = [
  {
    label: 'Help me choose a destination',
    prompt: 'Help me choose the best destination for my trip.'
  },
  {
    label: 'Plan a safari',
    prompt: 'I want help planning a safari.'
  },
  {
    label: 'See pricing options',
    prompt: 'What pricing options do you offer?'
  },
  {
    label: 'Build a custom itinerary',
    prompt: 'I want a tailor-made African itinerary.'
  }
]

const SERVICE_PILLS = [
  'Destinations',
  'Safaris',
  'Pricing',
  'Custom trips'
]

const WELCOME_COPY =
  "I'm Miremba, your NextStop Africa trip planning concierge. " +
  "How can I help you?"

let isOpen = false
let isWaiting = false
let leadCaptureActive = false
let badgeShown = false
let badgeTimerId = null
let removeBadgeScrollWatcher = null
let typingEl = null

/** @type {Array<{role: 'user'|'assistant', content: string}>} */
const history = []

let widget
let bubble
let badge
let panel
let closeBtn
let messageList
let inputArea
let textarea
let sendBtn

function init() {
  injectHTML()
  bindEvents()
  scheduleUnreadBadge()
}

function injectHTML() {
  widget = document.createElement('div')
  widget.className = 'vaf-chat-widget'
  widget.setAttribute('aria-label', 'Chat with NextStop Africa')
  widget.innerHTML = `
    <button
      class="vaf-bubble"
      id="vaf-bubble"
      aria-label="Open chat"
      aria-expanded="false"
      aria-controls="vaf-panel"
    >
      <svg class="vaf-bubble-icon vaf-bubble-icon--chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="vaf-bubble-label">Plan your trip</span>
      <span class="vaf-badge" id="vaf-badge" aria-hidden="true">1</span>
    </button>

    <div class="vaf-panel" id="vaf-panel" role="dialog" aria-label="NextStop Africa chat" aria-hidden="true">
      <div class="vaf-header">
        <div class="vaf-header-kicker">NextStop Africa concierge</div>
        <div class="vaf-header-main">
          <div class="vaf-header-avatar" aria-hidden="true">NS</div>
          <div class="vaf-header-text">
            <div class="vaf-header-name">Miremba</div>
            <div class="vaf-header-role">Trip planning concierge</div>
          </div>
          <button class="vaf-close-btn" id="vaf-close-btn" type="button" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="vaf-header-status">
          <span class="vaf-status-dot"></span>
          Ready to help with destinations, itineraries, and pricing
        </div>
      </div>

      <div class="vaf-messages" id="vaf-messages" role="log" aria-live="polite" aria-label="Conversation"></div>

      <div class="vaf-input-area" id="vaf-input-area">
        <p class="vaf-input-copy">Ask a question or pick a starting point.</p>
        <div class="vaf-input-shell">
          <textarea
            class="vaf-textarea"
            id="vaf-textarea"
            placeholder="Type your message here..."
            rows="1"
            aria-label="Your message"
            maxlength="1000"
          ></textarea>
          <button class="vaf-send-btn" id="vaf-send-btn" aria-label="Send message" disabled>
            <svg class="vaf-send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <span class="vaf-powered">NextStop Africa concierge</span>
    </div>
  `

  document.body.appendChild(widget)

  bubble = widget.querySelector('#vaf-bubble')
  badge = widget.querySelector('#vaf-badge')
  panel = widget.querySelector('#vaf-panel')
  closeBtn = widget.querySelector('#vaf-close-btn')
  messageList = widget.querySelector('#vaf-messages')
  inputArea = widget.querySelector('#vaf-input-area')
  textarea = widget.querySelector('#vaf-textarea')
  sendBtn = widget.querySelector('#vaf-send-btn')
}

function bindEvents() {
  bubble.addEventListener('click', togglePanel)
  closeBtn.addEventListener('click', closePanel)

  textarea.addEventListener('input', () => {
    autoGrow()
    sendBtn.disabled = textarea.value.trim().length === 0 || isWaiting
  })

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!sendBtn.disabled) {
        handleSend()
      }
    }
  })

  sendBtn.addEventListener('click', handleSend)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      closePanel()
    }
  })
}

function togglePanel() {
  isOpen ? closePanel() : openPanel()
}

function openPanel() {
  isOpen = true
  badgeShown = true
  if (badgeTimerId) clearTimeout(badgeTimerId)
  if (removeBadgeScrollWatcher) removeBadgeScrollWatcher()

  widget.classList.add('vaf-open')
  bubble.setAttribute('aria-expanded', 'true')
  panel.setAttribute('aria-hidden', 'false')
  hideBadge()

  if (history.length === 0) {
    renderWelcomeState()
  } else {
    scrollToBottom()
  }

  window.setTimeout(() => {
    if (!leadCaptureActive) {
      textarea.focus()
    }
  }, 220)
}

function closePanel() {
  isOpen = false
  widget.classList.remove('vaf-open')
  bubble.setAttribute('aria-expanded', 'false')
  panel.setAttribute('aria-hidden', 'true')
}

function renderWelcomeState() {
  if (messageList.querySelector('[data-vaf-welcome]')) return

  const welcomeCard = document.createElement('section')
  welcomeCard.className = 'vaf-welcome-card'
  welcomeCard.setAttribute('data-vaf-welcome', 'true')
  welcomeCard.innerHTML = `
    <p class="vaf-welcome-kicker">Plan faster</p>
    <h3 class="vaf-welcome-title">Start with the kind of trip you want</h3>
    <p class="vaf-welcome-body">${WELCOME_COPY}</p>
    <div class="vaf-action-grid" data-vaf-action-grid="true"></div>
    <div class="vaf-welcome-links">
      <button class="vaf-inline-primary" type="button" data-vaf-start-inquiry="true">Start an inquiry</button>
      <a class="vaf-inline-link" href="brochure.html">View brochure</a>
    </div>
  `

  const actionGrid = welcomeCard.querySelector('[data-vaf-action-grid="true"]')
  WELCOME_ACTIONS.forEach((action) => {
    const button = document.createElement('button')
    button.className = 'vaf-action-card'
    button.type = 'button'
    button.textContent = action.label
    button.addEventListener('click', () => {
      sendPresetPrompt(action.prompt)
    })
    actionGrid.appendChild(button)
  })

  welcomeCard.querySelector('[data-vaf-start-inquiry="true"]').addEventListener('click', () => {
    startHomepageInquiry(buildInquiryPrefill('I would like help planning my trip.'))
  })

  messageList.appendChild(welcomeCard)
  scrollToBottom()
}

function dismissWelcomeState() {
  messageList.querySelector('[data-vaf-welcome]')?.remove()
}

function sendPresetPrompt(prompt) {
  if (isWaiting) return
  textarea.value = prompt
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  handleSend()
}

async function handleSend() {
  const text = textarea.value.trim()
  if (!text || isWaiting) return

  if (leadCaptureActive || messageList.querySelector('[data-vaf-lead-form]')) {
    leadCaptureActive = false
    resetLeadCapture(inputArea)
  }

  dismissWelcomeState()
  removeInlineActions()
  hideTyping()

  appendUserMessage(text)
  textarea.value = ''
  autoGrow()
  sendBtn.disabled = true
  setWaiting(true)
  history.push({ role: 'user', content: text })

  try {
    showTyping()
    const data = await sendMessage(history)
    hideTyping()

    const reply = data?.response ?? "I'm not sure about that. Please email inquire@nextstopafricatours.com for help."
    const rawReply = document.createElement('textarea')
    rawReply.textContent = reply

    const triggered = checkForLeadCapture(rawReply.value, messageList, inputArea, (name) => {
      leadCaptureActive = false
      inputArea.style.display = ''
      const confirmMsg = `Thanks ${name}. We'll be in touch within 24 hours.`
      appendBotMessage(confirmMsg)
      history.push({ role: 'assistant', content: confirmMsg })
      renderInlineActions(confirmMsg)
    })

    if (!triggered) {
      appendBotMessage(rawReply.value)
      history.push({ role: 'assistant', content: rawReply.value })
      renderInlineActions(text)
    } else {
      leadCaptureActive = true
      history.push({ role: 'assistant', content: '[Lead capture form displayed]' })
    }
  } catch (error) {
    hideTyping()
    const errMsg = 'Sorry, something went wrong. Please try again or email inquire@nextstopafricatours.com.'
    appendBotMessage(errMsg)
  } finally {
    setWaiting(false)
    if (!leadCaptureActive) {
      sendBtn.disabled = textarea.value.trim().length === 0
      textarea.focus()
    }
  }
}

function appendUserMessage(text) {
  const message = createMessageEl('user', text)
  messageList.appendChild(message)
  scrollToBottom()
}

function appendBotMessage(text) {
  const message = createMessageEl('bot', text)
  messageList.appendChild(message)
  scrollToBottom()
}

function createMessageEl(role, text) {
  const wrap = document.createElement('div')
  wrap.className = `vaf-msg vaf-msg--${role}`

  const bubbleEl = document.createElement('div')
  bubbleEl.className = 'vaf-msg-bubble'
  renderMessageContent(bubbleEl, text)

  wrap.appendChild(bubbleEl)
  return wrap
}

function renderMessageContent(container, text) {
  const normalizedText = prepareMessageText(text)
  const blocks = normalizedText.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

  if (blocks.length === 0) {
    container.textContent = normalizedText
    return
  }

  blocks.forEach((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
    const isOrderedList = lines.length > 1 && lines.every((line) => /^\d+\.\s+/.test(line))
    const isBulletList = lines.length > 1 && lines.every((line) => /^[-*•]\s+/.test(line))

    if (isOrderedList || isBulletList) {
      const list = document.createElement(isOrderedList ? 'ol' : 'ul')
      list.className = 'vaf-rich-list'
      lines.forEach((line) => {
        const item = document.createElement('li')
        item.textContent = line.replace(/^(\d+\.\s+|[-*•]\s+)/, '')
        list.appendChild(item)
      })
      container.appendChild(list)
      return
    }

    const paragraph = document.createElement('p')
    paragraph.textContent = lines.join(' ')
    container.appendChild(paragraph)
  })
}

function prepareMessageText(text) {
  const cleaned = text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim()

  if (cleaned.includes('\n') || cleaned.length < 220) {
    return cleaned
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]+(?:\s+|$)/g)
  if (!sentences || sentences.length < 2) {
    return cleaned
  }

  const chunks = []
  for (let index = 0; index < sentences.length; index += 2) {
    chunks.push(sentences.slice(index, index + 2).join(' ').trim())
  }

  return chunks.join('\n\n')
}

function renderInlineActions(sourceText) {
  removeInlineActions()

  const actions = document.createElement('div')
  actions.className = 'vaf-inline-actions'
  actions.setAttribute('data-vaf-inline-actions', 'true')

  const inquiryButton = document.createElement('button')
  inquiryButton.className = 'vaf-inline-primary'
  inquiryButton.type = 'button'
  inquiryButton.textContent = 'Start an inquiry'
  inquiryButton.addEventListener('click', () => {
    startHomepageInquiry(buildInquiryPrefill(sourceText))
  })

  const brochureLink = document.createElement('a')
  brochureLink.className = 'vaf-inline-link'
  brochureLink.href = 'brochure.html'
  brochureLink.textContent = 'View brochure'

  actions.appendChild(inquiryButton)
  actions.appendChild(brochureLink)
  messageList.appendChild(actions)
  scrollToBottom()
}

function removeInlineActions() {
  messageList.querySelectorAll('[data-vaf-inline-actions]').forEach((element) => element.remove())
}

function buildInquiryPrefill(sourceText) {
  const latestUserMessage = [...history].reverse().find((entry) => entry.role === 'user')?.content
  const context = sourceText || latestUserMessage || 'I would like help planning my trip.'
  return `I'd like to continue planning my trip with the NextStop Africa team. We were discussing: ${context}`
}

function startHomepageInquiry(prefillText) {
  const contactSection = document.getElementById('contact-form')
  const contactMessage = document.getElementById('contact-message')

  if (contactMessage) {
    contactMessage.value = prefillText
    contactMessage.dispatchEvent(new Event('input', { bubbles: true }))
  }

  closePanel()

  if (!contactSection) return

  window.setTimeout(() => {
    const headerOffset = 80
    const elementPosition = contactSection.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    if (contactMessage) {
      window.setTimeout(() => {
        contactMessage.focus()
        contactMessage.setSelectionRange(contactMessage.value.length, contactMessage.value.length)
      }, 500)
    }
  }, 160)
}

function showTyping() {
  if (typingEl) return
  typingEl = document.createElement('div')
  typingEl.className = 'vaf-typing'
  typingEl.setAttribute('aria-label', 'Miremba is typing')
  typingEl.innerHTML = `
    <span class="vaf-typing-dot"></span>
    <span class="vaf-typing-dot"></span>
    <span class="vaf-typing-dot"></span>
  `
  messageList.appendChild(typingEl)
  scrollToBottom()
}

function hideTyping() {
  if (!typingEl) return
  typingEl.remove()
  typingEl = null
}

function scheduleUnreadBadge() {
  const revealBadge = () => {
    if (badgeShown || isOpen) return
    badgeShown = true
    badge.classList.add('vaf-badge--visible')
    if (removeBadgeScrollWatcher) removeBadgeScrollWatcher()
  }

  const onScroll = () => {
    const hero = document.querySelector('.hero')
    const triggerPoint = hero ? hero.offsetHeight * 0.65 : window.innerHeight * 0.8
    if (window.scrollY >= triggerPoint) {
      revealBadge()
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  removeBadgeScrollWatcher = () => {
    window.removeEventListener('scroll', onScroll)
    removeBadgeScrollWatcher = null
  }

  badgeTimerId = window.setTimeout(() => {
    revealBadge()
  }, 12000)
}

function hideBadge() {
  badge.classList.remove('vaf-badge--visible')
}

function setWaiting(value) {
  isWaiting = value
  textarea.disabled = value
  sendBtn.disabled = value
}

function autoGrow() {
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messageList.scrollTop = messageList.scrollHeight
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
