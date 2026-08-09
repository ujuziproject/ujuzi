import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
m = m.replace(
  "{(currentView === 'flashcards' || currentView === 'progress') && <Progress userId={userId} />}",
  "{currentView === 'flashcards' && <FlashcardReviewer userId={userId} flashcards={[]} />}\n          {currentView === 'progress' && <Progress userId={userId} />}"
);
fs.writeFileSync('src/components/MainApp.tsx', m);
