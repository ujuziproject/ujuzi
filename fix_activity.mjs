import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
m = m.replace(
  "import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon, Sun, Search, Bell, Library, CheckSquare, Calendar, BookOpen } from 'lucide-react';",
  "import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon, Sun, Search, Bell, Library, CheckSquare, Calendar, BookOpen, Activity } from 'lucide-react';"
);
fs.writeFileSync('src/components/MainApp.tsx', m);
