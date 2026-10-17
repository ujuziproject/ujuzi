import fs from 'fs';

let content = fs.readFileSync('src/components/CurriculumResults.tsx', 'utf-8');

content = content.replace(
  'interface CurriculumResultsProps {\n  curriculumId?: string;\n  courseId?: string;\n  userId: string;\n  initialTopicId?: string;\n}',
  'interface CurriculumResultsProps {\n  curriculumId?: string;\n  courseId?: string;\n  userId: string;\n  initialTopicId?: string;\n  onBack?: () => void;\n}'
);

content = content.replace(
  'export function CurriculumResults({ curriculumId, courseId, userId, initialTopicId }: CurriculumResultsProps) {',
  'export function CurriculumResults({ curriculumId, courseId, userId, initialTopicId, onBack }: CurriculumResultsProps) {'
);

const oldOnBack = `onBack={() => {
          setSelectedTopic(null);
          // Reload data to update stats in background without blocking UI
          setRefreshKey(prev => prev + 1);
        }}`;

const newOnBack = `onBack={() => {
          if (initialTopicId && onBack) {
            onBack();
          } else {
            setSelectedTopic(null);
            // Reload data to update stats in background without blocking UI
            setRefreshKey(prev => prev + 1);
          }
        }}`;

content = content.replace(oldOnBack, newOnBack);

fs.writeFileSync('src/components/CurriculumResults.tsx', content);
