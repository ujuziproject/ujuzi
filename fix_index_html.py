import re
with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('family=Montserrat:wght@400;500;600;700;800;900', 'family=Space+Grotesk:wght@500;600;700;800')

with open('index.html', 'w') as f:
    f.write(content)
