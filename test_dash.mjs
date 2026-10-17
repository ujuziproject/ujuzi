import { readFileSync } from 'fs';
let content = readFileSync('src/components/Dashboard.tsx', 'utf-8');
console.log(content.includes('targetDate'));
