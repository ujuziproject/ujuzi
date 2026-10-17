import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

content = content.replace(
  'const { setCurrentView } = useNavigationStore();',
  'const { setCurrentView, setDashboardView } = useNavigationStore();'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
