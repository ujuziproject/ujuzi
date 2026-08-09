import fs from 'fs';
let f = fs.readFileSync('src/components/FlashcardReviewer.tsx', 'utf-8');

f = f.replace(
  '}, [userId, internalCards]);',
  '}, [userId, flashcards]);'
);

fs.writeFileSync('src/components/FlashcardReviewer.tsx', f);
