import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

if (!content.includes('import MyCourses')) {
  content = content.replace("import Dashboard from './Dashboard';", "import Dashboard from './Dashboard';\nimport MyCourses from './MyCourses';");
}

content = content.replace(
  "import { LayoutGrid, TrendingUp, Settings, LogOut, Sun, Moon, Target, BookOpen, Folder } from 'lucide-react';",
  "import { LayoutGrid, TrendingUp, Settings, LogOut, Sun, Moon, Target, BookOpen, Folder, CheckSquare, Calendar, Search, Bell, Library } from 'lucide-react';"
);

fs.writeFileSync('src/components/MainApp.tsx', content);
