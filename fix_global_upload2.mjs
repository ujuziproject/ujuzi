import fs from 'fs';

let content = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

content = content.replace(
  "if (!selectedContainer && track !== 'university' && goals.length === 0) {",
  "if (!selectedContainer && track === 'independent' && goals.length === 0) {"
);

fs.writeFileSync('src/components/GlobalUploadFlow.tsx', content);
