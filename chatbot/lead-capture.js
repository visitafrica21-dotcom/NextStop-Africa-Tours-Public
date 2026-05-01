/**
 * lead-capture.js
 * Detects the AI lead-capture signal and renders an inline planning form
 * inside the chat widget.
 */

export const FORMSPREE_URL = 'https://formspree.io/f/meepakev'

const LEAD_TRIGGER = '{"action":"lead_capture"}'

export function checkForLeadCapture(responseText, messageListEl, inputAreaEl, onSuccess) {
  if (!responseText.includes(LEAD_TRIGGER)) return false

  inputAreaEl.style.display = 'none'

  const formWrapper = document.createElement('div')
  formWrapper.className = 'vaf-lead-form'
  formWrapper.setAttribute('data-vaf-lead-form', 'true')
  formWrapper.innerHTML = `
    <p class="vaf-lead-intro">
      Share your details and our team will reply within 24 hours with the best next steps for your trip.
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
        placeholder="Tell us about your dream trip - destination, dates, group size, or style of travel *"
        rows="4"
        required
      ></textarea>
      <button type="submit" class="vaf-lead-submit">
        Send planning request
      </button>
      <p class="vaf-lead-error" style="display:none;"></p>
    </form>
  `

  messageListEl.appendChild(formWrapper)
  messageListEl.scrollTop = messageListEl.scrollHeight

  window.setTimeout(() => {
    formWrapper.querySelector('input[name="name"]')?.focus()
  }, 100)

  const form = formWrapper.querySelector('.vaf-lead-inner-form')
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

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
      showSuccess(formWrapper, messageListEl, name, onSuccess)
      return
    }

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: 'New NextStop Africa Tours Agency inquiry'
        })
      })

      if (!response.ok) {
        throw new Error('Formspree responded with an error')
      }

      showSuccess(formWrapper, messageListEl, name, onSuccess)
    } catch (error) {
      console.error('[NextStop Africa Chat] Lead capture error:', error)
      submitBtn.textContent = 'Send planning request'
      submitBtn.disabled = false
      errorEl.textContent =
        'Something went wrong. Please email us directly at inquire@nextstopafricatours.com.'
      errorEl.style.display = 'block'
    }
  })

  return true
}

function showSuccess(formWrapper, messageListEl, name, onSuccess) {
  formWrapper.innerHTML = `
    <div class="vaf-lead-success">
      <p>Thanks <strong>${escapeHtml(name)}</strong>. Our team will be in touch within 24 hours.</p>
      <p class="vaf-lead-success-sub">
        In the meantime, you can keep chatting here or browse the <a href="brochure.html">packages brochure</a>.
      </p>
    </div>
  `

  messageListEl.scrollTop = messageListEl.scrollHeight
  if (typeof onSuccess === 'function') onSuccess(name)
}

export function resetLeadCapture(inputAreaEl) {
  inputAreaEl.style.display = ''
  document.querySelectorAll('[data-vaf-lead-form]').forEach((element) => element.remove())
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
