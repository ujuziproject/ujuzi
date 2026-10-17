import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add avatar_url to state
content = content.replace("  const [name, setName] = useState<string>('');", "  const [name, setName] = useState<string>('');\n  const [avatarUrl, setAvatarUrl] = useState<string>('');")

# Fetch avatar_url
content = content.replace(".select('full_name')", ".select('full_name, avatar_url')")
content = content.replace("      if (profile?.full_name) {\n        setName(profile.full_name);\n      }", "      if (profile?.full_name) {\n        setName(profile.full_name);\n      }\n      if (profile?.avatar_url) {\n        setAvatarUrl(profile.avatar_url);\n      }")

# Pass avatarUrl to MainApp
content = content.replace("<MainApp name={name} userId={userId} onLogout={handleLogOut} />", "<MainApp name={name} avatarUrl={avatarUrl} userId={userId} onLogout={handleLogOut} />")

with open('src/App.tsx', 'w') as f:
    f.write(content)
