import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const target1 = `type CurriculumWithProgress = Curriculum & {
  topic_count: number;
  progress: number;
};`;

const replacement1 = `type CurriculumWithProgress = Curriculum & {
  topic_count: number;
  progress: number;
  nextTopic?: { id: string; title: string };
};`;

content = content.replace(target1, replacement1);
fs.writeFileSync('src/components/Dashboard.tsx', content);
