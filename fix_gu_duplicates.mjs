import fs from 'fs';
let m = fs.readFileSync('src/components/GlobalUploadFlow.tsx', 'utf-8');
const dup = `  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');`;

const correct = `  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');`;

if (m.includes(dup)) {
    m = m.replace(dup, correct);
} else {
    // maybe formatted slightly differently
    m = m.replace(/const \[newGoalTitle, setNewGoalTitle\] = useState\(''\);\s*const \[newGoalCategory, setNewGoalCategory\] = useState\(''\);\s*const \[newGoalDate, setNewGoalDate\] = useState\(''\);\s*const \[newGoalTitle, setNewGoalTitle\] = useState\(''\);\s*const \[newGoalCategory, setNewGoalCategory\] = useState\(''\);\s*const \[newGoalDate, setNewGoalDate\] = useState\(''\);/, correct);
}
fs.writeFileSync('src/components/GlobalUploadFlow.tsx', m);
