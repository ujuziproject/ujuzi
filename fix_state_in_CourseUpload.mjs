import fs from 'fs';
let content = fs.readFileSync('src/components/CourseUpload.tsx', 'utf-8');

const target1 = "  const [status, setStatus] = useState<'idle' | 'parsing'>('idle');";
const replacement1 = `  const [status, setStatus] = useState<'idle' | 'parsing' | 'diagnostic' | 'generating' | 'success'>('idle');
  const [savedTopics, setSavedTopics] = useState<any[]>([]);`;

content = content.replace(target1, replacement1);
fs.writeFileSync('src/components/CourseUpload.tsx', content);
