import re

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

old_sidebar = "label={track === 'university' ? 'Semesters' : 'Curricula'}"
new_sidebar = "label={track === 'university' ? 'Semesters' : track === 'independent' ? 'My Goals' : 'Curricula'}"
content = content.replace(old_sidebar, new_sidebar)

old_routes = """          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track !== 'university' && <MyCurricula userId={userId} />}"""

new_routes = """          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
          {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}"""
content = content.replace(old_routes, new_routes)

# Need to import MyGoals
import_line = "import { MySemesters } from './MySemesters';"
import_line_new = "import { MySemesters } from './MySemesters';\nimport { MyGoals } from './MyGoals';"
content = content.replace(import_line, import_line_new)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)
