document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-inquire');
  const navbar = document.getElementById('navbar');
  const contactMessage = document.getElementById('contact-message');
  const accordionPanels = document.querySelectorAll('[data-accordion-panel]');

  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  const setActiveAccordion = (panel) => {
    accordionPanels.forEach((item) => {
      item.classList.toggle('is-active', item === panel);
    });
  };

  const scrollToElement = (targetElement) => {
    const headerOffset = 80;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  mobileMenuBtn?.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  document.querySelectorAll('.slide-up').forEach((element) => {
    observer.observe(element);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      scrollToElement(targetElement);
    });
  });

  if (contactMessage) {
    contactMessage.addEventListener('input', () => {
      delete contactMessage.dataset.autofilled;
    });
  }

  document.querySelectorAll('[data-inquiry]').forEach((cta) => {
    cta.addEventListener('click', () => {
      if (!contactMessage) {
        return;
      }

      const inquiry = cta.getAttribute('data-inquiry');
      if (!inquiry) {
        return;
      }

      contactMessage.value = inquiry;
      contactMessage.dataset.autofilled = 'true';
      contactMessage.dispatchEvent(new Event('input', { bubbles: true }));

      window.setTimeout(() => {
        contactMessage.focus({ preventScroll: true });
        contactMessage.setSelectionRange(contactMessage.value.length, contactMessage.value.length);
      }, 450);
    });
  });

  if (accordionPanels.length > 0) {
    if (!document.querySelector('[data-accordion-panel].is-active')) {
      setActiveAccordion(accordionPanels[0]);
    }

    accordionPanels.forEach((panel) => {
      panel.addEventListener('mouseenter', () => {
        if (isDesktop()) {
          setActiveAccordion(panel);
        }
      });

      panel.addEventListener('focusin', () => {
        if (isDesktop()) {
          setActiveAccordion(panel);
        }
      });

      panel.addEventListener('click', () => {
        if (isDesktop()) {
          setActiveAccordion(panel);
        }
      });
    });
  }

  const contactForms = document.querySelectorAll('.contact-form');
  contactForms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          alert("Thanks for reaching out. We'll be in touch within 24 hours to help plan your trip.");
          form.reset();
          if (contactMessage) {
            delete contactMessage.dataset.autofilled;
          }
        } else {
          alert('There was an issue sending your message. Please try again.');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('There was an error sending your message. Please try again.');
      }
    });
  });
});
