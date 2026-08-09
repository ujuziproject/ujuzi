import fs from 'fs';
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
m = m.replace(
  "import FlashcardReviewer from './FlashcardReviewer';",
  "import { FlashcardReviewer } from './FlashcardReviewer';"
);
fs.writeFileSync('src/components/MainApp.tsx', m);
