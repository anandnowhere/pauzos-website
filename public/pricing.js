(() => {
  let resolveReady;
  window.pauzosPriceReady = new Promise(r => resolveReady = r);
  const status = document.querySelector('#currency-status');

  const format = (q, amount = q.amount) => {
    return new Intl.NumberFormat(navigator.language || 'en', {
      style: 'currency',
      currency: q.currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: amount % q.divisor ? 2 : 0,
      maximumFractionDigits: 2
    }).format(amount / q.divisor);
  };
  window.pauzosMoney = format;

  async function update(currency) {
    const pay = document.querySelector('#pay-button');
    if (pay) pay.disabled = true;

    try {
      const url = window.pauzosApi 
        ? window.pauzosApi('/api/pricing' + (currency ? '?currency=' + encodeURIComponent(currency) : ''))
        : ('/api/pricing' + (currency ? '?currency=' + encodeURIComponent(currency) : ''));

      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error();
      const q = await r.json();

      // Geolocation inference (Timezone first, then Region) if server didn't specify country
      if (!currency && !q.country) {
        const zones = {
          'Asia/Calcutta': 'INR', 'Asia/Kolkata': 'INR',
          'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR',
          'Asia/Kuwait': 'KWD', 'Asia/Bahrain': 'BHD', 'Asia/Muscat': 'OMR',
          'Europe/London': 'GBP', 'Asia/Tokyo': 'JPY', 'Asia/Singapore': 'SGD'
        };
        const regions = {
          IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
          AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
          SG: 'SGD', JP: 'JPY', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR',
          NL: 'EUR', IE: 'EUR'
        };
        let inferred;
        try {
          inferred = zones[Intl.DateTimeFormat().resolvedOptions().timeZone] || 
                     regions[new Intl.Locale(navigator.language).region];
        } catch {}
        if (inferred && inferred !== q.currency) return update(inferred);
      }

      window.pauzosPrice = q;

      // Extract tier details (fallback if single-tier returned)
      const annualAmount = q.annual ? q.annual.amount : q.amount;
      const annualNext = q.annual ? q.annual.nextAmount : q.nextAmount;
      const lifetimeAmount = q.lifetime ? q.lifetime.amount : Math.round(annualAmount * 2.86);
      const lifetimeNext = q.lifetime ? q.lifetime.nextAmount : Math.round(annualNext * 3.0);

      const annualFmt = format(q, annualAmount);
      const annualNextFmt = format(q, annualNext);
      const lifetimeFmt = format(q, lifetimeAmount);
      const lifetimeNextFmt = format(q, lifetimeNext);

      // Dual-tier DOM updates
      document.querySelectorAll('[data-annual-price]').forEach(el => el.textContent = annualFmt);
      document.querySelectorAll('[data-annual-standard]').forEach(el => el.textContent = annualNextFmt);
      document.querySelectorAll('[data-annual-schedule]').forEach(el => {
        el.textContent = q.phase === 'early-bird' 
          ? `Available through 31 December 2026. ${annualNextFmt}/yr from 1 January 2027.`
          : 'Standard annual subscription.';
      });

      document.querySelectorAll('[data-lifetime-price]').forEach(el => el.textContent = lifetimeFmt);
      document.querySelectorAll('[data-lifetime-standard]').forEach(el => el.textContent = lifetimeNextFmt);
      document.querySelectorAll('[data-lifetime-schedule]').forEach(el => {
        el.textContent = q.phase === 'early-bird'
          ? `Early-bird price through 31 December 2026. ${lifetimeNextFmt} from 1 January 2027. Pay once forever.`
          : 'Pay once. All future updates included forever.';
      });

      // Default / active plan updates
      const currentPlan = window.pauzosCurrentPlan || 'annual';
      const activeAmount = currentPlan === 'lifetime' ? lifetimeAmount : annualAmount;
      const activeNext = currentPlan === 'lifetime' ? lifetimeNext : annualNext;

      document.querySelectorAll('[data-price]').forEach(el => {
        // If element is inside an annual or lifetime container, format appropriately
        if (el.closest('.pricing-card-lifetime')) {
          el.textContent = lifetimeFmt;
        } else if (el.closest('.pricing-card-annual')) {
          el.textContent = annualFmt;
        } else {
          el.textContent = format(q, activeAmount);
        }
      });

      document.querySelectorAll('[data-currency]').forEach(el => {
        el.textContent = currentPlan === 'lifetime' ? 'one time' : '/ year';
      });

      document.querySelectorAll('[data-offer]').forEach(el => {
        el.textContent = q.phase === 'early-bird' ? 'EARLY-BIRD SPECIAL' : 'WORKDAY LICENSE';
      });

      document.querySelectorAll('[data-price-schedule]').forEach(el => {
        const nextFmt = currentPlan === 'lifetime' ? lifetimeNextFmt : annualNextFmt;
        el.textContent = q.phase === 'early-bird'
          ? `Available through 31 December 2026. ${nextFmt} for new purchases from 1 January 2027.`
          : 'Transparent pricing with no unexpected price hikes.';
      });

      if (status) status.textContent = '';
      if (pay) pay.disabled = false;

      resolveReady(q);
      window.dispatchEvent(new CustomEvent('pauzos-price', { detail: q }));
    } catch {
      if (status) status.textContent = 'Pricing could not load. Refresh the page before paying.';
    }
  }

  window.getPauzosPriceForPlan = (plan = 'annual') => {
    if (!window.pauzosPrice) return null;
    const q = window.pauzosPrice;
    if (plan === 'lifetime') {
      return {
        plan: 'lifetime',
        amount: q.lifetime ? q.lifetime.amount : Math.round(q.amount * 2.86),
        nextAmount: q.lifetime ? q.lifetime.nextAmount : Math.round(q.nextAmount * 3.0),
        currency: q.currency,
        devices: 2
      };
    }
    return {
      plan: 'annual',
      amount: q.annual ? q.annual.amount : q.amount,
      nextAmount: q.annual ? q.annual.nextAmount : q.nextAmount,
      currency: q.currency,
      devices: 1
    };
  };

  update();
  window.addEventListener('pageshow', e => { if (e.persisted) update(); });
})();
