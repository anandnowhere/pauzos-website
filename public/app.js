let appScreenshotTheme = "light";
const scenarios = {
  billing: { category: 'BILLING & OPERATIONS', title: 'Submit the billing run', detail: 'Review invoices and submit before the 4 PM cut-off.', time: '16:00', schedule: 'Monthly · Workday 3' },
  timesheet: { category: 'WEEKLY ADMIN', title: 'Submit your timesheet', detail: 'Review your hours and send this week’s timesheet.', time: '16:30', schedule: 'Every Friday' },
  break: { category: 'HEALTH & WELLNESS', title: 'Give your eyes a break', detail: 'Look 20 feet away for 20 seconds. Take a breath.', time: '11:45', schedule: 'Every 20 minutes' }
};
let currentScenario = 'billing';
const reminderBody = document.querySelector('#reminder-body');
const reminderResult = document.querySelector('#reminder-result');

function resetReminder() {
  reminderBody.hidden = false;
  reminderResult.hidden = true;
  document.querySelector('#reminder-badge').textContent = 'DUE NOW';
}

document.querySelectorAll('[data-scenario]').forEach(button => {
  button.addEventListener('click', () => {
    currentScenario = button.dataset.scenario;
    const scenario = scenarios[currentScenario];
    ['category', 'title', 'detail', 'time', 'schedule'].forEach(key => {
      document.querySelector(`#reminder-${key}`).textContent = scenario[key];
    });
    document.querySelectorAll('[data-scenario]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    resetReminder();
  });
});

function showReminderResult(action) {
  const completed = action === 'completed';
  reminderBody.hidden = true;
  reminderResult.hidden = false;
  reminderResult.setAttribute('role', 'status');
  document.querySelector('#reminder-badge').textContent = completed ? 'COMPLETED' : 'SNOOZED';
  document.querySelector('#result-icon').textContent = completed ? '✓' : '◷';
  document.querySelector('#result-title').textContent = completed ? 'One less thing to remember.' : 'A little more breathing room.';
  document.querySelector('#result-detail').textContent = completed ? 'Marked complete. Saved to your activity history.' : 'Snoozed for 15 minutes. Pauzos will remind you again.';
  document.querySelector('#replay-demo').focus({ preventScroll: true });
}

document.querySelector('#complete-demo').addEventListener('click', () => showReminderResult('completed'));
document.querySelector('#snooze-demo').addEventListener('click', () => showReminderResult('snoozed'));
document.querySelector('#replay-demo').addEventListener('click', () => {
  resetReminder();
  document.querySelector('#complete-demo').focus({ preventScroll: true });
});

const productScreens = {
  agenda: { alt: "Pauzos Today's Agenda showing scheduled tasks, completion counts, and due reminders", caption: 'Your daily overview, with the next action always visible.', count: '01 / 03' },
  routines: { alt: 'Pauzos All Reminders with categories, recurring schedules, priority settings, and enabled routines', caption: 'Recurring tasks, organised around the way you work.', count: '02 / 03' },
  reports: { alt: 'Pauzos Audit and Reports with local completion history and an Export to Excel button', caption: 'A local record of your actions, ready to review or export.', count: '03 / 03' }
};
const productTabs = [...document.querySelectorAll('[data-product]')];
function selectProductTab(button) {
  const key = button.dataset.product;
  const screen = productScreens[key];
  productTabs.forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  const image = document.querySelector('#product-screenshot');
  image.dataset.appScreen = key;
  image.src = `assets/${key}-${appScreenshotTheme}.webp`;
  image.srcset = `assets/${key}-${appScreenshotTheme}-720.webp 720w, assets/${key}-${appScreenshotTheme}.webp 1440w`;
  image.alt = screen.alt;
  document.querySelector('#screenshot-caption').textContent = screen.caption;
  document.querySelector('#screenshot-count').textContent = screen.count;
  document.querySelector('#product-panel').setAttribute('aria-labelledby', button.id);
  document.querySelector('#screenshot-link').href = image.src;
  document.querySelector('#screenshot-link').setAttribute('aria-label', `Open the ${key} screenshot at full size`);
  document.querySelector('#screenshot-expand').href = image.src;
}
productTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectProductTab(button));
  button.addEventListener('keydown', event => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % productTabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + productTabs.length) % productTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = productTabs.length - 1;
    selectProductTab(productTabs[next]);
    productTabs[next].focus();
  });
});

const releaseBase = 'https://github.com/anandnowhere/stratexa-releases/releases/download/';
const editions = {
  'win-portable': {
    os: 'windows', name: 'Windows Portable', version: '1.0.34', option: 'Portable · run without installing (.exe)', file: 'Personal-Reminder-Assistant-Portable-1.0.34.exe',
    description: 'Run directly from a folder without an installer or administrator access.', spec: 'Windows 10 / 11 · .exe · 85 MB',
    steps: ['Save the portable file to your computer.', 'Open it from your Downloads folder.', 'Launch Pauzos. Your 72-hour trial begins now, with no signup or payment details.']
  },
  'win-setup': {
    os: 'windows', name: 'Windows Installer', version: '1.0.34', option: 'Installer · standard setup (.exe)', file: 'Personal-Reminder-Assistant-Setup-1.0.34.exe',
    description: 'Install Pauzos with a standard setup and a Start menu shortcut.', spec: 'Windows 10 / 11 · .exe · 85 MB',
    steps: ['Save the installer to your computer.', 'Open the installer and follow the setup prompts.', 'Launch Pauzos and create your first reminder to start the trial.']
  },
  'mac-dmg': {
    os: 'mac', name: 'macOS Universal', version: '1.0.34', option: 'Universal installer (.dmg)', file: 'Personal-Reminder-Assistant-1.0.34-mac.dmg',
    description: 'One download for Apple Silicon and Intel Macs.', spec: 'macOS · Intel + Apple Silicon · .dmg · 188 MB',
    steps: ['Save and open the disk image on your Mac.', 'Drag Personal Reminder Assistant into Applications.', 'Open Pauzos to start your trial. See the official guide for installation help.']
  },
  'mac-zip': {
    os: 'mac', name: 'macOS ZIP', version: '1.0.34', option: 'Universal archive (.zip)', file: 'Personal-Reminder-Assistant-1.0.34-mac.zip',
    description: 'A ZIP archive for Apple Silicon and Intel Macs.', spec: 'macOS · Intel + Apple Silicon · .zip · 181 MB',
    steps: ['Save and extract the ZIP archive on your Mac.', 'Move Personal Reminder Assistant to Applications.', 'Open Pauzos to start your trial. See the official guide for installation help.']
  },
  'linux-appimage': {
    os: 'linux', name: 'Linux AppImage', version: '1.0.34', option: 'Standalone AppImage (.AppImage)', file: 'Personal-Reminder-Assistant-1.0.34.AppImage',
    description: 'A standalone app for compatible Linux desktop distributions.', spec: 'Linux · AppImage · 115 MB',
    steps: ['Save the AppImage to your computer.', 'In file properties, allow the file to run as a program.', 'Open the AppImage and create your first reminder to start the trial.']
  },
  'linux-deb': {
    os: 'linux', name: 'Linux Debian package', version: '1.0.34', option: 'Debian / Ubuntu package (.deb)', file: 'Personal-Reminder-Assistant-1.0.34.deb',
    description: 'Install the desktop app on Debian or Ubuntu using your package manager.', spec: 'Linux · Debian / Ubuntu · .deb · 77 MB',
    steps: ['Save the Debian package to your computer.', 'Install the package with your software installer.', 'Open Pauzos from your applications to start the trial.']
  }
};
const osNames = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };
const formatSelect = document.querySelector('#download-format');
const downloadLink = document.querySelector('#download-link');

function selectEdition() {
  const edition = editions[formatSelect.value];
  document.querySelector('#edition-title').textContent = edition.name;
  document.querySelector('#edition-description').textContent = edition.description;
  document.querySelector('#edition-spec').textContent = edition.spec;
  const version = edition.version || '1.0.29';
  document.querySelector('#edition-version').textContent = `v${version}`;
  downloadLink.href = `${releaseBase}v${version}/${edition.file}`;
  downloadLink.replaceChildren(document.createTextNode(`Download for ${osNames[edition.os]} `));
  const arrow = document.createElement('span');
  arrow.textContent = '↓';
  arrow.setAttribute('aria-hidden', 'true');
  downloadLink.append(arrow);
  const steps = document.querySelector('#install-steps');
  steps.replaceChildren(...[...edition.steps, "Open All Reminders and add a new reminder. Enter a title, repeat schedule, and time, then save.", "Check Today’s Agenda and use the test-alert control to preview a notification.", "Keep Pauzos running and your computer awake. Complete, snooze, or skip alerts; review actions in Audit & Reports."].map(step => {
    const item = document.createElement('li');
    item.textContent = step;
    return item;
  }));
  document.querySelector('#download-feedback').hidden = true;
}

function selectOs(os) {
  document.querySelectorAll('[data-os]').forEach(button => {
    const selected = button.dataset.os === os;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const options = Object.entries(editions).filter(([, edition]) => edition.os === os).map(([key, edition]) => new Option(edition.option, key));
  formatSelect.replaceChildren(...options);
  selectEdition();
}

document.querySelectorAll('[data-os]').forEach(button => {
  button.addEventListener('click', () => selectOs(button.dataset.os));
});
formatSelect.addEventListener('change', selectEdition);

const userAgent = navigator.userAgent;
const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1);
const detectedOs = /Windows/i.test(userAgent) ? 'windows' : /Macintosh|Mac OS X/i.test(userAgent) ? 'mac' : /Linux/i.test(userAgent) ? 'linux' : null;
if (isMobile) {
  document.querySelector('#os-detected').textContent = 'Pauzos is a desktop app. Choose your computer’s operating system.';
} else if (detectedOs) {
  selectOs(detectedOs);
  document.querySelector('#os-detected').textContent = `${osNames[detectedOs]} detected. You can choose a different system.`;
}

downloadLink.addEventListener('click', () => {
  const edition = editions[formatSelect.value];
  const feedback = document.querySelector('#download-feedback');
  const retry = document.createElement('a');
  retry.href = downloadLink.href;
  retry.textContent = 'Try the direct download again';
  feedback.replaceChildren(document.createTextNode(`Opening the official ${edition.name} download. If no file appears in your Downloads folder, `), retry, document.createTextNode('. Installation help is below.'));
  feedback.hidden = false;
  document.querySelector('.install-help').open = true;
});

document.querySelector('#copy-desktop-link').addEventListener('click', async () => {
  const url = new URL(window.location.href);
  url.hash = 'download';
  const status = document.querySelector('#copy-feedback');
  const fallback = document.querySelector('#copy-fallback');
  try {
    await navigator.clipboard.writeText(url.href);
    status.textContent = 'Link copied. Open it on your desktop computer.';
    fallback.hidden = true;
  } catch {
    fallback.value = url.href;
    fallback.hidden = false;
    fallback.focus();
    fallback.select();
    status.textContent = 'Select and copy this link to open it on your computer.';
  }
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = expanded;
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    document.querySelector('#mobile-download').classList.toggle('is-hidden', entries[0].isIntersecting);
  }, { threshold: 0.05 });
  observer.observe(document.querySelector('#download'));
}

// Hero rotation is independent of the lower interactive reminder demo.
(() => {
 const tour=document.querySelector('.hero-app-tour');
 const tabs=[...document.querySelectorAll('[data-hero-tab]')];
 const toggle=document.querySelector('#hero-tour-toggle');
 const descriptions=['See your scheduled, completed, pending, and snoozed reminders.','Manage repeat schedules, categories, priorities, and active routines.','Set reminders for hydration, eye breaks, and movement.','Review completed, snoozed, and skipped actions. Export your records.','Plan by business day and configure holidays around your schedule.'];
 let active=0,timer=null,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true;
 function stop(){clearTimeout(timer);timer=null;tour.classList.remove('is-playing');}
 function schedule(){stop();toggle.textContent=playing?'Pause tour Ⅱ':'Play tour ▷';if(playing&&visible&&!document.hidden){void tour.offsetWidth;tour.classList.add('is-playing');timer=setTimeout(()=>select((active+1)%tabs.length),6000);}}
 function select(index){active=index;tabs.forEach((tab,i)=>{const selected=i===index;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;});document.querySelector('#hero-tour-description').textContent=descriptions[index];document.querySelector('#hero-tour-count').textContent=`0${index+1} / 05`;schedule();}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>{playing=false;select(i);});tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?4:(i+(e.key==='ArrowRight'?1:-1)+5)%5;playing=false;select(n);tabs[n].focus();}});});
 toggle.addEventListener('click',()=>{playing=!playing;schedule();});
 tour.addEventListener('focusin',e=>{if(e.target!==toggle&&playing){playing=false;schedule();}});
 document.addEventListener('visibilitychange',schedule);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(tour);
 schedule();
})();

// All screenshots share one appearance and the same sample reminder data.
document.querySelectorAll('[data-app-theme]').forEach(button => {
  button.addEventListener('click', () => {
    appScreenshotTheme = button.dataset.appTheme;
    document.querySelectorAll('[data-app-theme]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-app-screen]').forEach(image => {
      const name = image.dataset.appScreen;
      image.src = `assets/${name}-${appScreenshotTheme}.webp`;
      image.srcset = `assets/${name}-${appScreenshotTheme}-720.webp 720w, assets/${name}-${appScreenshotTheme}.webp 1440w`;
      image.closest('a').href = image.src;
    });
    document.querySelector('#screenshot-expand').href = document.querySelector('#product-screenshot').src;
  });
});
