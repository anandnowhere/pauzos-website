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
          // Deactivate all cards and activate current
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

  // 3. Dual-Currency System with 100% Automatic Geolocation
  const CURRENCY_CONFIG = {
    INR: {
      code: 'INR',
      symbol: '₹',
      amount: 249,
      amountSubunit: 24900,
      strike: '₹999',
      discount: '75% OFF',
      badge: 'Launch Offer • ₹249',
      introBadge: '🎉 Introductory Launch Offer',
      periodText: 'Introductory Price • Lifetime Access',
      cta: 'Get Instant Access for ₹249',
      heroCta: 'Or get lifetime access for ₹249 (One-Time) →',
      heroTrust: 'One-Time ₹249 Lifetime Option (No SaaS Subscriptions)',
      personaStrike: '₹999',
      personaPrice: '₹249',
      urgencyNote: '<span>⚡</span> <span><strong>Introductory Price:</strong> Early-adopter pricing is locked at ₹249 before standard price increases to ₹999. Includes all future updates forever.</span>',
      modalBtn: '⚡ Pay ₹249 via Razorpay',
      modalMethods: 'UPI (GPay, PhonePe, Paytm), Cards & NetBanking',
      guaranteeNote: '<span>🇮🇳 1-Click UPI &amp; Cards via Razorpay</span> • <span>⚡ Instant Automated Verification</span> • <span>📥 Instant Lifetime Access</span>',
      footerPricing: 'Pricing (₹249 Launch Offer)'
    },
    USD: {
      code: 'USD',
      symbol: '$',
      amount: 5.00,
      amountSubunit: 500,
      strike: '$19.99',
      discount: '75% OFF',
      badge: 'Early Bird • $5.00',
      introBadge: '🎉 Early Bird Launch Offer',
      periodText: 'Early Bird Price • Lifetime Access',
      cta: 'Get Instant Access for $5.00',
      heroCta: 'Or get lifetime access for $5.00 (One-Time) →',
      heroTrust: 'One-Time $5.00 Lifetime Option (No SaaS Subscriptions)',
      personaStrike: '$19.99',
      personaPrice: '$5.00',
      urgencyNote: '<span>⚡</span> <span><strong>Early Bird Price:</strong> Early-adopter pricing is locked at $5.00 before standard price increases to $19.99. Includes all future updates forever.</span>',
      modalBtn: '⚡ Pay $5.00 via Razorpay',
      modalMethods: 'International Credit & Debit Cards (Visa, MasterCard, Amex)',
      guaranteeNote: '<span>💳 International Cards via Razorpay</span> • <span>🔒 256-Bit SSL Encrypted</span> • <span>📥 Instant Lifetime Access</span>',
      footerPricing: 'Pricing ($5.00 Early Bird)'
    }
  };

  let activeCurrency = 'USD'; // Safe international default

  function detectClientCountry() {
    try {
      const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      if (tz.includes('calcutta') || tz.includes('kolkata')) {
        return 'INR';
      }
      const lang = (navigator.language || '').toLowerCase();
      if (lang.endsWith('-in') || lang.startsWith('hi')) {
        return 'INR';
      }
    } catch (e) {}
    return 'USD';
  }

  window.setCurrency = function(currCode) {
    if (!CURRENCY_CONFIG[currCode]) return;
    activeCurrency = currCode;

    const cfg = CURRENCY_CONFIG[currCode];

    // 1. Update pricing display
    const priceSymbolEl = document.getElementById('pricingCurrencySymbol');
    const priceNumEl = document.getElementById('pricingPriceNumber');
    const strikeAmountEl = document.getElementById('pricingStrikeAmount');
    const discountPillEl = document.getElementById('pricingDiscountPill');
    const introBadgeEl = document.getElementById('pricingIntroBadge');
    const periodTextEl = document.getElementById('pricingPeriodText');
    const ctaBtnEl = document.getElementById('pricingCtaBtn');
    const urgencyNoteEl = document.getElementById('pricingUrgencyNote');
    const guaranteeNoteEl = document.getElementById('pricingGuaranteeNote');
    const heroSecondaryCtaEl = document.getElementById('heroSecondaryCta');
    const heroTrustEl = document.getElementById('heroTrustPrice');
    const personaStrikeEl = document.getElementById('personaStrikePrice');
    const personaPriceEl = document.getElementById('personaPriceVal');
    const footerPricingEl = document.getElementById('footerPricingLink');

    if (priceSymbolEl) priceSymbolEl.textContent = cfg.symbol;
    if (priceNumEl) priceNumEl.textContent = cfg.amount % 1 === 0 ? cfg.amount : cfg.amount.toFixed(2);
    if (strikeAmountEl) strikeAmountEl.textContent = cfg.strike;
    if (discountPillEl) discountPillEl.textContent = cfg.discount;
    if (introBadgeEl) introBadgeEl.textContent = cfg.introBadge;
    if (periodTextEl) periodTextEl.textContent = cfg.periodText;
    if (ctaBtnEl) ctaBtnEl.textContent = cfg.cta;
    if (urgencyNoteEl) urgencyNoteEl.innerHTML = cfg.urgencyNote;
    if (guaranteeNoteEl) guaranteeNoteEl.innerHTML = cfg.guaranteeNote;
    if (heroSecondaryCtaEl) heroSecondaryCtaEl.textContent = cfg.heroCta;
    if (heroTrustEl) heroTrustEl.textContent = cfg.heroTrust;
    if (personaStrikeEl) personaStrikeEl.textContent = cfg.personaStrike;
    if (personaPriceEl) personaPriceEl.textContent = cfg.personaPrice;
    if (footerPricingEl) footerPricingEl.textContent = cfg.footerPricing;

    // 2. Update modal texts
    const modalBadge = document.getElementById('modalHeaderBadge');
    const modalStrike = document.getElementById('modalStrikePrice');
    const modalTotal = document.getElementById('modalTotalPrice');
    const modalBtn = document.getElementById('btnRazorpayPay');
    const modalMethods = document.getElementById('razorpayPaymentMethodsText');

    if (modalBadge) modalBadge.textContent = cfg.badge;
    if (modalStrike) modalStrike.textContent = cfg.strike;
    if (modalTotal) modalTotal.textContent = `${cfg.symbol}${cfg.amount % 1 === 0 ? cfg.amount : cfg.amount.toFixed(2)}`;
    if (modalBtn) modalBtn.textContent = cfg.modalBtn;
    if (modalMethods) modalMethods.textContent = cfg.modalMethods;
  };

  // Instant local detection on page load (0ms latency)
  activeCurrency = detectClientCountry();
  window.setCurrency(activeCurrency);

  // Background IP lookup to verify true country with 100% accuracy
  function verifyGeoLocationByIP() {
    fetch('https://api.country.is/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const detected = (data.country === 'IN') ? 'INR' : 'USD';
          if (detected !== activeCurrency) {
            window.setCurrency(detected);
          }
        }
      })
      .catch(() => {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data && data.country_code) {
              const detected = (data.country_code === 'IN') ? 'INR' : 'USD';
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
  window.handleCheckout = function(productName = 'Personal Reminder Assistant') {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      const formState = document.getElementById('checkoutFormState');
      const successState = document.getElementById('checkoutSuccessState');
      const statusMsg = document.getElementById('checkoutStatusMsg');
      if (formState) formState.style.display = 'block';
      if (successState) successState.style.display = 'none';
      if (statusMsg) statusMsg.style.display = 'none';
      
      // Ensure prices match current currency
      window.setCurrency(activeCurrency);

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

  // 5. Razorpay 1-Click Checkout Engine
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

    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = 'Opening Secure Checkout...';
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: cfg.amountSubunit,
      currency: cfg.code,
      name: 'Pauzos',
      description: `Pro Lifetime License (${cfg.symbol}${cfg.amount})`,
      image: 'https://pauzos.com/assets/logo.png',
      prefill: {
        email: email
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        backdropclose: false,
        escape: true,
        ondismiss: function() {
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = cfg.modalBtn;
          }
        }
      },
      handler: async function(response) {
        await handleRazorpaySuccess(response, email, cfg);
      }
    };

    try {
      const rzpInstance = new Razorpay(options);
      rzpInstance.on('payment.failed', function(resp) {
        showStatus('Payment could not be completed: ' + (resp.error?.description || 'Please try again.'), '#ef4444', '#7f1d1d');
        if (payBtn) {
          payBtn.disabled = false;
          payBtn.textContent = cfg.modalBtn;
        }
      });
      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay open error:', err);
      showStatus('Could not launch checkout popup. Please try again.', '#ef4444', '#7f1d1d');
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.textContent = cfg.modalBtn;
      }
    }
  };

  async function handleRazorpaySuccess(response, email, cfg) {
    const paymentId = response.razorpay_payment_id;
    showStatus('Payment verified! Provisioning your lifetime workstation license...', '#34d399', '#065f46');

    try {
      // 1. Call activate_razorpay_license RPC in Supabase
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
          p_amount: cfg.amount,
          p_currency: cfg.code
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

      if (confirmedEmail) confirmedEmail.textContent = email;
      if (paymentRef) paymentRef.textContent = `Payment Reference: ${paymentId}`;
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

  // Auto-open Checkout Modal if navigated with #checkout or ?action=checkout
  if (window.location.hash === '#checkout' || new URLSearchParams(window.location.search).get('action') === 'checkout') {
    setTimeout(() => {
      if (typeof window.handleCheckout === 'function') {
        window.handleCheckout();
      }
    }, 300);
  }
});
