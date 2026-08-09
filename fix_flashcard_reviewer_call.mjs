import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
m = m.replace(
  "{currentView === 'flashcards' && <FlashcardReviewer userId={userId} />}",
  "{currentView === 'flashcards' && <FlashcardReviewer userId={userId} flashcards={[]} />}"
);
fs.writeFileSync('src/components/MainApp.tsx', m);
