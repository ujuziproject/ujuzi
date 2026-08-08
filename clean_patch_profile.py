import re

with open('src/components/Profile.tsx', 'r') as f:
    content = f.read()

# Let's check if the previous patch was applied.
if "setContentFormat(" in content:
    print("Already patched partially. Let's fix.")
else:
    print("Not patched yet.")
