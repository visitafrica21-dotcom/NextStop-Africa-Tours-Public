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
  function injectWidgetCSS() {
    if (document.getElementById('whatsapp-widget-styles')) return;
    const css = `
      .whatsapp-widget { position: fixed; bottom: 20px; right: 86px !important; z-index: 11000 !important; }
      .whatsapp-btn { display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: #25D366; color: #fff; border-radius: 50%; text-decoration: none; box-shadow: 0 6px 20px rgba(37,211,102,0.28); }
      .whatsapp-btn:hover { transform: scale(1.06); background: #20ba5a; }
      .whatsapp-icon { width: 32px; height: 32px; fill: white; }
      .whatsapp-tooltip { position: absolute; bottom: 80px; right: 0; background: rgba(0,0,0,0.85); color: #fff; padding: 8px 10px; border-radius: 6px; font-size: 0.8rem; opacity: 0; transition: opacity 180ms ease; pointer-events: none; }
      .whatsapp-btn:hover .whatsapp-tooltip { opacity: 1; }
      @media (max-width: 768px) { .whatsapp-widget { right: 78px !important; bottom: 16px !important; } .whatsapp-btn{ width:56px; height:56px } .whatsapp-icon{ width:28px; height:28px } }
    `;
    const style = document.createElement('style');
    style.id = 'whatsapp-widget-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function createWhatsAppWidget() {
    injectWidgetCSS();
    // Create widget container
    const widget = document.createElement('div');
    widget.className = 'whatsapp-widget';
    widget.setAttribute('aria-label', 'WhatsApp Chat');

    widget.innerHTML = `
      <a href="${WHATSAPP_URL}"
         class="whatsapp-btn"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Chat with us on WhatsApp">
        <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a6.963 6.963 0 00-7.145 7.146c0 1.98.757 3.846 2.134 5.238l-.33 1.204c-.12.437.027.907.404 1.18.22.16.493.25.77.25.1 0 .202-.01.301-.03l1.34-.418c1.329.693 2.823 1.055 4.382 1.055 3.86 0 7-3.14 7-7s-3.14-7-7-7zm0-2.073c4.165 0 7.555 3.39 7.555 7.555 0 4.165-3.39 7.555-7.555 7.555-1.548 0-3.024-.468-4.258-1.347l-4.73 1.475c-.493.154-.922-.317-.768-.81l1.475-4.73c-.879-1.234-1.347-2.71-1.347-4.258 0-4.165 3.39-7.555 7.555-7.555z"/>
        </svg>
        <span class="whatsapp-tooltip">Chat on WhatsApp</span>
      </a>
    `;

    // Add to document body
    document.body.appendChild(widget);
    // After insertion, try to position relative to chat widget
    positionWidgetRelativeToChat(widget);
    // Reposition on resize
    window.addEventListener('resize', () => positionWidgetRelativeToChat(widget));
    // Observe DOM changes to detect chat open/close
    const observer = new MutationObserver(() => positionWidgetRelativeToChat(widget));
    observer.observe(document.body, { attributes: false, childList: true, subtree: true });
  }

  // Position the WhatsApp widget to the left of the chat widget (bubble or panel)
  function positionWidgetRelativeToChat(widget) {
    try {
      const chatWidget = document.querySelector('.vaf-chat-widget');
      if (!chatWidget) {
        // No chat widget — keep default offsets
        widget.style.right = '';
        widget.style.bottom = '';
        return;
      }

      // Prefer the open panel if visible, otherwise the bubble
      const panel = chatWidget.querySelector('.vaf-panel');
      const bubble = chatWidget.querySelector('.vaf-bubble');
      let target = null;

      // Determine visibility: prefer panel if it is visible (offsetParent) or chatWidget has vaf-open
      if (chatWidget.classList.contains('vaf-open') && panel && panel.offsetParent !== null) {
        target = panel;
      } else if (bubble && bubble.offsetParent !== null) {
        target = bubble;
      } else if (panel && panel.offsetParent !== null) {
        target = panel;
      }

      if (!target) {
        // fallback
        widget.style.right = '';
        widget.style.bottom = '';
        return;
      }

      const rect = target.getBoundingClientRect();
      const spacing = 12; // px space between widgets
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;

      // distance from right edge to target's right edge
      const targetRightFromRight = Math.max(0, windowW - rect.right);
      // compute new right so whatsapp sits to the left of target with spacing
      const newRight = targetRightFromRight + rect.width + spacing;
      // distance from bottom edge to target's bottom edge
      const targetBottomFromBottom = Math.max(8, windowH - rect.bottom);

      widget.style.right = `${Math.round(newRight)}px`;
      widget.style.bottom = `${Math.round(targetBottomFromBottom)}px`;
      // ensure it stays above the chat widget
      widget.style.zIndex = '11000';
    } catch (e) {
      // silent fail
      // leave default placement
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWhatsAppWidget);
  } else {
    createWhatsAppWidget();
  }
})();
