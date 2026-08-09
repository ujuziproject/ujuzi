import fs from 'fs';
let ud = fs.readFileSync('src/components/UniversityDropdown.tsx', 'utf-8');

ud = ud.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState(value ? 'Loading...' : '');\n  \n  useEffect(() => {\n    if (value && universities.length > 0) {\n      const u = universities.find(x => x.id === value);\n      if (u) setSearchTerm(u.name);\n    }\n  }, [value, universities]);"
);

fs.writeFileSync('src/components/UniversityDropdown.tsx', ud);
