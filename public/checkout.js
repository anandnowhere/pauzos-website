const isTest = (typeof document !== 'undefined' && document.body?.dataset?.testCheckout === 'true');
const storageKey = isTest ? 'pauzos-test-checkout' : 'pauzos-checkout';
const form = typeof document !== 'undefined' ? document.querySelector('#checkout-form') : null;
const button = typeof document !== 'undefined' ? document.querySelector('#pay-button') : null;
const statusBox = typeof document !== 'undefined' ? document.querySelector('#payment-status') : null;
const retry = typeof document !== 'undefined' ? document.querySelector('#retry-payment') : null;

let session = null, busy = false;
try { session = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}

// Current plan selection: 'annual' or 'lifetime'
let currentPlan = 'annual';
try {
  const hrefStr = typeof location !== 'undefined' ? (location.search || location.href || '') : '';
  const m = hrefStr.match(/[?&]plan=(annual|lifetime)/);
  if (m) currentPlan = m[1];
} catch {}
if (session?.plan) currentPlan = session.plan;
if (currentPlan !== 'lifetime') currentPlan = 'annual';
if (typeof window !== 'undefined') window.pauzosCurrentPlan = currentPlan;

function setCheckoutPlan(plan) {
  if (plan !== 'annual' && plan !== 'lifetime') plan = 'annual';
  currentPlan = plan;
  if (typeof window !== 'undefined') window.pauzosCurrentPlan = plan;

  if (typeof document !== 'undefined' && document.querySelectorAll) {
    document.querySelectorAll('[data-plan-tab]').forEach(tab => {
      const isTarget = tab.dataset?.planTab === plan;
      tab.classList?.toggle('active', isTarget);
      tab.setAttribute?.('aria-selected', isTarget ? 'true' : 'false');
    });

    if (typeof window !== 'undefined' && window.pauzosPrice) {
      const q = window.pauzosPrice;
      const planInfo = window.getPauzosPriceForPlan ? window.getPauzosPriceForPlan(plan) : null;
      const amount = planInfo ? planInfo.amount : (plan === 'lifetime' ? (q.lifetime?.amount || Math.round(q.amount * 2.86)) : (q.annual?.amount || q.amount));
      const nextAmount = planInfo ? planInfo.nextAmount : (plan === 'lifetime' ? (q.lifetime?.nextAmount || Math.round(q.nextAmount * 3)) : (q.annual?.nextAmount || q.nextAmount));
      const formatted = window.pauzosMoney ? window.pauzosMoney(q, amount) : '';
      const nextFormatted = window.pauzosMoney ? window.pauzosMoney(q, nextAmount) : '';

      document.querySelectorAll('[data-price]').forEach(el => {
        if (!el.closest?.('.pricing-card-lifetime') && !el.closest?.('.pricing-card-annual')) {
          el.textContent = formatted;
        }
      });

      document.querySelectorAll('[data-currency]').forEach(el => {
        el.textContent = plan === 'lifetime' ? 'one time' : '/ year';
      });

      document.querySelectorAll('[data-offer]').forEach(el => {
        el.textContent = plan === 'lifetime' 
          ? (q.phase === 'early-bird' ? 'EARLY-BIRD LIFETIME ACCESS' : 'LIFETIME ACCESS')
          : (q.phase === 'early-bird' ? 'EARLY-BIRD ANNUAL PASS' : 'ANNUAL PASS');
      });

      document.querySelectorAll('[data-license-title]').forEach(el => {
        el.textContent = plan === 'lifetime' ? 'Your lifetime license' : 'Your annual pass';
      });

      document.querySelectorAll('[data-price-schedule]').forEach(el => {
        el.textContent = q.phase === 'early-bird'
          ? `Available through 31 December 2026. ${nextFormatted} for new purchases from 1 January 2027. ${plan === 'lifetime' ? 'Pay once. Future updates included. No renewal fees.' : 'Standard 1-click renewal.'}`
          : (plan === 'lifetime' ? 'Pay once. Future updates included. No renewal fees.' : 'Standard annual subscription.');
      });

      const devicesBadge = document.querySelector('[data-plan-devices]');
      if (devicesBadge) {
        devicesBadge.textContent = plan === 'lifetime' ? '2 simultaneous logins' : '1 workstation login';
      }
    }
  }
}

function tell(message) {
  if (!statusBox) return;
  statusBox.hidden = false;
  statusBox.textContent = message;
}

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(session)); } catch {}
}

async function api(path, data) {
  const endpoint = (typeof window !== 'undefined' && window.pauzosApi)
    ? window.pauzosApi(isTest ? path.replace('/api/', '/api/test/') : path) 
    : (isTest ? path.replace('/api/', '/api/test/') : path);

  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify(data)
  });
  const value = await r.json();
  if (!r.ok) throw new Error(value.error || 'Please try again.');
  return value;
}

function finish(result) {
  tell(result.message + (result.payment_id ? ' Payment ID: ' + result.payment_id : ''));
  if (form) form.hidden = true;
  if (retry) retry.hidden = true;
  try { localStorage.removeItem(storageKey); } catch {}
  session = null;
}

async function verify({ silent = false } = {}) {
  if (!session || busy) return;
  busy = true;
  if (retry) { retry.hidden = true; retry.disabled = true; }
  if (button) button.disabled = true;

  if (silent) {
    if (statusBox) statusBox.hidden = true;
  } else {
    tell('Confirming your payment…');
  }

  try {
    const result = await api('/api/verify', session);
    if (result.success) {
      finish(result);
    } else if (session.payment_id) {
      tell('Your payment is still being confirmed. Please do not pay again. Retry confirmation shortly.');
      if (retry) retry.hidden = false;
    } else {
      if (statusBox) { statusBox.hidden = true; statusBox.textContent = ''; }
    }
  } catch (e) {
    tell(e.message + ' Please retry confirmation.');
    if (retry) retry.hidden = false;
  } finally {
    busy = false;
    if (retry) retry.disabled = false;
    if (button) button.disabled = !(typeof window !== 'undefined' && window.pauzosPrice) || !retry?.hidden;
  }
}

if (retry?.addEventListener) retry.addEventListener('click', verify);

if (session?.order_id && session?.token) {
  if (session.email && form?.elements?.namedItem('email')) form.elements.namedItem('email').value = session.email;
  if (session.name && form?.elements?.namedItem('name')) form.elements.namedItem('name').value = session.name;
  if (session.plan) setCheckoutPlan(session.plan);
  if (button) button.disabled = true;

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('DOMContentLoaded', async () => {
      await window.pauzosPriceReady;
      await verify({ silent: true });
    }, { once: true });
  }
} else {
  session = null;
}

// Plan tab click listeners
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelectorAll) {
      document.querySelectorAll('[data-plan-tab]').forEach(tab => {
        tab.addEventListener('click', () => setCheckoutPlan(tab.dataset.planTab));
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pauzos-price', () => setCheckoutPlan(currentPlan));
    }
  });
}

function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => (typeof window !== 'undefined' && window.Razorpay) ? resolve() : reject(new Error('Checkout did not load.'));
    script.onerror = () => reject(new Error('Razorpay could not load. Check your connection and try again.'));
    document.head.append(script);
  });
}

if (form?.addEventListener) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    if (button) button.disabled = true;
    tell('Preparing your secure checkout…');

    try {
      if (typeof window !== 'undefined') await window.pauzosPriceReady;
      await loadRazorpay();
      const email = form.elements.namedItem("email").value.trim();
      const name = form.elements.namedItem("name").value.trim();

      const q = typeof window !== 'undefined' ? window.pauzosPrice : null;
      if (!q) throw new Error('Price could not load. Please refresh.');

      const planInfo = window.getPauzosPriceForPlan ? window.getPauzosPriceForPlan(currentPlan) : null;
      const expectedAmount = planInfo ? planInfo.amount : (currentPlan === 'lifetime' ? (q.lifetime?.amount || Math.round(q.amount * 2.86)) : (q.annual?.amount || q.amount));

      let order;
      if (session?.order_id) {
        const existing = await api('/api/verify', session);
        if (existing.success) {
          finish(existing);
          return;
        }
        if (session.payment_id) {
          if (retry) retry.hidden = false;
          throw new Error('Your payment is still being confirmed. Do not pay again.');
        }

        const changed = session.email.toLowerCase() !== email.toLowerCase() || 
                        !session.key || 
                        session.currency !== q.currency || 
                        session.amount !== expectedAmount ||
                        (session.plan && session.plan !== currentPlan);

        if (changed) {
          if (existing.can_replace !== true) {
            throw new Error('Your earlier payment is still being checked. Please try again shortly.');
          }
          order = null;
        } else {
          order = session;
        }
      }

      if (!order) {
        order = await api('/api/order', {
          email,
          name,
          currency: q.currency,
          amount: expectedAmount,
          phase: q.phase,
          plan: currentPlan
        });
      }

      session = {
        order_id: order.order_id,
        token: order.token,
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        plan: currentPlan,
        email,
        name
      };
      save();

      if (!order.key.startsWith(isTest ? 'rzp_test_' : 'rzp_live_')) {
        throw new Error('Checkout mode mismatch. Payment stopped.');
      }

      const desc = currentPlan === 'lifetime' 
        ? 'Pauzos Lifetime Pro license (2 devices)' 
        : 'Pauzos Annual Pass license (1 device)';

      const checkout = new Razorpay({
        key: order.key,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: 'STRATEXA · Pauzos',
        description: desc,
        image: new URL('assets/logo.webp', location.href).href,
        prefill: { email, name },
        theme: { color: '#2362e8' },
        handler: async response => {
          session.payment_id = response.razorpay_payment_id;
          session.signature = response.razorpay_signature;
          save();
          busy = false;
          await verify();
        },
        modal: {
          ondismiss: () => {
            busy = false;
            void verify({ silent: true });
          }
        }
      });

      checkout.on('payment.failed', () => {
        tell('This payment attempt was unsuccessful. Close the Razorpay window to check its status automatically.');
      });

      checkout.open();
      tell('Complete your payment in the Razorpay window.');
    } catch (e) {
      tell(e.message);
    } finally {
      busy = false;
      if (button) button.disabled = !(typeof window !== 'undefined' && window.pauzosPrice) || !retry?.hidden;
    }
  });
}
