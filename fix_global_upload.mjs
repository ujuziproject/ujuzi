import fs from 'fs';

let content = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');

const oldImport = "import { CourseUpload } from './CourseUpload';";
const newImport = "import { CourseUpload } from './CourseUpload';\nimport { CurriculumUpload } from './CurriculumUpload';";
content = content.replace(oldImport, newImport);

const returnStep3Regex = /<CourseUpload[\s\S]*?\/>/;
const newReturn = `{track === 'secondary' ? (
      <CurriculumUpload userId={userId} onUploadComplete={onUploadComplete} />
    ) : (
      <CourseUpload 
        userId={userId} 
        bulk={uploadType === 'bulk'} 
        semesterId={track === 'university' && selectedContainer ? selectedContainer : undefined}
        goalId={track === 'independent' && selectedContainer ? selectedContainer : undefined}
        onUploadComplete={onUploadComplete} 
      />
    )}`;

content = content.replace(returnStep3Regex, newReturn);

fs.writeFileSync('src/components/GlobalUploadFlow.tsx', content);
