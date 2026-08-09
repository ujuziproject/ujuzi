import re

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface MainAppProps {\n  name: string;", "interface MainAppProps {\n  name: string;\n  avatarUrl?: string;")
content = content.replace("export function MainApp({ name, userId, onLogout }: MainAppProps) {", "export function MainApp({ name, avatarUrl, userId, onLogout }: MainAppProps) {")

avatar_ui = """           <button onClick={() => setCurrentView('profile')} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#7C6FF0] text-white flex items-center justify-center font-semibold text-[13px] cursor-pointer overflow-hidden border-2 border-transparent hover:border-accent transition-all">
             {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (name ? name.charAt(0).toUpperCase() : 'U')}
           </button>"""

content = re.sub(r'<button onClick=\{\(\) => setCurrentView\(\'profile\'\)\} className="w-10 h-10 rounded-full bg-gradient-to-br from-\[#5B4FE8\] to-\[#7C6FF0\] text-white flex items-center justify-center font-semibold text-\[13px\] cursor-pointer">\s*\{name \? name\.charAt\(0\)\.toUpperCase\(\) : \'U\'\}\s*</button>', avatar_ui, content)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)

