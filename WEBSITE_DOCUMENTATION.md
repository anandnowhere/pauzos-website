# Pauzos Website — Architecture, Marketing & Payment Webhook Guide

**Domain:** [https://pauzos.com](https://pauzos.com)  
**Location:** `/home/anand/STRATEXA/Pauzos.com/Websites Data`  
**Git Remote:** `git@github.com:anandnowhere/pauzos-website.git`  
**Hosting Infrastructure:** GitHub Pages + Custom Domain (`CNAME`)  

---

## 1. Website Overview & File Manifest

| File / Folder | Role & Content |
| :--- | :--- |
| `index.html` | High-converting landing page: Problem-first hero headline, before vs after problem comparison grid, sticky trial download bar, dual-theme comparison slider, high-stakes persona workflows, ₹249 UPI checkout modal, FAQ accordion, and footer. |
| `download.html` | Dynamic OS download hub: Detects visitor OS (Windows, macOS, Linux) and provides 1-click downloads directly from GitHub releases (`v1.0.28`), with detailed corporate zero-admin install instructions. |
| `download/index.html` | Canonical directory route serving the identical OS download experience for visitors navigating to `pauzos.com/download/`. |
| `contact.html` | Support request form and direct contact details (`hello@stratexa.in`). |
| `privacy.html` | Comprehensive privacy statement highlighting 100% local-first data storage and zero telemetry tracking of reminder contents. |
| `terms.html` | Software license agreement, single-device activation rules, and refund policy. |
| `styles.css` | Liquid Obsidian Glass CSS design system with specular highlights, responsive grid breakpoints, mobile drawer rules, and interactive state transitions. Cache-busted via `styles.css?v=20261026_1`. |
| `script.js` | Client-side logic: FAQ accordions, dual-theme interactive slider, dynamic UPI QR code generator, checkout modal state management, and OS detection. |
| `google-apps-script-hdfc-listener.js` | Automated Google Apps Script processing HDFC bank alert emails and automatically provisioning Supabase accounts. |
| `CNAME` | Binds GitHub Pages to `pauzos.com`. |
| `assets/` | High-resolution brand assets: Official Sonic Chime Bell logo (`logo.png`), application screenshots, branded UPI QR code (`pauzos_upi_qr.png`), and product tour video (`video/product_usecase_tour.mp4`). |

---

## 2. Problem-First Landing Page Architecture (`index.html`)

The homepage has been restructured to immediately address the user's pain point and drive trial installations:

1. **Emotional Pain-Point Headline**:
   - Led by a direct question: *"Missed Another Deadline Because Your Reminder Got Buried?"*
   - Three relatable workplace failures: *"Phone alerts get silenced. Calendar events get dismissed. Sticky notes get ignored."*
   - Clear solution: *"Personal Reminder Assistant pops up unmissable floating alerts right on your desktop screen — so you never miss a cut-off, billing deadline, or daily routine again."*
2. **Massive Primary Call to Action**:
   - Prominent, pulsing-glow button: `📥 Download Free — Try 3 Days Unlimited`.
   - Secondary button: `⚡ Get Lifetime Access — ₹249 (One-Time)`.
   - Zero-friction trust badges: `✅ No credit card needed • ✅ No signup required • ✅ Windows, Mac & Linux • ✅ 100% offline & private`.
3. **Problem vs. Solution "Before vs. After" Section**:
   - **❌ Without the App**: Buried browser tabs, silenced phone alerts, forgotten billing & compliance deadlines, 8 hours of screen time without breaks.
   - **✅ With Personal Reminder Assistant**: Unmissable floating desktop popup, smart snooze, cut-off deadline badges, automatic ergonomic wellness breaks, and 1-click Excel compliance audit trails.
4. **Interactive Theme Comparison Slider**:
   - Allows visitors to drag and compare Deep Obsidian (Dark) vs. Warm Ivory Linen (Light) application themes side by side.
5. **Sticky Bottom Download Bar**:
   - Fixed slide-up bar appearing after scrolling 600px, keeping the download action persistent across desktop and mobile.

---

## 3. Dynamic OS Detection & Download Engine (`download.html`, `download/index.html`)

Visitor operating systems are identified using `navigator.userAgent` heuristics:
```javascript
function detectOS() {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
  if (/Linux/i.test(ua)) return 'linux';
  return 'windows'; // fallback default
}
```

The download hub delivers binaries from the GitHub release distribution (`https://github.com/anandnowhere/stratexa-releases`):
- **Windows Office Portable**: `Personal-Reminder-Assistant-Portable-1.0.28.exe` (Zero Admin, runs from USB/Downloads)
- **Windows Personal Setup**: `Personal-Reminder-Assistant-Setup-1.0.28.exe`
- **Linux**: Universal AppImage (`Personal-Reminder-Assistant-1.0.28.AppImage`) and Debian/Ubuntu (`Personal-Reminder-Assistant-1.0.28.deb`)
- **macOS**: Apple Silicon / Intel DMG (`Personal-Reminder-Assistant-1.0.28-mac.dmg`) and ZIP archive

---

## 4. Automated HDFC UPI Payment & Supabase Provisioning Flow

```
[ User on pauzos.com ]
        │  Clicks "Get Access • ₹249" to open modal
        ▼
[ Dynamic UPI QR Code Generated ]
        │  User scans & pays ₹249 via GPay / PhonePe / Paytm / Cred
        ▼
[ HDFC Bank UPI Credit Notification Email ]
        │  Sent to hello@stratexa.in
        ▼
[ Google Apps Script Webhook Listener ]
        │  Triggered every 1-2 minutes on inbox
        │  Parses Transaction ID (UTR), Amount, and Payer Name
        ▼
[ Supabase Customer Provisioning ]
        │  Inserts/Activates user account in 'customers' table
        │  Generates temporary workstation password
        ▼
[ Automated Welcome & Activation Email ]
        │  Delivered directly to customer inbox with credentials
        ▼
[ User Signs In & Activates Desktop Workstation ]
```

---

## 5. Mobile Responsiveness & Safe-Area Tuning

The site is fully responsive across mobile devices (iOS Safari and Android Chrome):
- **Header:** Navigation menu automatically hides on viewports below 860px to preserve logo and CTA spacing.
- **Full-Width Action Buttons:** Hero download buttons expand to 100% width on screens under 768px for thumb-friendly tapping.
- **Sticky Download Bar:** Auxiliary trust text hides on mobile viewports so the floating bar remains compact and unobtrusive.
- **Instant Mobile UPI Deep Links:** Direct `upi://pay` deep links allow 1-tap payment within mobile UPI apps.

---

## 6. Deployment Instructions

Any commit pushed to `main` in `/home/anand/STRATEXA/Pauzos.com/Websites Data/` triggers GitHub Pages:
```bash
cd "/home/anand/STRATEXA/Pauzos.com/Websites Data"
git add .
git commit -m "feat(website): update landing page content"
git push origin main
```
The site updates live at **https://pauzos.com** within approximately 60 seconds.
