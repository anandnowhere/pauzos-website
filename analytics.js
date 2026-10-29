/**
 * Pauzos Web Analytics Engine (analytics.js)
 * Privacy-friendly, zero-dependency analytics for tracking:
 * 1. Visitors (Unique & Sessions, New vs Returning)
 * 2. Downloads (By OS: Windows Portable, Setup, macOS, Linux)
 * 3. Time Spent on Page (Active engagement time, pause on blur, beacon on exit)
 * 4. Geography (Country, City, Timezone, Language, Device)
 * 5. Scroll Depth (Milestones at 25%, 50%, 75%, 90%, 100%)
 * 6. Checkout Funnel (Modal opens, UPI copy, UTR verify)
 *
 * Supported Sinks:
 * - Supabase Database (Direct REST API insert to analytics_pageviews & analytics_events)
 * - Google Analytics 4 (Auto-forwarding if window.GA_MEASUREMENT_ID is configured)
 * - Local Inspector (window.pauzosAnalytics.getMetrics())
 */

(function () {
  'use strict';

  // Configuration
  const SUPABASE_URL = 'https://suidnqsvuxaoqoyuqpys.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWRucXN2dXhhb3FveXVxcHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTI1MTYsImV4cCI6MjEwODMyODUxNn0.uB0A3hVBCDuCkXz5fJFt3eMlpLjcyEbrLL17rWc1ILg';

  // Session & Identity Helpers
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getOrSetVisitorId() {
    try {
      let vid = localStorage.getItem('pauzos_visitor_id');
      if (!vid) {
        vid = 'v_' + generateUUID();
        localStorage.setItem('pauzos_visitor_id', vid);
        localStorage.setItem('pauzos_first_visit', new Date().toISOString());
      }
      return vid;
    } catch (e) {
      return 'v_temp_' + generateUUID();
    }
  }

  function getOrSetSessionId() {
    try {
      let sid = sessionStorage.getItem('pauzos_session_id');
      if (!sid) {
        sid = 's_' + generateUUID();
        sessionStorage.setItem('pauzos_session_id', sid);
        sessionStorage.setItem('pauzos_session_start', Date.now().toString());
      }
      return sid;
    } catch (e) {
      return 's_temp_' + generateUUID();
    }
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return 'Unknown';
  }

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/') && !ua.includes('Chromium/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('Firefox/')) return 'Firefox';
    return 'Other';
  }

  // Parse UTM parameters
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_content: params.get('utm_content') || null
    };
  }

  // Geo Detection via lightweight client-side lookup
  let cachedGeo = { country: 'Unknown', city: 'Unknown' };
  async function resolveGeo() {
    try {
      // Fast Cloudflare CDN trace lookup (CORS friendly, zero-latency)
      const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('loc=')) {
            cachedGeo.country = line.split('=')[1] || 'Unknown';
            break;
          }
        }
      }
    } catch (e) {
      // Fallback: user timezone mapping
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) {
        cachedGeo.country = 'IN';
      }
    }
    return cachedGeo;
  }

  // State
  const visitorId = getOrSetVisitorId();
  const sessionId = getOrSetSessionId();
  const startTime = Date.now();
  let activeSeconds = 0;
  let isTabVisible = !document.hidden;
  let activeTimer = null;
  const scrollMilestones = { 25: false, 50: false, 75: false, 90: false, 100: false };
  let maxScrollReached = 0;

  // Active Time Tracker (pauses when user switches tab)
  function startActiveTimer() {
    if (activeTimer) clearInterval(activeTimer);
    activeTimer = setInterval(() => {
      if (isTabVisible) {
        activeSeconds += 1;
        // Periodic heartbeat checkpoints
        if ([15, 30, 60, 120, 300, 600].includes(activeSeconds)) {
          trackEvent('time_spent', {
            seconds: activeSeconds,
            minutes: (activeSeconds / 60).toFixed(1),
            max_scroll: maxScrollReached
          });
        }
      }
    }, 1000);
  }

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (document.hidden) {
      // Flush current time spent before tab disappears
      trackEvent('dwell_update', { seconds: activeSeconds, final: false });
    }
  });

  // Scroll Depth Engine
  function trackScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const winHeight = window.innerHeight;
    const docHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const scrollable = docHeight - winHeight;
    if (scrollable <= 0) return;

    const percent = Math.min(100, Math.round((scrollTop / scrollable) * 100));
    if (percent > maxScrollReached) maxScrollReached = percent;

    [25, 50, 75, 90, 100].forEach((m) => {
      if (percent >= m && !scrollMilestones[m]) {
        scrollMilestones[m] = true;
        trackEvent('scroll_depth', {
          milestone: `${m}%`,
          percent: m,
          active_seconds: activeSeconds
        });
      }
    });
  }

  let scrollThrottle = null;
  window.addEventListener('scroll', () => {
    if (!scrollThrottle) {
      scrollThrottle = requestAnimationFrame(() => {
        trackScrollDepth();
        scrollThrottle = null;
      });
    }
  }, { passive: true });

  // Core Event Dispatcher
  async function trackEvent(eventName, eventData = {}) {
    const payload = {
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: eventName,
      page_path: window.location.pathname,
      page_title: document.title,
      country: cachedGeo.country,
      device: detectDevice(),
      os: detectOS(),
      browser: detectBrowser(),
      active_seconds: activeSeconds,
      max_scroll: maxScrollReached,
      event_data: eventData,
      created_at: new Date().toISOString()
    };

    // 1. Log locally to browser memory/localStorage for instant inspection
    try {
      const stored = JSON.parse(localStorage.getItem('pauzos_recent_events') || '[]');
      stored.unshift({ ...payload, timestamp: Date.now() });
      if (stored.length > 50) stored.pop();
      localStorage.setItem('pauzos_recent_events', JSON.stringify(stored));
    } catch (e) {}

    // 2. Forward to GA4 if present
    if (window.gtag) {
      try {
        window.gtag('event', eventName, {
          event_category: 'Pauzos Growth',
          event_label: eventData.target || eventData.milestone || eventData.os || '',
          value: eventData.seconds || 1,
          ...eventData
        });
      } catch (e) {}
    }

    // 3. Post to Supabase REST API (asynchronous, non-blocking)
    try {
      fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          session_id: sessionId,
          event_name: eventName,
          event_data: payload
        })
      }).catch(() => {});
    } catch (e) {}

    // Optional console debugging
    if (window.PAUZOS_ANALYTICS_DEBUG) {
      console.log(`[Pauzos Analytics] ${eventName}:`, payload);
    }
  }

  // Initial Pageview Dispatch
  async function recordPageview() {
    await resolveGeo();

    const utm = getUTMParams();
    const pageviewData = {
      visitor_id: visitorId,
      session_id: sessionId,
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || 'direct',
      country: cachedGeo.country,
      device: detectDevice(),
      os: detectOS(),
      browser: detectBrowser(),
      screen_res: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      is_returning: !!localStorage.getItem('pauzos_first_visit'),
      ...utm
    };

    trackEvent('page_view', pageviewData);

    // Write to Supabase analytics_pageviews
    try {
      fetch(`${SUPABASE_URL}/rest/v1/analytics_pageviews`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(pageviewData)
      }).catch(() => {});
    } catch (e) {}
  }

  // Download Click Interceptor
  function setupDownloadTracking() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const text = (target.textContent || '').trim();
      const onclickAttr = target.getAttribute('onclick') || '';

      // Check if it's a download button or link
      const isDownload =
        href.includes('download') ||
        href.includes('.exe') ||
        href.includes('.dmg') ||
        href.includes('.AppImage') ||
        href.includes('.deb') ||
        href.includes('.zip') ||
        target.classList.contains('dl-btn') ||
        target.classList.contains('hero-cta-primary-xl') ||
        target.classList.contains('sticky-cta') ||
        onclickAttr.includes('triggerPauzosDownload');

      if (isDownload) {
        let osCategory = 'general_download';
        if (onclickAttr.includes('win-portable') || text.toLowerCase().includes('portable')) osCategory = 'Windows Portable';
        else if (onclickAttr.includes('win-setup') || text.toLowerCase().includes('personal setup')) osCategory = 'Windows Setup';
        else if (onclickAttr.includes('mac-dmg') || text.toLowerCase().includes('dmg')) osCategory = 'macOS DMG';
        else if (onclickAttr.includes('mac-zip') || text.toLowerCase().includes('mac')) osCategory = 'macOS ZIP';
        else if (onclickAttr.includes('linux-appimage') || text.toLowerCase().includes('appimage')) osCategory = 'Linux AppImage';
        else if (onclickAttr.includes('linux-deb') || text.toLowerCase().includes('deb')) osCategory = 'Linux DEB';

        trackEvent('download_click', {
          os: osCategory,
          button_text: text.substring(0, 50),
          href: href,
          scroll_depth: maxScrollReached,
          active_seconds: activeSeconds
        });
      }

      // Check if it's a checkout CTA
      if (onclickAttr.includes('handleCheckout') || text.includes('₹249') || text.includes('Lifetime Access')) {
        trackEvent('checkout_cta_click', {
          button_text: text.substring(0, 50),
          active_seconds: activeSeconds,
          scroll_depth: maxScrollReached
        });
      }
    }, true);
  }

  // Page Exit Beacon (Guaranteed delivery of final engagement time)
  window.addEventListener('pagehide', function () {
    const finalPayload = JSON.stringify({
      session_id: sessionId,
      event_name: 'session_exit',
      event_data: {
        visitor_id: visitorId,
        total_active_seconds: activeSeconds,
        max_scroll_reached: maxScrollReached,
        ended_at: new Date().toISOString()
      }
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${SUPABASE_URL}/rest/v1/analytics_events`,
        new Blob([finalPayload], { type: 'application/json' })
      );
    }
  });

  // Global API for console inspection and dashboard
  window.pauzosAnalytics = {
    track: trackEvent,
    getMetrics: function () {
      return {
        visitorId: visitorId,
        sessionId: sessionId,
        activeSeconds: activeSeconds,
        maxScrollReached: maxScrollReached + '%',
        geo: cachedGeo,
        device: detectDevice(),
        os: detectOS(),
        browser: detectBrowser(),
        recentEvents: JSON.parse(localStorage.getItem('pauzos_recent_events') || '[]')
      };
    }
  };

  // Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      recordPageview();
      startActiveTimer();
      setupDownloadTracking();
    });
  } else {
    recordPageview();
    startActiveTimer();
    setupDownloadTracking();
  }
})();
