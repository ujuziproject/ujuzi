import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const target1 = `  nextTopic?: { id: string; title: string };`;
const replacement1 = `  nextTopic?: string;`;

content = content.replace(target1, replacement1);
fs.writeFileSync('src/components/Dashboard.tsx', content);
