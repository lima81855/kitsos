const META_PIXEL_ID = '1805622896407631';
const CHECKOUT_URL = 'https://pay.hotmart.com/I105969372T?checkoutMode=10';
const PRODUCT_ID = 'kit-sos-planta-morrendo';
const PRODUCT_VALUE = 47;
const CURRENCY = 'BRL';

function initMetaPixel() {
  if (window.fbq) return;

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
}

function hasFbq() {
  return typeof window.fbq === 'function';
}

function trackStandardEvent(eventName, payload = {}) {
  if (!hasFbq()) return;
  fbq('track', eventName, payload);
}

function trackCustomEvent(eventName, payload = {}) {
  if (!hasFbq()) return;
  fbq('trackCustom', eventName, payload);
}

function commonPayload(extra = {}) {
  return {
    content_name: 'Kit SOS Planta Morrendo',
    content_ids: [PRODUCT_ID],
    content_type: 'product',
    value: PRODUCT_VALUE,
    currency: CURRENCY,
    ...extra,
  };
}

function getPageContext() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('vendas')) {
    return {
      pageType: 'sales_page',
      contentName: 'Kit SOS Planta Morrendo - Pagina de Venda',
    };
  }

  return {
    pageType: 'quiz',
    contentName: 'Kit SOS Planta Morrendo - Quiz Diagnostico',
  };
}

function trackViewContent() {
  const context = getPageContext();

  trackStandardEvent('ViewContent', commonPayload({
    content_name: context.contentName,
    page_type: context.pageType,
  }));
}

function buildTrackedCheckoutUrl(baseUrl) {
  const currentParams = new URLSearchParams(window.location.search);
  const target = new URL(baseUrl);

  currentParams.forEach((value, key) => {
    if (!target.searchParams.has(key)) {
      target.searchParams.set(key, value);
    }
  });

  return target.toString();
}

let lastCheckoutIntentAt = 0;

function trackCheckoutIntent(source = 'checkout_cta', options = {}) {
  const now = Date.now();
  if (now - lastCheckoutIntentAt < 1200) return;
  lastCheckoutIntentAt = now;

  trackStandardEvent('InitiateCheckout', commonPayload({
    num_items: 1,
    source,
  }));

  if (options.includeButtonClick !== false) {
    trackCustomEvent('CheckoutButtonClick', commonPayload({
      destination: 'hotmart',
      source,
    }));
  }
}

function prepareCheckoutLinks() {
  document.querySelectorAll('a[href*="pay.hotmart.com"]').forEach((link) => {
    link.href = buildTrackedCheckoutUrl(link.href);
    link.setAttribute('data-checkout-link', 'true');
  });
}

function interceptCheckoutClicks() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href*="pay.hotmart.com"], a[data-checkout-link="true"]');
    if (!link) return;

    event.preventDefault();
    trackCheckoutIntent(link.dataset.checkoutSource || 'checkout_cta', { includeButtonClick: true });

    const destination = buildTrackedCheckoutUrl(link.href);
    setTimeout(() => {
      window.location.href = destination;
    }, 900);
  }, true);
}

function trackCheckoutHoverIntent() {
  document.addEventListener('pointerdown', (event) => {
    const link = event.target.closest && event.target.closest('a[href*="pay.hotmart.com"], a[data-checkout-link="true"]');
    if (!link) return;
    trackStandardEvent('InitiateCheckout', commonPayload({
      num_items: 1,
      source: link.dataset.checkoutSource || 'checkout_pointerdown',
    }));
  }, true);
}

window.trackQuizStart = function () {
  trackCustomEvent('QuizStart', {
    content_name: 'Kit SOS Planta Morrendo - Quiz Diagnostico',
    content_ids: [PRODUCT_ID],
  });
};

window.trackQuizAnswer = function (step) {
  trackCustomEvent('QuizAnswer', {
    content_name: 'Kit SOS Planta Morrendo - Quiz Diagnostico',
    content_ids: [PRODUCT_ID],
    quiz_step: step,
  });
};

window.trackQuizComplete = function (afterTrack) {
  trackStandardEvent('Lead', commonPayload({
    content_name: 'Kit SOS Planta Morrendo - Quiz Concluido',
  }));

  trackStandardEvent('CompleteRegistration', commonPayload({
    content_name: 'Kit SOS Planta Morrendo - Quiz Concluido',
    status: 'quiz_completed',
  }));

  trackCustomEvent('QuizComplete', {
    content_name: 'Kit SOS Planta Morrendo - Quiz Concluido',
    content_ids: [PRODUCT_ID],
  });

  setTimeout(() => {
    if (typeof afterTrack === 'function') afterTrack();
  }, 700);
};

initMetaPixel();

document.addEventListener('DOMContentLoaded', () => {
  trackViewContent();
  prepareCheckoutLinks();
  interceptCheckoutClicks();
  trackCheckoutHoverIntent();
});
