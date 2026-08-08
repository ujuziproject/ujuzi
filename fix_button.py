with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()
content = content.replace("+ Add Curriculum", "+ Add Materials")
with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
