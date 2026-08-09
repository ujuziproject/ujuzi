import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

if (!m.includes('import FlashcardReviewer')) {
  m = m.replace(
    "import { Dashboard } from './Dashboard';",
    "import { Dashboard } from './Dashboard';\nimport FlashcardReviewer from './FlashcardReviewer';"
  );
}

m = m.replace(
  "{currentView === 'progress' && <Progress userId={userId} />}",
  `{currentView === 'flashcards' && <FlashcardReviewer userId={userId} />}
          {currentView === 'progress' && <Progress userId={userId} />}`
);

fs.writeFileSync('src/components/MainApp.tsx', m);
