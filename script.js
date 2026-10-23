// Pauzos Sticky Parallax Showcase Controller

document.addEventListener('DOMContentLoaded', () => {
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

  // 3. Checkout Modal Trigger
  window.handleCheckout = function(productName = 'Personal Reminder Assistant') {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      // Reset view to form state
      const formState = document.getElementById('checkoutFormState');
      const successState = document.getElementById('checkoutSuccessState');
      const statusMsg = document.getElementById('checkoutStatusMsg');
      if (formState) formState.style.display = 'block';
      if (successState) successState.style.display = 'none';
      if (statusMsg) statusMsg.style.display = 'none';
      checkoutModal.style.display = 'flex';
    } else {
      alert('Connecting to secure checkout for ' + productName + ' (₹249)...');
    }
  };

  window.closeModal = function() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
      checkoutModal.style.display = 'none';
      if (verifyPollTimer) clearTimeout(verifyPollTimer);
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

  // 4. UPI ID Clipboard Copy
  window.copyUpiId = function() {
    const upiId = 'anandnowhere-2@okaxis';
    navigator.clipboard.writeText(upiId).then(() => {
      const btn = document.getElementById('btnCopyUpi');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    }).catch(() => {
      prompt('Copy UPI ID:', upiId);
    });
  };

  // 5. Automated UPI License Verification Engine
  const SUPABASE_URL = 'https://suidnqsvuxaoqoyuqpys.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWRucXN2dXhhb3FveXVxcHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTI1MTYsImV4cCI6MjEwODMyODUxNn0.uB0A3hVBCDuCkXz5fJFt3eMlpLjcyEbrLL17rWc1ILg';

  let verifyPollTimer = null;

  window.verifyAndActivateLicense = async function(retryCount = 0) {
    const emailInput = document.getElementById('checkoutEmail');
    const utrInput = document.getElementById('checkoutUtr');
    const statusMsg = document.getElementById('checkoutStatusMsg');
    const verifyBtn = document.getElementById('btnVerifyUpi');

    const email = (emailInput?.value || '').trim().toLowerCase();
    const utr = (utrInput?.value || '').trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      showStatus('Please enter a valid email address.', '#ef4444', '#7f1d1d');
      emailInput?.focus();
      return;
    }

    if (!utr || !/^\d{12}$/.test(utr)) {
      showStatus('Please enter a valid 12-digit UPI Reference / UTR Number.', '#ef4444', '#7f1d1d');
      utrInput?.focus();
      return;
    }

    // Set loading state
    if (verifyBtn) {
      verifyBtn.disabled = true;
      verifyBtn.textContent = retryCount > 0 ? `Syncing with bank (Attempt ${retryCount}/4)...` : 'Verifying transaction...';
    }
    showStatus('Checking transaction reference with bank records...', '#38bdf8', '#0369a1');

    try {
      // Step A: Call claim_upi_payment RPC in Supabase
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claim_upi_payment`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_email: email,
          p_utr: utr,
          p_min_amount: 249.00
        })
      });

      const result = await rpcRes.json();

      if (result.success) {
        // Step B: Success! License is active, now trigger password delivery email
        showStatus('License activated! Sending your temporary password code...', '#34d399', '#065f46');
        
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
          });
        } catch (e) {
          console.warn('Recover trigger notice:', e);
        }

        // Render Success View
        setTimeout(() => {
          const formState = document.getElementById('checkoutFormState');
          const successState = document.getElementById('checkoutSuccessState');
          const confirmedEmail = document.getElementById('confirmedEmail');
          if (confirmedEmail) confirmedEmail.textContent = email;
          if (formState) formState.style.display = 'none';
          if (successState) successState.style.display = 'block';
        }, 1200);

        return;
      }

      // If already redeemed, stop immediately
      if (result.error && result.error.includes('already been redeemed')) {
        showStatus(result.error, '#ef4444', '#7f1d1d');
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = '⚡ Verify Payment & Activate (₹249)';
        }
        return;
      }

      // If not synced yet and retries remaining, wait 12s and auto-retry
      if (retryCount < 3) {
        showStatus(`Payment detected! Bank email syncing in progress. Auto-checking again in 12 seconds (Attempt ${retryCount + 1}/3)...`, '#f59e0b', '#78350f');
        clearTimeout(verifyPollTimer);
        verifyPollTimer = setTimeout(() => {
          window.verifyAndActivateLicense(retryCount + 1);
        }, 12000);
      } else {
        showStatus(result.error || 'Transaction not found yet. If you completed payment within the last 2 minutes, please wait a moment and click verify again.', '#f59e0b', '#78350f');
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = '⚡ Verify Payment & Activate (₹249)';
        }
      }

    } catch (err) {
      console.error('Verification error:', err);
      showStatus('Network connection error. Please check your internet and try again.', '#ef4444', '#7f1d1d');
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.textContent = '⚡ Verify Payment & Activate (₹249)';
      }
    }
  };

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
});
