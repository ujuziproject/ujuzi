import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

const imports = "import { Planner } from './Planner';\n";
content = content.replace("import { Dashboard } from './Dashboard';", imports + "import { Dashboard } from './Dashboard';");

const oldMain = "{currentView === 'profile' && <Profile userId={userId} />}";
const newMain = "{currentView === 'progress' && <Progress userId={userId} />}\n              {currentView === 'planner' && <Planner userId={userId} />}\n              {currentView === 'profile' && <Profile userId={userId} />}";
content = content.replace("{currentView === 'profile' && <Profile userId={userId} />}", newMain);

// Also fix the standalone view
const oldMain2 = "{currentView === 'progress' && <Progress userId={userId} />}";
const newMain2 = "{currentView === 'progress' && <Progress userId={userId} />}\n          {currentView === 'planner' && <Planner userId={userId} />}";
// content = content.replace("{currentView === 'progress' && <Progress userId={userId} />}", newMain2); // Need to be careful with replace

fs.writeFileSync('src/components/MainApp.tsx', content);
