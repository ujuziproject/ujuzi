with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

import_lucide = "import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon } from 'lucide-react';"
import_lucide_new = "import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';\nimport { useTheme } from './ThemeProvider';"
content = content.replace(import_lucide, import_lucide_new)

def_main = "export function MainApp({ name, userId, onLogout }: MainAppProps) {\n"
def_main_new = "export function MainApp({ name, userId, onLogout }: MainAppProps) {\n  const { theme, toggleTheme } = useTheme();\n"
content = content.replace(def_main, def_main_new)

button_old = """<button className="hidden md:block text-ink hover:text-accent transition-colors"><Moon className="w-5 h-5" /></button>"""
button_new = """<button onClick={toggleTheme} className="hidden md:block text-ink hover:text-accent transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>"""
content = content.replace(button_old, button_new)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)
