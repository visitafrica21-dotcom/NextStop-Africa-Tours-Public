/**
 * WhatsApp Widget
 * Adds a floating WhatsApp button to the page
 */

(function() {
  const WHATSAPP_NUMBER = '256770307890'; // NextStop Africa Tours
  const WHATSAPP_MESSAGE = 'Hello! I would like to inquire about your African tours and packages.';
  const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  function createWhatsAppWidget() {
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWhatsAppWidget);
  } else {
    createWhatsAppWidget();
  }
})();
