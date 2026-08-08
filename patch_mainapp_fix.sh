#!/bin/bash
python3 -c '
with open("src/components/MainApp.tsx", "r") as f:
    text = f.read()

bad1 = "{currentView === '"'"'curricula'"'"' {currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />}{currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />} track === '"'"'university'"'"' {currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />}{currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />} <MySemesters userId={userId} />}"
bad2 = "{currentView === '"'"'curricula'"'"' {currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />}{currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />} track !== '"'"'university'"'"' {currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />}{currentView === '"'"'curricula'"'"' && <MyCurricula userId={userId} />} <MyCurricula userId={userId} />}"

text = text.replace(bad1, "{currentView === '"'"'curricula'"'"' && track === '"'"'university'"'"' && <MySemesters userId={userId} />}")
text = text.replace(bad2, "{currentView === '"'"'curricula'"'"' && track !== '"'"'university'"'"' && <MyCurricula userId={userId} />}")

with open("src/components/MainApp.tsx", "w") as f:
    f.write(text)
'
