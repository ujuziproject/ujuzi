import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
m = m.replace(
  /<SidebarItem active=\{currentView === 'flashcards'\} icon=\{<Library className="w-\[18px\] h-\[18px\]" \/>\} label="Flashcards" onClick=\{[^}]+\} \/>\n/g,
  ""
);
m = m.replace(
  /<SidebarItem active=\{currentView === 'quizzes'\} icon=\{<CheckSquare className="w-\[18px\] h-\[18px\]" \/>\} label="Quizzes" onClick=\{[^}]+\} \/>\n/g,
  ""
);
fs.writeFileSync('src/components/MainApp.tsx', m);
