import fs from 'fs';

let content = fs.readFileSync('src/components/CurriculumUpload.tsx', 'utf-8');
const useEffectCode = `
  useEffect(() => {
    const draft = sessionStorage.getItem('curriculumDraftText');
    if (draft) {
       setText(draft);
       setInputType('text');
       sessionStorage.removeItem('curriculumDraftText');
    }
  }, []);
`;
content = content.replace("const [findingCurriculum, setFindingCurriculum] = useState(false);", "const [findingCurriculum, setFindingCurriculum] = useState(false);\n" + useEffectCode);
fs.writeFileSync('src/components/CurriculumUpload.tsx', content);

let content2 = fs.readFileSync('src/components/CourseUpload.tsx', 'utf-8');
content2 = content2.replace("const [findingCurriculum, setFindingCurriculum] = useState(false);", "const [findingCurriculum, setFindingCurriculum] = useState(false);\n" + useEffectCode);
fs.writeFileSync('src/components/CourseUpload.tsx', content2);
