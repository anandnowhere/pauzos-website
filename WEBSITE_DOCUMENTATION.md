# Pauzos Website — Architecture, Marketing & Payment Webhook Guide

**Domain:** [https://pauzos.com](https://pauzos.com)  
**Location:** `/home/anand/STRATEXA/Pauzos.com/Websites Data`  
**Git Remote:** `git@github.com:anandnowhere/pauzos-website.git`  
**Hosting Infrastructure:** GitHub Pages + Custom Domain (`CNAME`)  

---

## 1. Website Overview & File Manifest

| File / Folder | Role & Content |
| :--- | :--- |
| `index.html` | High-converting landing page: Category-first hero, single dominant Free Trial CTA, 3-step floating alert showcase (`#how-it-works`), before/after comparison grid, prioritized persona workflows, pricing table, and verified offline privacy copy. |
| `download.html` | Dynamic OS download hub: Detects visitor OS (Windows, macOS, Linux) and provides 1-click downloads directly from GitHub releases (`v1.0.28`), with detailed corporate zero-admin install instructions. |
| `download/index.html` | Canonical directory route serving the identical OS download experience for visitors navigating to `pauzos.com/download/`. |
| `contact.html` | Support request form and direct contact details (`hello@stratexa.in`). |
| `privacy.html` | Comprehensive privacy statement: 100% local task storage, zero routine tracking, and transparent disclosure of Supabase hardware-hash licensing and UPI UTR payment verification. |
| `terms.html` | Software license agreement, single-device activation rules, and refund policy. |
| `styles.css` | Liquid Obsidian Glass CSS design system with specular highlights, responsive grid breakpoints, mobile drawer rules, and interactive state transitions. Cache-busted via `styles.css?v=20261027_2`. |
| `script.js` | Client-side logic: FAQ accordions, dual-theme interactive slider, dynamic UPI QR code generator, checkout modal state management, and OS detection. |
| `google-apps-script-hdfc-listener.js` | Automated Google Apps Script processing HDFC bank alert emails and automatically provisioning Supabase accounts. |
| `CNAME` | Binds GitHub Pages to `pauzos.com`. |
| `assets/` | High-resolution brand assets: Official Sonic Chime Bell logo (`logo.png`), application screenshots, branded UPI QR code (`pauzos_upi_qr.png`), and product tour video (`video/product_usecase_tour.mp4`). |

---

## 2. Conversion-First Landing Page Architecture (`index.html`)

The homepage has been restructured to solve first-time visitor confusion and pass the "5-second test":

1. **Category-First Hero Section**:
   - **Eyebrow Pill**: Explicitly names the product category: `🖥️ Desktop Reminder Software for Windows, macOS & Linux`.
   - **Value-Driven Headline**: `Desktop Reminder Software for Deadlines You Can't Afford to Miss`.
   - **Direct Plain-English Subtitle**: *"Pauzos displays floating reminder cards directly over your work — so critical billing cut-offs, timesheets, and daily routines are impossible to miss."*
   - **Single Dominant Call to Action**: Pulsing button: `📥 Download Free Trial — 3 Days Unlimited` (no competing buy button in the hero or top navbar).
   - **Secondary Actions**: `▶️ Watch 30-Second Demo` link jumps directly to the interactive storyboard player, with a subtle link to `#pricing`.
   - **Zero-Friction Guarantees**: `✅ No credit card required • ✅ No account or signup needed • ✅ Windows, macOS & Linux • ✅ 100% offline task privacy`.
   - **Enterprise Trust Row**: Zero-admin portable mode for work laptops, local SQLite storage, and one-time ₹249 lifetime option (no SaaS subscriptions).

2. **3-Step "See It In Action" Visual Showcase (`#how-it-works`)**:
   - Immediately proves what makes Pauzos different using `reminder_popup_timesheet.png`:
     1. *Keep working in your usual apps:* Deep in Excel, ERPs, or browser windows while Pauzos stays silent in the background.
     2. *Floating alert appears right on top:* Focused Liquid Glass alert card pops up directly over your screen at cut-off time without stealing active typing focus.
     3. *Take action in one click:* Mark Completed with audit notes, snooze for 15/30/60m, or skip today with all actions saved locally.

3. **Problem vs. Solution "Before vs. After" Section**:
   - **❌ Without the App**: Calendar tabs lost among background windows, silenced phone alerts, forgotten billing deadlines, missed compliance cut-offs.
   - **✅ With Personal Reminder Assistant**: Unmissable floating desktop popup, smart snooze nudges, cut-off deadline badges, gentle ergonomic breaks, and 1-click Excel compliance audit trails.

4. **Reorganized High-Stakes Personas**:
   - Prioritizes corporate and deadline-driven work:
     1. **Managers & Corporate Leads (Primary)**: Sprint deliverables, vendor approvals, timesheet & billing cut-offs.
     2. **CEOs & Founders**: Executive standup, capital runway, daily wrap-up.
     3. **Active Traders & Investors**: Pre-market cues, intraday risk audit, post-market P&L reconciliation.
     4. **Professionals & Creatives**: Ergonomic posture, hydration, and 20-20-20 eye strain breaks.

5. **Verified Offline Privacy & Truthful Transparency**:
   - Replaced blanket claims of "Zero Cloud Telemetry" with accurate, high-trust wording:
     - 100% of user schedules, checklists, notes, and audit logs remain stored locally in SQLite on the user's machine.
     - Online connectivity is used exclusively for one-time license activation (via Supabase hardware ID hash) and public GitHub version update checks.
     - Removed unsubstantiated claims ("Guarantees 100% on-time project billing" and unverified 73% statistics).
     - Synchronized application build version to `v1.0.28` and standard pricing to ₹999 (75% off launch price of ₹249).

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
