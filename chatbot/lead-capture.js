/**
 * lead-capture.js
 * ───────────────
 * Detects the AI's lead capture signal and renders an inline contact form
 * inside the chat widget. Submits to Formspree and shows confirmation.
 */

// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
// Your Formspree form endpoint. Create a free form at https://formspree.io
// and paste the endpoint URL here, e.g. 'https://formspree.io/f/abcdefgh'
export const FORMSPREE_URL = 'https://formspree.io/f/meepakev'
// ───────────────────────────────────────────────────────────────────────────────

const LEAD_TRIGGER = '{"action":"lead_capture"}'

/**
 * Checks if the AI response contains the lead capture signal.
 * If yes, renders an inline form inside containerEl (the message list area).
 * The inputAreaEl is hidden while the form is shown.
 *
 * @param {string} responseText - The raw text response from the AI
 * @param {HTMLElement} messageListEl - The scrollable message list container
 * @param {HTMLElement} inputAreaEl - The normal chat input area
 * @param {Function} onSuccess - Called with the submitted name after success
 * @returns {boolean} true if lead capture was triggered
 */
export function checkForLeadCapture(responseText, messageListEl, inputAreaEl, onSuccess) {
  if (!responseText.includes(LEAD_TRIGGER)) return false

  // Hide the normal chat input
  inputAreaEl.style.display = 'none'

  // Build the inline form
  const formWrapper = document.createElement('div')
  formWrapper.className = 'vaf-lead-form'
  formWrapper.setAttribute('data-vaf-lead-form', 'true')
  formWrapper.innerHTML = `
    <p class="vaf-lead-intro">
      We'd love to help plan your African adventure! 🌍<br>
      Leave your details and we'll be in touch within 24 hours.
    </p>
    <form class="vaf-lead-inner-form" novalidate>
      <input
        type="text"
        name="name"
        class="vaf-lead-input"
        placeholder="Your name *"
        required
        autocomplete="name"
      />
      <input
        type="email"
        name="email"
        class="vaf-lead-input"
        placeholder="Your email *"
        required
        autocomplete="email"
      />
      <textarea
        name="message"
        class="vaf-lead-textarea"
        placeholder="Tell us about your dream trip — destination, dates, group size... *"
        rows="3"
        required
      ></textarea>
      <button type="submit" class="vaf-lead-submit">
        Send My Enquiry ✈️
      </button>
      <p class="vaf-lead-error" style="display:none;"></p>
    </form>
  `

  messageListEl.appendChild(formWrapper)
  messageListEl.scrollTop = messageListEl.scrollHeight

  // Focus first input
  setTimeout(() => formWrapper.querySelector('input[name="name"]').focus(), 100)

  // Handle submission
  const form = formWrapper.querySelector('.vaf-lead-inner-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const submitBtn = form.querySelector('.vaf-lead-submit')
    const errorEl = form.querySelector('.vaf-lead-error')

    const name = form.querySelector('input[name="name"]').value.trim()
    const email = form.querySelector('input[name="email"]').value.trim()
    const message = form.querySelector('textarea[name="message"]').value.trim()

    if (!name || !email || !message) {
      errorEl.textContent = 'Please fill in all fields.'
      errorEl.style.display = 'block'
      return
    }

    submitBtn.textContent = 'Sending...'
    submitBtn.disabled = true
    errorEl.style.display = 'none'

    if (!FORMSPREE_URL) {
      // Formspree not configured — show success anyway for demo purposes
      _showSuccess(formWrapper, messageListEl, name, onSuccess)
      return
    }

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ name, email, message, _subject: 'New NextStop Africa Tours Agency Enquiry' })
      })

      if (res.ok) {
        _showSuccess(formWrapper, messageListEl, name, onSuccess)
      } else {
        throw new Error('Formspree responded with an error')
      }
    } catch (err) {
      console.error('[NextStop Africa Chat] Lead capture error:', err)
      submitBtn.textContent = 'Send My Enquiry ✈️'
      submitBtn.disabled = false
      errorEl.textContent =
        'Something went wrong. Please email us directly at nexttopafrica@gmail.com'
      errorEl.style.display = 'block'
    }
  })

  return true
}

/**
 * Shows a success confirmation message replacing the form.
 * @private
 */
function _showSuccess(formWrapper, messageListEl, name, onSuccess) {
  formWrapper.innerHTML = `
    <div class="vaf-lead-success">
      <span class="vaf-lead-success-icon">🌍</span>
      <p>Thanks <strong>${_escape(name)}</strong>! We'll be in touch within 24 hours.</p>
      <p class="vaf-lead-success-sub">In the meantime, feel free to browse our
        <a href="/brochure.html">packages brochure</a>.</p>
    </div>
  `
  messageListEl.scrollTop = messageListEl.scrollHeight
  if (typeof onSuccess === 'function') onSuccess(name)
}

/**
 * Restores the normal chat input area (call after lead capture is complete).
 * @param {HTMLElement} inputAreaEl
 */
export function resetLeadCapture(inputAreaEl) {
  inputAreaEl.style.display = ''
  // Remove any existing lead forms from the DOM
  document.querySelectorAll('[data-vaf-lead-form]').forEach(el => el.remove())
}

/** Simple HTML escape utility */
function _escape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
