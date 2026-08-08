import re
with open('src/index.css', 'r') as f:
    content = f.read()

new_theme = """@theme {
  --color-ink: #0F0B2E;
  --color-surface: #F5F4FA;
  --color-accent: #5B4FE8;
  --color-accent-warm: #F5A623;
  --color-success: #2FBF8F;
  --color-border: #E4E1F5;
  --font-sans: "Inter", sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}"""

content = re.sub(r'@theme \{.*?\}', new_theme, content, flags=re.DOTALL)

with open('src/index.css', 'w') as f:
    f.write(content)
