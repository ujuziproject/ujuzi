import fs from 'fs';

let content = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

// Insert the short-circuit right before the step 1 UI logic
const checkIndex = content.indexOf('// Step 1: Select Container (if applicable and multiple exist)');
const earlyReturn = `
  if (track === 'secondary') {
    return <CurriculumUpload userId={userId} onUploadComplete={onUploadComplete} />;
  }

  `;
content = content.substring(0, checkIndex) + earlyReturn + content.substring(checkIndex);

fs.writeFileSync('src/components/GlobalUploadFlow.tsx', content);
