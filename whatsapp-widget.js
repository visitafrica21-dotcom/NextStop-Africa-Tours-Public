/**
 * WhatsApp Widget
 * Adds a floating WhatsApp button to the page
 */

(function() {
  const WHATSAPP_NUMBER = '256770307890'; // NextStop Africa Tours
  const WHATSAPP_MESSAGE = 'Hello! I would like to inquire about your African tours and packages.';
  const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  // Inject minimal CSS so the widget is styled even on pages that don't
  // include the main `styles.css` (e.g., `brochure.html`). Also set a
  // high z-index and an offset to avoid overlapping the site's chat widget.
  // Chat bubble is 48px at right:22px bottom:22px
  // WhatsApp sits directly above it: bottom = 22 + 48 + 14(gap) = 84px
  function injectWidgetCSS() {
    if (document.getElementById('whatsapp-widget-styles')) return;
    const css = `
      .whatsapp-widget {
        position: fixed;
        bottom: 84px;
        right: 22px;
        z-index: 11000 !important;
        transition: bottom 0.28s ease, right 0.28s ease;
      }
      .whatsapp-btn {
        display: flex; align-items: center; justify-content: center;
        width: 48px; height: 48px;
        background: #25D366; color: #fff;
        border-radius: 50%;
        text-decoration: none;
        box-shadow: 0 6px 20px rgba(37,211,102,0.28);
        overflow: hidden;
        transition: transform 0.22s ease, background 0.22s ease;
      }
      .whatsapp-btn:hover { transform: scale(1.08); background: #20ba5a; }
      .whatsapp-img { width: 26px; height: 26px; object-fit: contain; display: block; }
      .whatsapp-tooltip {
        position: absolute; bottom: 56px; right: 0;
        background: rgba(0,0,0,0.85); color: #fff;
        padding: 6px 10px; border-radius: 6px;
        font-size: 0.75rem; white-space: nowrap;
        opacity: 0; transition: opacity 180ms ease;
        pointer-events: none;
      }
      .whatsapp-btn:hover .whatsapp-tooltip { opacity: 1; }

      /* "Need help?" CTA label */
      .whatsapp-cta {
        position: absolute;
        right: 56px; top: 50%;
        transform: translateY(-50%) translateX(8px);
        background: #fff;
        color: #2a2421;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 99px;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        border: 1px solid rgba(42,36,33,0.08);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }
      .whatsapp-cta.visible {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
        pointer-events: auto;
        cursor: pointer;
      }
      /* Small arrow pointing right toward the button */
      .whatsapp-cta::after {
        content: '';
        position: absolute;
        right: -5px; top: 50%;
        transform: translateY(-50%) rotate(45deg);
        width: 8px; height: 8px;
        background: #fff;
        border-right: 1px solid rgba(42,36,33,0.08);
        border-bottom: 1px solid rgba(42,36,33,0.08);
      }
      @media (max-width: 520px) {
        .whatsapp-widget { right: 14px !important; bottom: 76px !important; }
        .whatsapp-btn { width: 48px; height: 48px; }
        .whatsapp-img { width: 24px; height: 24px; }
        .whatsapp-cta { font-size: 0.68rem; padding: 5px 12px; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'whatsapp-widget-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function createWhatsAppWidget() {
    injectWidgetCSS();
    const widget = document.createElement('div');
    widget.className = 'whatsapp-widget';
    widget.setAttribute('aria-label', 'WhatsApp Chat');

    widget.innerHTML = `
      <a href="${WHATSAPP_URL}"
         class="whatsapp-btn"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Chat with us on WhatsApp">
        <img src="images/whatsapp-logo.svg" alt="WhatsApp" class="whatsapp-img" />
        <span class="whatsapp-tooltip">Chat on WhatsApp</span>
      </a>
    `;

    document.body.appendChild(widget);
    repositionWidget(widget);
    window.addEventListener('resize', () => repositionWidget(widget));
    // Re-check when chat panel opens/closes
    const observer = new MutationObserver(() => repositionWidget(widget));
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    // Show "Need help?" CTA once per session
    showCTA(widget);
  }

  // Reposition WhatsApp widget above chat panel when it's open
  function repositionWidget(widget) {
    try {
      const chatWidget = document.querySelector('.vaf-chat-widget');
      if (!chatWidget) return;

      const isOpen = chatWidget.classList.contains('vaf-open');

      if (isOpen) {
        // Chat panel is open — move WhatsApp above the panel
        const panel = chatWidget.querySelector('.vaf-panel');
        if (panel) {
          const rect = panel.getBoundingClientRect();
          const windowH = window.innerHeight;
          const windowW = window.innerWidth;
          const abovePanel = Math.max(8, Math.round(windowH - rect.top + 14));
          const rightAlign = Math.max(8, Math.round(windowW - rect.right));
          widget.style.bottom = `${abovePanel}px`;
          widget.style.right = `${rightAlign}px`;
        }
      } else {
        // Chat bubble mode — use default CSS position (above the bubble)
        widget.style.bottom = '';
        widget.style.right = '';
      }
    } catch (e) {
      // silent fail — keep CSS defaults
    }
  }

  // "Need help?" CTA — slides in after a short delay, stays visible
  function showCTA(widget) {
    const cta = document.createElement('span');
    cta.className = 'whatsapp-cta visible';
    cta.textContent = 'Need help?';
    widget.appendChild(cta);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWhatsAppWidget);
  } else {
    createWhatsAppWidget();
  }
})();
