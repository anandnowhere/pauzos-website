# Pauzos Website — Architecture, Marketing & Payment Webhook Guide

**Domain:** [https://pauzos.com](https://pauzos.com)  
**Location:** `/home/anand/STRATEXA/Pauzos.com/Websites Data`  
**Git Remote:** `git@github.com:anandnowhere/pauzos-website.git`  
**Hosting Infrastructure:** GitHub Pages + Custom Domain (`CNAME`)  

---

## 1. Website Overview & File Manifest

| File / Folder | Role & Content |
| :--- | :--- |
| `index.html` | High-converting landing page: Hero value proposition, 1080p tour video showcase, split interactive theme preview, 3-step smart alert walkthrough, problem/solution grid, persona workflows, pricing tables, FAQ accordion, and UPI checkout modal. |
| `download.html` | Dynamic OS download hub: Detects visitor OS (Windows, macOS, Linux) and delivers 1-click downloads directly from GitHub releases (`v1.0.28`), with detailed corporate zero-admin install instructions. |
| `download/index.html` | Canonical directory route serving the identical OS download experience for visitors navigating to `pauzos.com/download/`. |
| `pricing.json` | Source of truth for live pricing (₹249 introductory / ₹999 standard, currency, and strike-through amounts), synchronized dynamically across all buttons on page load. |
| `contact.html` | Support request form and direct contact details (`hello@stratexa.in`). |
| `privacy.html` | Comprehensive privacy statement: 100% local task storage, zero routine tracking, and transparent disclosure of Supabase hardware-hash licensing and UPI UTR payment verification. |
| `terms.html` | Software license agreement, 2-device concurrent activation rules, and refund policy. |
| `styles.css` | Liquid Obsidian Glass CSS design system with specular highlights, responsive grid breakpoints, mobile drawer rules, and interactive state transitions. Cache-busted via `styles.css?v=20261027_2`. |
| `script.js` | Client-side logic: FAQ accordions, dual-theme interactive slider, dynamic UPI QR code generator, checkout modal state management, background scroll lock, and OS detection. Cache-busted via `script.js?v=20261027_2`. |
| `google-apps-script-hdfc-listener.js` | Automated Google Apps Script processing HDFC bank alert emails and automatically provisioning Supabase accounts. |
| `CNAME` | Binds GitHub Pages to `pauzos.com`. |
| `assets/` | High-resolution brand assets: Official Sonic Chime Bell logo (`logo.png`), application screenshots, branded UPI QR code (`pauzos_upi_qr.png`), and product tour video (`video/product_usecase_tour.mp4`). |

---

## 2. Conversion-First Landing Page Architecture (`index.html`)

The homepage has been structured to solve first-time visitor confusion and pass the "5-second test":

1. **Category-First Hero Section**:
   - **Eyebrow Pill**: Explicitly names the product category: `🖥️ Desktop Reminder Software for Windows, macOS & Linux`.
   - **Value-Driven Headline**: `Desktop Reminder Software for Deadlines You Can't Afford to Miss`.
   - **Direct Plain-English Subtitle**: *"Pauzos displays floating reminder cards directly over your work — so critical billing cut-offs, timesheets, and daily routines are impossible to miss."*
   - **Primary Action**: Pulsing button: `📥 Download Free Trial — 3 Days Unlimited` (no credit card or signup needed).
   - **Secondary Actions**: `⚡ Get Lifetime Access — ₹249 (One-Time)` directly launches the Liquid Glass UPI checkout modal.
   - **Zero-Friction Guarantees**: `✅ No credit card required • ✅ No account or signup needed • ✅ Windows, macOS & Linux • ✅ 100% offline task privacy`.
   - **Enterprise Trust Row**: Zero-admin portable mode for work laptops, local SQLite storage, and one-time ₹249 lifetime option (no SaaS subscriptions).

2. **3-Step Visual Showcase (`#how-it-works`)**:
   - Proves what makes Pauzos different using `reminder_popup_timesheet.png`:
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
   - 100% of user schedules, checklists, notes, and audit logs remain stored locally in SQLite on the user's machine.
   - Online connectivity is used exclusively for one-time license activation (via Supabase hardware ID hash) and public GitHub version update checks.
   - Synchronized application build version to `v1.0.28` and standard pricing to ₹999 (75% off launch price of ₹249).

---

## 3. Media Pipelines: Screenshots, Video & QR Generation

### 3.1 Automated Chrome Headless Screenshot Pipeline
To eliminate visual discrepancies between the marketing website copy and actual software behavior:
- Script: `Application Data/scratch/render_all_screenshots_chrome.py`.
- Generates static HTML DOM pages injecting exact mock routine data matching website copy.
- Invokes `/usr/bin/google-chrome --headless --screenshot=... --window-size=...`.
- Automated validation checks test brightness, pairwise Euclidean distance (> 5.0), and zero legacy monograms.
- Outputs 10 crisp PNG captures directly into `assets/screenshots/`:
  - `tab_today_agenda.png`: Today's Agenda in Dark Mode (KPIs: 8 Total, 4 Done, 3 Pending, 1 Snoozed; 8 distinct tasks).
  - `reminder_popup_timesheet.png`: Floating smart alert for *Intraday Risk Audit & Trailing Stop-Loss Review* (`⏰ CUT-OFF: 14:30`) with full 3-step checklist and action grid.
  - `tab_all_reminders.png`: All Reminders tab active with category filter pills and active routine toggles.
  - `modal_new_routine_attached.png`: Centered routine creation dialog card with *Accounting - AR Workday 3* configuration and visible *Save Routine* / *Cancel* buttons.
  - `tab_audit_reports.png`: Local SQLite audit records with completion badges, timestamp notes, and 1-Click Excel (`.xlsx`) export buttons.
  - `tab_workdays_calendar.png`: October 2026 calendar grid with WD chips and holidays.
  - `notification_wellness.png`: Floating ergonomic prompt toast with 20-20-20 rule.
  - `hero_homepage_dark_4k.png` & `hero_homepage_light_4k.png`: 4K dual-theme comparison frames.

### 3.2 1080p Voiceover Tour Video Compiler
- Script: `assets/video/generator/build_video.py`.
- Synthesizes neural voiceover narration across 6 scenes using Edge-TTS (`en-US-ChristopherNeural`).
- Pre-renders dynamic HTML stage templates at 1920×1080.
- Compiles clips with `ffmpeg` using H.264 video, AAC audio, and `+faststart` metadata for instant web streaming.
- Master output: `assets/video/product_usecase_tour.mp4`.

### 3.3 Dynamic UPI Deep Links & QR Code System
- Branded QR code: `assets/pauzos_upi_qr.png` regenerated using Python `qrcode` (Error Correction Level H) with the official Sonic Chime Bell centered in an ivory rounded card.
- Payload: `upi://pay?pa=anandnowhere-2@okaxis&pn=Pauzos%20Software&am=249.00&cu=INR&aid=uGICAgIDAp6XKeQ`.
- Decoded & verified via `pyzbar` to ensure the payee name displays cleanly as **Pauzos Software** on all banking applications (GPay, PhonePe, Paytm).

---

## 4. Mobile Responsiveness & Safe-Area Engineering

The website features custom mobile optimizations for iOS Safari and Android Chrome:
1. **Viewport Height Resilience**: Uses `height: 100dvh` and `env(safe-area-inset-bottom)` to prevent iOS Safari floating address bars from obstructing action buttons.
2. **Background Scroll-Lock**: Dynamically locks `document.body.style.overflow = 'hidden'` while checkout modals are active, preventing background text bleed-through.
3. **Mobile-Optimized Checkout Hierarchy**: Prioritizes the prominent **“📱 Tap to Pay on UPI App”** button directly below the UPI ID, scaling the QR code to a compact 150px card on phones so that the Email, UTR, and `⚡ Verify Payment & Activate` button remain comfortably accessible.
4. **Streamlined Mobile Top Bar**: Automatically hides secondary buttons on screens narrower than 640px, giving the brand and primary CTA clean spacing.

---

## 5. Automated HDFC UPI Payment & Supabase Provisioning Flow

```
[ User on pauzos.com ]
        │  Clicks "Get Access • ₹249" to open modal
        ▼
[ Dynamic UPI QR Code Generated / Tap to Pay Button ]
        │  User completes ₹249 payment via GPay / PhonePe / Paytm / Cred
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
[ User Signs In & Activates Desktop Workstation (Up to 2 Concurrent Devices) ]
```

---

## 6. Deployment Instructions

Any commit pushed to `main` in `/home/anand/STRATEXA/Pauzos.com/Websites Data/` triggers GitHub Pages:
```bash
cd "/home/anand/STRATEXA/Pauzos.com/Websites Data"
git add -A
git commit -m "feat(website): update landing page content"
git push origin main
```
The site updates live at **https://pauzos.com** within approximately 60 seconds.

---
*Maintained by Stratexa Core Engineering Team (`hello@stratexa.in`).*
