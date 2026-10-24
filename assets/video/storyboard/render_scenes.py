import os
import subprocess
import time

html_path = "/home/anand/STRATEXA/Pauzos.com/Websites Data/assets/video/storyboard/storyboard.html"
base_dir = "/home/anand/STRATEXA/Pauzos.com/Websites Data/assets/video/storyboard"

scenes = [
    ("scene_1_chaos", "THE PROBLEM", "30 browser tabs, buried calendars & forgotten notepad reminders...", "#ef4444", 0),
    ("scene_2_solution", "THE SOLUTION", "Personal Reminder Assistant: A distraction-free workstation companion.", "#2563eb", 1),
    ("scene_3_alert", "UNMISSABLE CUT-OFF ALERT", "At cut-off time, a high-priority alert card glides onto your monitor.", "#f59e0b", 2),
    ("scene_4_complete", "COMPLIANCE & PEACE OF MIND", "One-click completed. Immutable audit logs & zero missed deadlines.", "#10b981", 3),
]

# We can render dedicated scenes by passing scene query param or editing DOM state
for name, tag, text, color, step in scenes:
    out_png = os.path.join(base_dir, f"{name}.png")
    # Write a static HTML file for this exact scene state
    with open(html_path, "r") as f:
        content = f.read()
    
    # Inject initial scene state
    state_injection = f"""
    <script>
      window.addEventListener('DOMContentLoaded', () => {{
        const bannerTag = document.getElementById('bannerTag');
        const bannerText = document.getElementById('bannerText');
        const excelWin = document.getElementById('excelWin');
        const notepadWin = document.getElementById('notepadWin');
        const browserWin = document.getElementById('browserWin');
        const appMain = document.getElementById('appMainWindow');
        const alertPopup = document.getElementById('heroAlertPopup');
        const cursor = document.getElementById('fakeCursor');

        bannerTag.style.background = '{color}';
        bannerTag.textContent = '{tag}';
        bannerText.textContent = '{text}';

        if ({step} === 0) {{
          excelWin.style.opacity = '1';
          notepadWin.style.opacity = '1';
          browserWin.style.opacity = '1';
          appMain.classList.remove('active');
          alertPopup.classList.remove('active');
          cursor.style.top = '400px'; cursor.style.left = '950px';
        }} else if ({step} === 1) {{
          excelWin.style.transform = 'scale(0.85) translate(-100px, 40px)'; excelWin.style.opacity = '0.3';
          notepadWin.style.transform = 'scale(0.85) translate(100px, 40px)'; notepadWin.style.opacity = '0.2';
          browserWin.style.transform = 'scale(0.85) translate(0, 80px)'; browserWin.style.opacity = '0.2';
          appMain.classList.add('active');
          cursor.style.top = '250px'; cursor.style.left = '700px';
        }} else if ({step} === 2) {{
          excelWin.style.transform = 'scale(0.85) translate(-100px, 40px)'; excelWin.style.opacity = '0.2';
          notepadWin.style.transform = 'scale(0.85) translate(100px, 40px)'; notepadWin.style.opacity = '0.15';
          browserWin.style.transform = 'scale(0.85) translate(0, 80px)'; browserWin.style.opacity = '0.15';
          appMain.classList.add('active');
          appMain.style.opacity = '0.4';
          alertPopup.classList.add('active');
          cursor.style.top = '960px'; cursor.style.left = '1620px';
        }} else if ({step} === 3) {{
          excelWin.style.transform = 'scale(0.85) translate(-100px, 40px)'; excelWin.style.opacity = '0.2';
          appMain.classList.add('active');
          alertPopup.classList.add('active');
          alertPopup.style.borderColor = '#10b981';
          alertPopup.querySelector('button').style.background = '#059669';
          cursor.style.top = '985px'; cursor.style.left = '1580px';
        }}
      }});
    </script>
    """
    scene_html = content.replace("</body>", state_injection + "</body>")
    temp_html = os.path.join(base_dir, f"temp_{name}.html")
    with open(temp_html, "w") as f:
        f.write(scene_html)

    cmd = [
        "google-chrome",
        "--headless",
        "--disable-gpu",
        f"--screenshot={out_png}",
        "--window-size=1920,1080",
        f"file://{temp_html}"
    ]
    subprocess.run(cmd, check=True)
    os.remove(temp_html)
    print(f"Rendered {out_png}")

