with open('src/components/LandingPage.css', 'r') as f:
    content = f.read()

dark_vars = """
.dark {
  --ink: #F5F4FA;
  --ink-2: #E4E1F5;
  --ink-3: #C8C2E6;
  --surface: #0F0B2E;
  --surface-alt: #1A1449;
  --accent-primary: #8E84F5;
  --accent-primary-soft: #241C63;
  --accent-warm: #F8C370;
  --accent-warm-soft: #423010;
  --success: #4ADE80;
  --success-soft: #1A3A2F;
  --border: #241C63;
  --text-primary: #F5F4FA;
  --text-secondary: rgba(245, 244, 250, 0.7);
  --text-on-ink: #0F0B2E;
  --text-on-ink-soft: rgba(15, 11, 46, 0.72);
}
"""

if '.dark {' not in content:
    # Insert after :root block
    idx = content.find('}') + 1
    content = content[:idx] + dark_vars + content[idx:]
    with open('src/components/LandingPage.css', 'w') as f:
        f.write(content)
