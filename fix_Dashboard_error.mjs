import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const regex = /const \[curricula, setCurricula\] = useState<\(Curriculum useState.*?\(\[\]\);/g;

content = content.replace("const [curricula, setCurricula] = useState<(Curriculum useState<(Curriculum & { topic_count: number; progress: number })[]>( { topic_count: number; progress: number; nextTopic?: string })[]>([]);", "const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number; nextTopic?: string })[]>([]);");

fs.writeFileSync('src/components/Dashboard.tsx', content);
