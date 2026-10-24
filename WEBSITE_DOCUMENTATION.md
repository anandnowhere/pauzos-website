# Pauzos Website — Architecture, Marketing & Payment Webhook Guide

**Domain:** [https://pauzos.com](https://pauzos.com)  
**Location:** `/home/anand/STRATEXA/Pauzos.com/Websites Data`  
**Git Remote:** `git@github.com:anandnowhere/pauzos-website.git`  
**Hosting Infrastructure:** GitHub Pages + Custom Domain (`CNAME`)  

---

## 1. Website Overview & File Manifest

| File / Folder | Role & Content |
| :--- | :--- |
| `index.html` | High-converting landing page: Hero value proposition, workday scheduler interactive demo, dual-theme live toggle, micro-break pacing section, pricing tables, FAQ accordion, customer reviews. |
| `download.html` | Dynamic OS download hub: Automatically detects visitor OS (Windows, macOS, Linux) and provides 1-click downloads directly from GitHub releases with detailed step-by-step install instructions. |
| `contact.html` | Support request form and direct contact details (`hello@stratexa.in`). |
| `privacy.html` | Comprehensive privacy statement highlighting local-first data storage and zero telemetry tracking of reminder contents. |
| `terms.html` | Software license agreement, workstation activation rules, and refund policy. |
| `styles.css` | Modern glassmorphic CSS design system with subtle gradients, responsive grid breakpoints, and interactive state transitions. |
| `script.js` | Client-side logic: FAQ accordions, dual-theme preview switcher, dynamic UPI QR code generator, and OS detection. |
| `google-apps-script-hdfc-listener.js` | Automated Google Apps Script processing HDFC bank alert emails and automatically provisioning Supabase accounts. |
| `CNAME` | Binds GitHub Pages to `pauzos.com`. |
| `assets/` | High-resolution SVG logos, application screenshots in Dark & Light modes, OS badges. |

---

## 2. Dynamic OS Detection & Download Engine (`download.html`, `script.js`)

Visitor operating systems are identified using modern `navigator.userAgentData` and `navigator.userAgent` heuristics:
```javascript
function detectOS() {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
  if (/Linux/i.test(ua)) return 'linux';
  return 'windows'; // fallback default
}
```

The page queries the latest GitHub release to dynamically populate binary download URLs:
- **Windows**: NSIS Setup (`.exe`) and Portable (`.exe`)
- **Linux**: Universal AppImage (`.AppImage`) and Debian/Ubuntu (`.deb`)
- **macOS**: Apple Silicon / Intel (`.dmg`) and Zip archive (`.zip`)

---

## 3. Automated HDFC UPI Payment & Supabase Provisioning Flow

```
[ User on pauzos.com ]
        │  Enters email & selects plan (e.g. ₹999/yr)
        ▼
[ Dynamic UPI QR Code Generated ]
        │  User scans & pays via GPay / PhonePe / Paytm / Cred
        ▼
[ HDFC Bank UPI Credit Notification Email ]
        │  Sent to hello@stratexa.in
        ▼
[ Google Apps Script Webhook Listener ]
        │  Triggered every 1-2 minutes on inbox
        │  Parses Transaction ID, Amount, and Payer Name
        ▼
[ Supabase Customer Provisioning ]
        │  Inserts/Activates user account in 'customers' table
        │  Generates 6-digit temporary password
        ▼
[ Automated Welcome & Activation Email ]
        │  Sent directly to customer inbox with credentials
        ▼
[ User Signs In & Activates Desktop Workstation ]
```

---

## 4. Deployment Instructions
Any commit pushed to `main` in `/home/anand/STRATEXA/Pauzos.com/Websites Data/` triggers GitHub Pages:
```bash
git add .
git commit -m "Update website content"
git push origin main
```
The site updates live at **https://pauzos.com** within approximately 60 seconds.
