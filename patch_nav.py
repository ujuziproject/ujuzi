import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add onNavigate to signature
content = content.replace(
    "export function Dashboard({ name, userId, track }: DashboardProps & { track?: string }) {",
    "export function Dashboard({ name, userId, track, onNavigate }: DashboardProps & { track?: string, onNavigate?: (view: 'dashboard' | 'curricula' | 'progress' | 'profile') => void }) {"
)

# Add onClick to Progress Report button
content = content.replace(
    '<button className="px-5 py-3 rounded-full border border-border text-sm font-bold bg-white text-ink hover:bg-surface flex items-center gap-2 transition-colors">',
    '<button onClick={() => onNavigate && onNavigate(\'progress\')} className="px-5 py-3 rounded-full border border-border text-sm font-bold bg-white text-ink hover:bg-surface flex items-center gap-2 transition-colors">'
)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

# Pass down onNavigate in MainApp
content = content.replace(
    '<Dashboard name={name} userId={userId} track={track} />',
    '<Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />'
)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)
