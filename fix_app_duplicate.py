with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
duplicate_count = 0

for i, line in enumerate(lines):
    if "let step3Completed = false;" in line:
        duplicate_count += 1
        if duplicate_count > 1:
            skip = True
            
    if skip:
        if "return;" in line and "setLoadingSession(false);" in lines[i-1]:
            # This is the end of the block
            skip = False
            continue
        continue
        
    if "Determine if Step 3 is completed based on track" in line:
        # Check if we should skip this line too (if skip is active it's already skipped, 
        # but if it starts the block we skip it on the next line).
        # Actually it's easier to just remove lines 86 to 100.
        pass
        
with open('src/App.tsx', 'r') as f:
    lines = f.readlines()
    
# Let's just remove lines 86 to 100
del lines[85:100]

with open('src/App.tsx', 'w') as f:
    f.writelines(lines)
    
