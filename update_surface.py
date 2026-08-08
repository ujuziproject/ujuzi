with open('src/components/MainApp.tsx', 'r') as f:
    lines = f.readlines()

for i in [166, 199, 210]: # 0-indexed
    lines[i] = lines[i].replace('bg-surface', 'bg-surface-alt')

with open('src/components/MainApp.tsx', 'w') as f:
    f.writelines(lines)
