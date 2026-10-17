import fs from 'fs';

let content = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

content = content.replace(
  "return (\n      {track === 'secondary' ?",
  "return (\n      track === 'secondary' ?"
);

// also check if there is a closing bracket to fix
// Wait, I replaced exactly this:
// const newReturn = `{track === 'secondary' ? (...
// The original was: return (\n <CourseUpload ... /> \n);
// Let's replace the whole block again.
