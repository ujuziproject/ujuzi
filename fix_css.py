import re
with open('src/index.css', 'r') as f:
    content = f.read()

content = content.replace('--color-accent: #E53935;', '--color-accent: #5B4FE8;')

with open('src/index.css', 'w') as f:
    f.write(content)
