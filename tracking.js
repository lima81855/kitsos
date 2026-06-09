const META_PIXEL_ID = '1805622896407631';
const TRACKING_API_URL = 'https://setoe-tracking-production.up.railway.app/api/meta/events';
const CHECKOUT_URL = 'https://pay.hotmart.com/I105969372T?checkoutMode=10';
const PRODUCT_ID = '7801051';
const PRODUCT_VALUE = 37;
const CURRENCY = 'BRL';
const STANDARD_EVENT_DEDUPE_MS = 1500;
const EXTERNAL_ID_KEY = 'kitsos_external_id';
const EXTERNAL_ID_COOKIE = '_kitsos_eid';
const recentStandardEvents = new Map();

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

  fbq('init', META_PIXEL_ID, {
    external_id: getOrCreateExternalId(),
  });
  trackStandardEvent('PageView', {
    content_name: 'Kit SOS Plantas Morrendo',
    content_ids: [PRODUCT_ID],
    content_type: 'product',
  });
}

function hasFbq() {
  return typeof window.fbq === 'function';
}

function trackStandardEvent(eventName, payload = {}) {
  if (!hasFbq()) return;
  if (wasStandardEventRecentlyTracked(eventName, payload)) return;
  const eventId = buildEventId(eventName);
  fbq('track', eventName, payload, { eventID: eventId });
  sendServerEvent(eventName, payload, eventId);
}

function trackCustomEvent(eventName, payload = {}) {
  if (!hasFbq()) return;
  fbq('trackCustom', eventName, payload);
}

function commonPayload(extra = {}) {
  return {
    content_name: 'Kit SOS Plantas Morrendo',
    content_ids: [PRODUCT_ID],
    content_type: 'product',
    value: PRODUCT_VALUE,
    currency: CURRENCY,
    ...extra,
  };
}

function standardEventKey(eventName, payload) {
  return [
    eventName,
    payload.content_name || '',
    payload.source || '',
    payload.status || '',
  ].join('|');
}

function wasStandardEventRecentlyTracked(eventName, payload) {
  const now = Date.now();
  const key = standardEventKey(eventName, payload);
  const lastTrackedAt = recentStandardEvents.get(key) || 0;

  if (now - lastTrackedAt < STANDARD_EVENT_DEDUPE_MS) {
    return true;
  }

  recentStandardEvents.set(key, now);
  return false;
}

function trackCheckoutButtonClick(source) {
  trackCustomEvent('CheckoutButtonClick', commonPayload({
    destination: 'hotmart',
    source,
  }));
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function getFbp() {
  return getCookie('_fbp');
}

function getFbc() {
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  const cookieValue = getCookie('_fbc');
  if (!fbclid) return cookieValue || '';

  if (cookieValue && cookieValue.endsWith('.' + fbclid)) {
    return cookieValue;
  }

  const fbc = 'fb.1.' + Date.now() + '.' + fbclid;
  document.cookie = '_fbc=' + encodeURIComponent(fbc) + '; path=/; max-age=7776000; SameSite=Lax; Secure';
  return fbc;
}

function buildVisitorId() {
  const randomPart = window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

  return 'kitsos-visitor-' + randomPart;
}

function getOrCreateExternalId() {
  let externalId = getCookie(EXTERNAL_ID_COOKIE);

  try {
    externalId = externalId || window.localStorage.getItem(EXTERNAL_ID_KEY) || '';
  } catch (_) {
    externalId = externalId || '';
  }

  if (!externalId) {
    externalId = buildVisitorId();
  }

  try {
    window.localStorage.setItem(EXTERNAL_ID_KEY, externalId);
  } catch (_) {}

  document.cookie = EXTERNAL_ID_COOKIE + '=' + encodeURIComponent(externalId) + '; path=/; max-age=15552000; SameSite=Lax; Secure';

  return externalId;
}

function buildEventId(eventName) {
  const randomPart = window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

  return 'kitsos-' + eventName + '-' + randomPart;
}

function normalizeServerPayload(payload) {
  return {
    value: typeof payload.value === 'number' ? payload.value : undefined,
    currency: payload.currency || CURRENCY,
    contentName: payload.content_name || payload.contentName || 'Kit SOS Plantas Morrendo',
    contentIds: Array.isArray(payload.content_ids) ? payload.content_ids : [PRODUCT_ID],
  };
}

function sendServerEvent(eventName, payload, eventId) {
  const allowedEvents = ['PageView', 'ViewContent', 'InitiateCheckout', 'Lead', 'CompleteRegistration'];
  if (!allowedEvents.includes(eventName)) return;

  const serverPayload = normalizeServerPayload(payload);
  const body = {
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    externalId: getOrCreateExternalId(),
    fbp: getFbp(),
    fbc: getFbc(),
    testEventCode: new URLSearchParams(window.location.search).get('test_event_code') || undefined,
    value: serverPayload.value,
    currency: serverPayload.currency,
    contentName: serverPayload.contentName,
    contentIds: serverPayload.contentIds,
  };

  const serialized = JSON.stringify(body);

  fetch(TRACKING_API_URL, {
    method: 'POST',
    mode: 'cors',
    headers: { 'content-type': 'application/json' },
    body: serialized,
    keepalive: true,
  }).catch(() => {});
}

function getPageContext() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('vendas') || path === '/' || path.endsWith('/index.html')) {
    return {
      pageType: 'sales_page',
      contentName: 'Kit SOS Plantas Morrendo - Pagina de Venda',
    };
  }

  return {
    pageType: 'quiz',
    contentName: 'Kit SOS Plantas Morrendo - Quiz Diagnostico',
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

  if (!target.searchParams.has('external_id')) {
    target.searchParams.set('external_id', getOrCreateExternalId());
  }

  const fbp = getFbp();
  if (fbp && !target.searchParams.has('fbp')) {
    target.searchParams.set('fbp', fbp);
  }

  const fbc = getFbc();
  if (fbc && !target.searchParams.has('fbc')) {
    target.searchParams.set('fbc', fbc);
  }

  return target.toString();
}

let lastCheckoutIntentAt = 0;

function trackCheckoutIntent(source = 'checkout_cta', options = {}) {
  const now = Date.now();
  const shouldTrackStandardIntent = now - lastCheckoutIntentAt >= STANDARD_EVENT_DEDUPE_MS;

  if (shouldTrackStandardIntent) {
    lastCheckoutIntentAt = now;
    trackStandardEvent('InitiateCheckout', commonPayload({
      num_items: 1,
      source,
    }));
  }

  if (options.includeButtonClick !== false) {
    trackCheckoutButtonClick(source);
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
    trackCheckoutIntent(link.dataset.checkoutSource || 'checkout_pointerdown', { includeButtonClick: false });
  }, true);
}

window.trackQuizStart = function () {
  trackCustomEvent('QuizStart', {
    content_name: 'Kit SOS Plantas Morrendo - Quiz Diagnostico',
    content_ids: [PRODUCT_ID],
  });
};

window.trackQuizAnswer = function (step) {
  trackCustomEvent('QuizAnswer', {
    content_name: 'Kit SOS Plantas Morrendo - Quiz Diagnostico',
    content_ids: [PRODUCT_ID],
    quiz_step: step,
  });
};

window.trackQuizComplete = function (afterTrack) {
  trackStandardEvent('Lead', commonPayload({
    content_name: 'Kit SOS Plantas Morrendo - Quiz Concluido',
  }));

  trackStandardEvent('CompleteRegistration', commonPayload({
    content_name: 'Kit SOS Plantas Morrendo - Quiz Concluido',
    status: 'quiz_completed',
  }));

  trackCustomEvent('QuizComplete', {
    content_name: 'Kit SOS Plantas Morrendo - Quiz Concluido',
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
