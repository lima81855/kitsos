const META_PIXEL_ID = '1805622896407631';
const CHECKOUT_URL = 'https://pay.hotmart.com/I105969372T';

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

  fbq('track', 'ViewContent', {
    content_name: context.contentName,
    content_ids: ['kit-sos-planta-morrendo'],
    content_type: 'product',
    value: 47,
    currency: 'BRL',
    page_type: context.pageType,
  });
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

function trackCheckoutIntent() {
  fbq('track', 'InitiateCheckout', {
    content_name: 'Kit SOS Planta Morrendo',
    content_ids: ['kit-sos-planta-morrendo'],
    content_type: 'product',
    value: 47,
    currency: 'BRL',
    num_items: 1,
  });
}

function prepareCheckoutLinks() {
  document.querySelectorAll(`a[href^="${CHECKOUT_URL}"]`).forEach((link) => {
    link.href = buildTrackedCheckoutUrl(link.href);

    link.addEventListener('click', () => {
      trackCheckoutIntent();
    });
  });
}

window.trackQuizStart = function () {
  fbq('trackCustom', 'QuizStart', {
    content_name: 'Kit SOS Planta Morrendo - Quiz Diagnostico',
    content_ids: ['kit-sos-planta-morrendo'],
  });
};

window.trackQuizComplete = function () {
  fbq('track', 'Lead', {
    content_name: 'Kit SOS Planta Morrendo - Quiz Concluido',
    content_ids: ['kit-sos-planta-morrendo'],
    value: 47,
    currency: 'BRL',
  });

  fbq('trackCustom', 'QuizComplete', {
    content_name: 'Kit SOS Planta Morrendo - Quiz Concluido',
    content_ids: ['kit-sos-planta-morrendo'],
  });
};

initMetaPixel();

document.addEventListener('DOMContentLoaded', () => {
  trackViewContent();
  prepareCheckoutLinks();
});
