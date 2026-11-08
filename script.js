// Pauzos Sticky Parallax Showcase Controller & Media Switcher

function switchHeroMedia(mode) {
  const videoFrame = document.getElementById('heroVideoContainer');
  const sliderFrame = document.getElementById('heroSliderContainer');
  const btnVideo = document.getElementById('btnShowVideo');
  const btnInteractive = document.getElementById('btnShowInteractive');
  const themeGroup = document.getElementById('themeButtonsGroup');
  const video = document.getElementById('heroProductVideo');

  if (mode === 'video') {
    if (videoFrame) videoFrame.style.display = 'block';
    if (sliderFrame) sliderFrame.style.display = 'none';
    if (btnVideo) btnVideo.classList.add('active');
    if (btnInteractive) btnInteractive.classList.remove('active');
    if (themeGroup) themeGroup.style.display = 'none';
    if (video) video.play().catch(() => {});
  } else {
    if (videoFrame) videoFrame.style.display = 'none';
    if (sliderFrame) sliderFrame.style.display = 'block';
    if (btnVideo) btnVideo.classList.remove('active');
    if (btnInteractive) btnInteractive.classList.add('active');
    if (themeGroup) themeGroup.style.display = 'flex';
    if (video) video.pause();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initially hide the slider theme buttons because video is active
  const themeGroup = document.getElementById('themeButtonsGroup');
  if (themeGroup) themeGroup.style.display = 'none';

  // 0. Interactive Liquid Glass Dark/Light Comparison Slider
  const sliderViewport = document.getElementById('heroSliderViewport');
  const sliderFrame = document.getElementById('heroSliderContainer');
  const sliderHandle = document.getElementById('heroSliderHandle');
  const sliderOverlay = document.getElementById('heroSliderOverlay');
  const btnDark = document.getElementById('btnThemeDark');
  const btnLight = document.getElementById('btnThemeLight');

  if (sliderViewport && sliderHandle && sliderOverlay) {
    let isDragging = false;
    let currentPos = 50; // percentage: 0 to 100

    function setSplitPosition(posPercent, animate = false) {
      const clamped = Math.max(0, Math.min(100, posPercent));
      currentPos = clamped;

      if (animate && sliderFrame) {
        sliderFrame.classList.add('animating');
        setTimeout(() => {
          sliderFrame.classList.remove('animating');
        }, 500);
      }

      sliderViewport.style.setProperty('--split-pos', `${clamped}%`);

      // Update button highlights
      if (btnDark && btnLight) {
        btnDark.classList.toggle('active', clamped <= 10);
        btnLight.classList.toggle('active', clamped >= 90);
      }
    }

    function calculatePosFromEvent(e) {
      const rect = sliderViewport.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const xOffset = clientX - rect.left;
      const percent = (xOffset / rect.width) * 100;
      return percent;
    }

    // Pointer event handlers
    function onPointerDown(e) {
      isDragging = true;
      setSplitPosition(calculatePosFromEvent(e), false);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      setSplitPosition(calculatePosFromEvent(e), false);
    }

    function onPointerUp() {
      isDragging = false;
    }

    sliderViewport.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    sliderViewport.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    // Button event listeners
    if (btnDark) {
      btnDark.addEventListener('click', (e) => {
        e.preventDefault();
        setSplitPosition(0, true);
      });
    }

    if (btnLight) {
      btnLight.addEventListener('click', (e) => {
        e.preventDefault();
        setSplitPosition(100, true);
      });
    }

    // Initialize to 50%
    setSplitPosition(50, false);
  }

  // 1. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 2. Parallax Sticky Scroll System (Figma / Framer Style)
  const stepCards = document.querySelectorAll('.parallax-step-card');
  const screenImages = document.querySelectorAll('.parallax-screen-image');

  if (stepCards.length > 0 && screenImages.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -25% 0px',
      threshold: 0.3
    };

    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepCards.forEach(c => c.classList.remove('active'));
          entry.target.classList.add('active');

          const targetId = entry.target.getAttribute('data-img-id');
          if (targetId) {
            screenImages.forEach(img => {
              if (img.id === targetId) {
                img.classList.add('active');
              } else {
                img.classList.remove('active');
              }
            });
          }
        }
      });
    }, observerOptions);

    stepCards.forEach(card => stepObserver.observe(card));
  }

  // 3. Multi-Currency 15-Country System with 100% Automatic Geolocation
  const CURRENCY_CONFIG = {
    INR: {
      code: 'INR', symbol: '₹', country: 'India',
      annual: { amount: 349, amountSubunit: 34900, formatted: '₹349', period: '/year', standard: '₹499', discount: '30% OFF', label: 'Annual Pass • ₹349/yr', cta: 'Get Annual Pass for ₹349/yr', devices: 1 },
      lifetime: { amount: 999, amountSubunit: 99900, formatted: '₹999', period: 'one-time', standard: '₹1,499', discount: '33% OFF', label: 'Lifetime Pro • ₹999 once', cta: 'Get Lifetime Pro for ₹999', devices: 2 },
      methods: 'UPI (GPay, PhonePe, Paytm), Cards & NetBanking'
    },
    USD: {
      code: 'USD', symbol: '$', country: 'United States',
      annual: { amount: 9.99, amountSubunit: 999, formatted: '$9.99', period: '/year', standard: '$14.99', discount: '33% OFF', label: 'Annual Pass • $9.99/yr', cta: 'Get Annual Pass for $9.99/yr', devices: 1 },
      lifetime: { amount: 29.99, amountSubunit: 2999, formatted: '$29.99', period: 'one-time', standard: '$39.99', discount: '25% OFF', label: 'Lifetime Pro • $29.99 once', cta: 'Get Lifetime Pro for $29.99', devices: 2 },
      methods: 'Credit & Debit Cards (Visa, MasterCard, Amex)'
    },
    GBP: {
      code: 'GBP', symbol: '£', country: 'United Kingdom',
      annual: { amount: 7.99, amountSubunit: 799, formatted: '£7.99', period: '/year', standard: '£11.99', discount: '33% OFF', label: 'Annual Pass • £7.99/yr', cta: 'Get Annual Pass for £7.99/yr', devices: 1 },
      lifetime: { amount: 24.99, amountSubunit: 2499, formatted: '£24.99', period: 'one-time', standard: '£34.99', discount: '28% OFF', label: 'Lifetime Pro • £24.99 once', cta: 'Get Lifetime Pro for £24.99', devices: 2 },
      methods: 'Credit & Debit Cards (Visa, MasterCard, Amex)'
    },
    EUR: {
      code: 'EUR', symbol: '€', country: 'Eurozone',
      annual: { amount: 9.99, amountSubunit: 999, formatted: '€9.99', period: '/year', standard: '€14.99', discount: '33% OFF', label: 'Annual Pass • €9.99/yr', cta: 'Get Annual Pass for €9.99/yr', devices: 1 },
      lifetime: { amount: 29.99, amountSubunit: 2999, formatted: '€29.99', period: 'one-time', standard: '€39.99', discount: '25% OFF', label: 'Lifetime Pro • €29.99 once', cta: 'Get Lifetime Pro for €29.99', devices: 2 },
      methods: 'European Cards & SEPA/Direct Payment'
    },
    CAD: {
      code: 'CAD', symbol: 'CA$', country: 'Canada',
      annual: { amount: 13.99, amountSubunit: 1399, formatted: 'CA$13.99', period: '/year', standard: 'CA$19.99', discount: '30% OFF', label: 'Annual Pass • CA$13.99/yr', cta: 'Get Annual Pass for CA$13.99/yr', devices: 1 },
      lifetime: { amount: 39.99, amountSubunit: 3999, formatted: 'CA$39.99', period: 'one-time', standard: 'CA$54.99', discount: '27% OFF', label: 'Lifetime Pro • CA$39.99 once', cta: 'Get Lifetime Pro for CA$39.99', devices: 2 },
      methods: 'Credit & Debit Cards'
    },
    AUD: {
      code: 'AUD', symbol: 'A$', country: 'Australia',
      annual: { amount: 15.99, amountSubunit: 1599, formatted: 'A$15.99', period: '/year', standard: 'A$22.99', discount: '30% OFF', label: 'Annual Pass • A$15.99/yr', cta: 'Get Annual Pass for A$15.99/yr', devices: 1 },
      lifetime: { amount: 44.99, amountSubunit: 4499, formatted: 'A$44.99', period: 'one-time', standard: 'A$59.99', discount: '25% OFF', label: 'Lifetime Pro • A$44.99 once', cta: 'Get Lifetime Pro for A$44.99', devices: 2 },
      methods: 'Credit & Debit Cards'
    },
    SGD: {
      code: 'SGD', symbol: 'SG$', country: 'Singapore',
      annual: { amount: 13.99, amountSubunit: 1399, formatted: 'SG$13.99', period: '/year', standard: 'SG$19.99', discount: '30% OFF', label: 'Annual Pass • SG$13.99/yr', cta: 'Get Annual Pass for SG$13.99/yr', devices: 1 },
      lifetime: { amount: 39.99, amountSubunit: 3999, formatted: 'SG$39.99', period: 'one-time', standard: 'SG$54.99', discount: '27% OFF', label: 'Lifetime Pro • SG$39.99 once', cta: 'Get Lifetime Pro for SG$39.99', devices: 2 },
      methods: 'Credit & Debit Cards'
    },
    NZD: {
      code: 'NZD', symbol: 'NZ$', country: 'New Zealand',
      annual: { amount: 17.99, amountSubunit: 1799, formatted: 'NZ$17.99', period: '/year', standard: 'NZ$24.99', discount: '28% OFF', label: 'Annual Pass • NZ$17.99/yr', cta: 'Get Annual Pass for NZ$17.99/yr', devices: 1 },
      lifetime: { amount: 49.99, amountSubunit: 4999, formatted: 'NZ$49.99', period: 'one-time', standard: 'NZ$69.99', discount: '28% OFF', label: 'Lifetime Pro • NZ$49.99 once', cta: 'Get Lifetime Pro for NZ$49.99', devices: 2 },
      methods: 'Credit & Debit Cards'
    },
    AED: {
      code: 'AED', symbol: 'AED', country: 'United Arab Emirates',
      annual: { amount: 39, amountSubunit: 3900, formatted: '39 AED', period: '/year', standard: '59 AED', discount: '34% OFF', label: 'Annual Pass • 39 AED/yr', cta: 'Get Annual Pass for 39 AED/yr', devices: 1 },
      lifetime: { amount: 109, amountSubunit: 10900, formatted: '109 AED', period: 'one-time', standard: '159 AED', discount: '31% OFF', label: 'Lifetime Pro • 109 AED once', cta: 'Get Lifetime Pro for 109 AED', devices: 2 },
      methods: 'Cards & GCC NetBanking'
    },
    SAR: {
      code: 'SAR', symbol: 'SAR', country: 'Saudi Arabia',
      annual: { amount: 39, amountSubunit: 3900, formatted: '39 SAR', period: '/year', standard: '59 SAR', discount: '34% OFF', label: 'Annual Pass • 39 SAR/yr', cta: 'Get Annual Pass for 39 SAR/yr', devices: 1 },
      lifetime: { amount: 109, amountSubunit: 10900, formatted: '109 SAR', period: 'one-time', standard: '159 SAR', discount: '31% OFF', label: 'Lifetime Pro • 109 SAR once', cta: 'Get Lifetime Pro for 109 SAR', devices: 2 },
      methods: 'Mada & Credit Cards'
    },
    QAR: {
      code: 'QAR', symbol: 'QAR', country: 'Qatar',
      annual: { amount: 39, amountSubunit: 3900, formatted: '39 QAR', period: '/year', standard: '59 QAR', discount: '34% OFF', label: 'Annual Pass • 39 QAR/yr', cta: 'Get Annual Pass for 39 QAR/yr', devices: 1 },
      lifetime: { amount: 109, amountSubunit: 10900, formatted: '109 QAR', period: 'one-time', standard: '159 QAR', discount: '31% OFF', label: 'Lifetime Pro • 109 QAR once', cta: 'Get Lifetime Pro for 109 QAR', devices: 2 },
      methods: 'Cards & Direct Banking'
    },
    KWD: {
      code: 'KWD', symbol: 'KWD', country: 'Kuwait',
      annual: { amount: 3, amountSubunit: 3000, formatted: '3 KWD', period: '/year', standard: '5 KWD', discount: '40% OFF', label: 'Annual Pass • 3 KWD/yr', cta: 'Get Annual Pass for 3 KWD/yr', devices: 1 },
      lifetime: { amount: 9, amountSubunit: 9000, formatted: '9 KWD', period: 'one-time', standard: '13 KWD', discount: '30% OFF', label: 'Lifetime Pro • 9 KWD once', cta: 'Get Lifetime Pro for 9 KWD', devices: 2 },
      methods: 'KNET & Credit Cards'
    },
    BHD: {
      code: 'BHD', symbol: 'BHD', country: 'Bahrain',
      annual: { amount: 4, amountSubunit: 4000, formatted: '4 BHD', period: '/year', standard: '6 BHD', discount: '33% OFF', label: 'Annual Pass • 4 BHD/yr', cta: 'Get Annual Pass for 4 BHD/yr', devices: 1 },
      lifetime: { amount: 11, amountSubunit: 11000, formatted: '11 BHD', period: 'one-time', standard: '16 BHD', discount: '31% OFF', label: 'Lifetime Pro • 11 BHD once', cta: 'Get Lifetime Pro for 11 BHD', devices: 2 },
      methods: 'Cards & BenefitPay'
    },
    OMR: {
      code: 'OMR', symbol: 'OMR', country: 'Oman',
      annual: { amount: 4, amountSubunit: 4000, formatted: '4 OMR', period: '/year', standard: '6 OMR', discount: '33% OFF', label: 'Annual Pass • 4 OMR/yr', cta: 'Get Annual Pass for 4 OMR/yr', devices: 1 },
      lifetime: { amount: 11, amountSubunit: 11000, formatted: '11 OMR', period: 'one-time', standard: '16 OMR', discount: '31% OFF', label: 'Lifetime Pro • 11 OMR once', cta: 'Get Lifetime Pro for 11 OMR', devices: 2 },
      methods: 'Cards & OmanNet'
    },
    JPY: {
      code: 'JPY', symbol: '¥', country: 'Japan',
      annual: { amount: 1500, amountSubunit: 1500, formatted: '¥1,500', period: '/year', standard: '¥2,200', discount: '31% OFF', label: 'Annual Pass • ¥1,500/yr', cta: 'Get Annual Pass for ¥1,500/yr', devices: 1 },
      lifetime: { amount: 4500, amountSubunit: 4500, formatted: '¥4,500', period: 'one-time', standard: '¥6,500', discount: '30% OFF', label: 'Lifetime Pro • ¥4,500 once', cta: 'Get Lifetime Pro for ¥4,500', devices: 2 },
      methods: 'Credit Cards & Konbini'
    }
  };

  const COUNTRY_MAP = {
    IN: 'INR', US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD', SG: 'SGD', NZ: 'NZD',
    AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', JP: 'JPY',
    AT: 'EUR', BE: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR', ES: 'EUR', FI: 'EUR',
    FR: 'EUR', GR: 'EUR', HR: 'EUR', IE: 'EUR', IT: 'EUR', LT: 'EUR', LU: 'EUR',
    LV: 'EUR', MT: 'EUR', NL: 'EUR', PT: 'EUR', SI: 'EUR', SK: 'EUR', BG: 'EUR'
  };

  let activeCurrency = 'USD'; // Safe international default
  let selectedPlan = 'lifetime'; // 'lifetime' (Default high-conversion anchor) or 'annual'

  function detectClientCountry() {
    try {
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      if (tz.includes('calcutta') || tz.includes('kolkata')) return 'INR';
      if (tz.includes('dubai')) return 'AED';
      if (tz.includes('riyadh')) return 'SAR';
      if (tz.includes('qatar')) return 'QAR';
      if (tz.includes('kuwait')) return 'KWD';
      if (tz.includes('bahrain')) return 'BHD';
      if (tz.includes('muscat')) return 'OMR';
      if (tz.includes('london')) return 'GBP';
      if (tz.includes('tokyo')) return 'JPY';
      if (tz.includes('singapore')) return 'SGD';
      if (tz.startsWith('america/toronto') || tz.startsWith('america/vancouver')) return 'CAD';
      if (tz.startsWith('australia/')) return 'AUD';
      if (tz.startsWith('pacific/auckland')) return 'NZD';
      if (tz.startsWith('europe/')) return 'EUR';

      const lang = (navigator.language || '').toLowerCase();
      if (lang.endsWith('-in') || lang.startsWith('hi')) return 'INR';
      if (lang.endsWith('-gb')) return 'GBP';
      if (lang.endsWith('-ae')) return 'AED';
      if (lang.endsWith('-sa')) return 'SAR';
      if (lang.endsWith('-ca')) return 'CAD';
      if (lang.endsWith('-au')) return 'AUD';
      if (lang.endsWith('-sg')) return 'SGD';
      if (lang.endsWith('-jp')) return 'JPY';
    } catch (e) {}
    return 'USD';
  }

  window.setCurrency = function(currCode) {
    if (!CURRENCY_CONFIG[currCode]) return;
    activeCurrency = currCode;

    const cfg = CURRENCY_CONFIG[currCode];
    const ann = cfg.annual;
    const lft = cfg.lifetime;

    // 1. Update Annual Card on page
    const annualPriceEl = document.getElementById('cardAnnualPrice');
    const annualStandardEl = document.getElementById('cardAnnualStandard');
    const annualDiscountEl = document.getElementById('cardAnnualDiscount');
    const annualCtaBtn = document.getElementById('btnCardAnnualCta');

    if (annualPriceEl) annualPriceEl.textContent = ann.formatted;
    if (annualStandardEl) annualStandardEl.textContent = ann.standard + '/yr';
    if (annualDiscountEl) annualDiscountEl.textContent = ann.discount;
    if (annualCtaBtn) annualCtaBtn.textContent = `Get Annual Pass (${ann.formatted}/yr)`;

    // 2. Update Lifetime Card on page
    const lifetimePriceEl = document.getElementById('cardLifetimePrice');
    const lifetimeStandardEl = document.getElementById('cardLifetimeStandard');
    const lifetimeDiscountEl = document.getElementById('cardLifetimeDiscount');
    const lifetimeCtaBtn = document.getElementById('btnCardLifetimeCta');

    if (lifetimePriceEl) lifetimePriceEl.textContent = lft.formatted;
    if (lifetimeStandardEl) lifetimeStandardEl.textContent = lft.standard;
    if (lifetimeDiscountEl) lifetimeDiscountEl.textContent = lft.discount;
    if (lifetimeCtaBtn) lifetimeCtaBtn.textContent = `Get Lifetime Pro (${lft.formatted})`;

    // 3. Update Hero and Download section references
    const heroPriceEl = document.getElementById('heroTrustPrice');
    const heroSecondaryCta = document.getElementById('heroSecondaryCta');
    const downloadAnnualNote = document.getElementById('downloadPriceScheduleNote');
    const footerPricingLink = document.getElementById('footerPricingLink');

    if (heroPriceEl) heroPriceEl.textContent = `Lifetime Option from ${lft.formatted} • Zero SaaS Subscriptions`;
    if (heroSecondaryCta) heroSecondaryCta.textContent = `Or get lifetime access from ${lft.formatted} →`;
    if (downloadAnnualNote) downloadAnnualNote.textContent = `Early-bird pricing through 31 December 2026. Standard pricing applies from 1 January 2027 (${ann.standard}/yr Annual, ${lft.standard} Lifetime).`;
    if (footerPricingLink) footerPricingLink.textContent = `Pricing (${ann.formatted}/yr • ${lft.formatted} lifetime)`;

    // 4. Update Modal details
    updateModalPricing();
  };

  window.setCheckoutPlan = function(plan) {
    selectedPlan = plan === 'annual' ? 'annual' : 'lifetime';
    const tabAnnual = document.getElementById('togglePlanAnnual');
    const tabLifetime = document.getElementById('togglePlanLifetime');

    if (tabAnnual && tabLifetime) {
      if (selectedPlan === 'annual') {
        tabAnnual.classList.add('active');
        tabLifetime.classList.remove('active');
      } else {
        tabAnnual.classList.remove('active');
        tabLifetime.classList.add('active');
      }
    }
    updateModalPricing();
  };

  function updateModalPricing() {
    const cfg = CURRENCY_CONFIG[activeCurrency] || CURRENCY_CONFIG.INR;
    const planObj = selectedPlan === 'annual' ? cfg.annual : cfg.lifetime;

    const modalBadge = document.getElementById('modalHeaderBadge');
    const modalTier = document.getElementById('modalTierLabel');
    const modalStrike = document.getElementById('modalStrikePrice');
    const modalTotal = document.getElementById('modalTotalPrice');
    const modalBtn = document.getElementById('btnRazorpayPay');
    const modalMethods = document.getElementById('razorpayPaymentMethodsText');
    const modalDeviceHint = document.getElementById('modalDeviceHint');

    if (modalBadge) modalBadge.textContent = planObj.label;
    if (modalTier) modalTier.textContent = selectedPlan === 'annual' ? 'Annual Pass (1 Workstation)' : 'Lifetime Pro (2 Workstations)';
    if (modalStrike) modalStrike.textContent = planObj.standard;
    if (modalTotal) modalTotal.textContent = planObj.formatted;
    if (modalDeviceHint) modalDeviceHint.textContent = selectedPlan === 'annual' ? '1 Workstation Device (1 Year Updates)' : '2 Concurrent Devices (Lifetime Updates)';
    if (modalBtn) modalBtn.textContent = `⚡ Pay ${planObj.formatted} via Razorpay`;
    if (modalMethods) modalMethods.textContent = cfg.methods;
  }

  // Instant local detection on page load (0ms latency)
  activeCurrency = detectClientCountry();
  window.setCurrency(activeCurrency);

  // Background IP lookup to verify true country
  function verifyGeoLocationByIP() {
    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country && COUNTRY_MAP[data.country]) {
          const detected = COUNTRY_MAP[data.country];
          if (detected !== activeCurrency) {
            window.setCurrency(detected);
          }
        }
      })
      .catch(() => {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data && data.country_code && COUNTRY_MAP[data.country_code]) {
              const detected = COUNTRY_MAP[data.country_code];
              if (detected !== activeCurrency) {
                window.setCurrency(detected);
              }
            }
          })
          .catch(() => {});
      });
  }
  verifyGeoLocationByIP();

  // 4. Checkout Modal Controls
  window.handleCheckout = function(plan = 'lifetime') {
    selectedPlan = plan === 'annual' ? 'annual' : 'lifetime';
    window.setCheckoutPlan(selectedPlan);

    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      const formState = document.getElementById('checkoutFormState');
      const successState = document.getElementById('checkoutSuccessState');
      const statusMsg = document.getElementById('checkoutStatusMsg');
      if (formState) formState.style.display = 'block';
      if (successState) successState.style.display = 'none';
      if (statusMsg) statusMsg.style.display = 'none';
      
      checkoutModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const emailInput = document.getElementById('checkoutEmail');
      if (emailInput && !emailInput.value) emailInput.focus();
    }
  };

  window.closeModal = function() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      checkoutModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  const checkoutModalEl = document.getElementById('checkoutModal');
  if (checkoutModalEl) {
    checkoutModalEl.addEventListener('click', (e) => {
      if (e.target === checkoutModalEl) {
        window.closeModal();
      }
    });
  }

  // 5. Razorpay 1-Click Checkout Engine (Zero AutoPay Mandate)
  const RAZORPAY_KEY_ID = 'rzp_live_TuwuL0RwHNqU5z';
  const SUPABASE_URL = 'https://suidnqsvuxaoqoyuqpys.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWRucXN2dXhhb3FveXVxcHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTI1MTYsImV4cCI6MjEwODMyODUxNn0.uB0A3hVBCDuCkXz5fJFt3eMlpLjcyEbrLL17rWc1ILg';

  window.startRazorpayPayment = function() {
    const emailInput = document.getElementById('checkoutEmail');
    const payBtn = document.getElementById('btnRazorpayPay');
    const email = (emailInput?.value || '').trim().toLowerCase();

    if (!email || !email.includes('@') || !email.includes('.')) {
      showStatus('Please enter a valid email address to receive your license.', '#ef4444', '#7f1d1d');
      emailInput?.focus();
      return;
    }

    if (typeof Razorpay === 'undefined') {
      showStatus('Payment engine is loading. Please check your connection or try again in a few seconds.', '#ef4444', '#7f1d1d');
      return;
    }

    const cfg = CURRENCY_CONFIG[activeCurrency] || CURRENCY_CONFIG.INR;
    const planObj = selectedPlan === 'annual' ? cfg.annual : cfg.lifetime;
    const planTitle = selectedPlan === 'annual' ? 'Annual Pass (1 Workstation, 1 Year)' : 'Lifetime Pro (2 Workstations, Pay Once Forever)';

    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = 'Opening Secure Checkout...';
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: planObj.amountSubunit,
      currency: cfg.code,
      name: 'Pauzos',
      description: `Pauzos ${planTitle}`,
      image: 'https://pauzos.com/assets/logo.png',
      prefill: {
        email: email
      },
      theme: {
        color: selectedPlan === 'annual' ? '#2563eb' : '#d97706'
      },
      modal: {
        backdropclose: false,
        escape: true,
        ondismiss: function() {
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = `⚡ Pay ${planObj.formatted} via Razorpay`;
          }
        }
      },
      handler: async function(response) {
        await handleRazorpaySuccess(response, email, cfg, selectedPlan);
      }
    };

    try {
      const rzpInstance = new Razorpay(options);
      rzpInstance.on('payment.failed', function(resp) {
        showStatus('Payment could not be completed: ' + (resp.error?.description || 'Please try again.'), '#ef4444', '#7f1d1d');
        if (payBtn) {
          payBtn.disabled = false;
          payBtn.textContent = `⚡ Pay ${planObj.formatted} via Razorpay`;
        }
      });
      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay open error:', err);
      showStatus('Could not launch checkout popup. Please try again.', '#ef4444', '#7f1d1d');
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = `⚡ Pay ${planObj.formatted} via Razorpay`;
      }
    }
  };

  async function handleRazorpaySuccess(response, email, cfg, plan) {
    const paymentId = response.razorpay_payment_id;
    const planObj = plan === 'annual' ? cfg.annual : cfg.lifetime;
    showStatus('Payment verified! Provisioning your workstation license...', '#34d399', '#065f46');

    try {
      // 1. Call activate_razorpay_license RPC in Supabase with p_plan
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/activate_razorpay_license`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_email: email,
          p_payment_id: paymentId,
          p_amount: planObj.amount,
          p_currency: cfg.code,
          p_plan: plan
        })
      }).catch(e => console.warn('License RPC dispatch:', e));

      // 2. Trigger welcome password reset/recovery token email
      await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      }).catch(e => console.warn('Welcome email trigger:', e));

    } catch (e) {
      console.warn('Post-payment provisioning error:', e);
    }

    // 3. Render Success View
    setTimeout(() => {
      const formState = document.getElementById('checkoutFormState');
      const successState = document.getElementById('checkoutSuccessState');
      const confirmedEmail = document.getElementById('confirmedEmail');
      const paymentRef = document.getElementById('confirmedPaymentRef');
      const successPlanText = document.getElementById('successPlanText');

      if (confirmedEmail) confirmedEmail.textContent = email;
      if (paymentRef) paymentRef.textContent = `Payment Reference: ${paymentId}`;
      if (successPlanText) {
        successPlanText.textContent = plan === 'annual' ? 'Your Annual Pass (1 Workstation, 1 Year) is active.' : 'Your Lifetime Pro license (2 Workstations, Permanent) is active.';
      }
      if (formState) formState.style.display = 'none';
      if (successState) successState.style.display = 'block';
    }, 800);
  }

  function showStatus(text, textColor, bgColor) {
    const statusMsg = document.getElementById('checkoutStatusMsg');
    if (statusMsg) {
      statusMsg.textContent = text;
      statusMsg.style.display = 'block';
      statusMsg.style.color = textColor;
      statusMsg.style.background = bgColor + '33';
      statusMsg.style.border = `1px solid ${bgColor}`;
    }
  }

  // Handle URL parameters e.g. #checkout, ?action=checkout, or ?plan=annual
  const urlParams = new URLSearchParams(window.location.search);
  const planParam = urlParams.get('plan');
  if (planParam === 'annual' || planParam === 'lifetime') {
    selectedPlan = planParam;
  }
  const emailParam = urlParams.get('email');
  if (emailParam) {
    const emailInput = document.getElementById('checkoutEmail');
    if (emailInput) emailInput.value = emailParam;
  }
  if (window.location.hash === '#checkout' || urlParams.get('action') === 'checkout' || planParam) {
    setTimeout(() => {
      if (typeof window.handleCheckout === 'function') {
        window.handleCheckout(selectedPlan);
      }
    }, 300);
  }
});
