import fs from 'fs';
let content = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

const regex = /return \(\s*\{track === 'secondary' \?\s*\(\s*<CurriculumUpload[\s\S]*?\/>\s*\)\s*:\s*\(\s*<CourseUpload[\s\S]*?\/>\s*\)\}\s*\);/m;

const newCode = `return track === 'secondary' ? (
      <CurriculumUpload userId={userId} onUploadComplete={onUploadComplete} />
    ) : (
      <CourseUpload 
        userId={userId} 
        bulk={uploadType === 'bulk'} 
        semesterId={track === 'university' && selectedContainer ? selectedContainer : undefined}
        goalId={track === 'independent' && selectedContainer ? selectedContainer : undefined}
        onUploadComplete={onUploadComplete} 
      />
    );`;

if (regex.test(content)) {
  content = content.replace(regex, newCode);
  fs.writeFileSync('src/components/GlobalUploadFlow.tsx', content);
} else {
  console.log("Could not find regex match!");
  // fallback string replace
  content = content.replace(/\{\s*track === 'secondary'/g, "track === 'secondary'");
  content = content.replace(/onUploadComplete\} \n      \/>\n    \)\}\n  \);/g, "onUploadComplete} \n      />\n    )\n  );");
  fs.writeFileSync('src/components/GlobalUploadFlow.tsx', content);
}

