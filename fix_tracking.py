import re

with open('src/lib/tracking.ts', 'r') as f:
    content = f.read()

target = """            navigator.sendBeacon(
                `${supabaseUrl}/rest/v1/study_sessions?id=eq.${sessionId}`,
                new Blob([body], { type: 'application/json', headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } })
            );"""

replacement = """            fetch(`${supabaseUrl}/rest/v1/study_sessions?id=eq.${sessionId}`, {
                method: 'PATCH',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: body
            });"""

content = content.replace(target, replacement)

with open('src/lib/tracking.ts', 'w') as f:
    f.write(content)
