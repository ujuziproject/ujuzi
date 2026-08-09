import fs from 'fs';
let ud = fs.readFileSync('src/components/UniversityDropdown.tsx', 'utf-8');

ud = ud.replace(
  "const [searchTerm, setSearchTerm] = useState(value ? 'Loading...' : '');",
  "const [searchTerm, setSearchTerm] = useState('');\n  useEffect(() => {\n    if (value && universities.length > 0) {\n      const u = universities.find(x => x.id === value);\n      if (u) setSearchTerm(u.name);\n    } else if (!value) {\n      setSearchTerm('');\n    }\n  }, [value, universities]);"
);

// Remove the other duplicate useEffect
ud = ud.replace(
  /  useEffect\(\(\) => \{\n    if \(value && universities\.length > 0\) \{\n      const u = universities\.find\(x => x\.id === value\);\n      if \(u\) setSearchTerm\(u\.name\);\n    \}\n  \}, \[value, universities\]\);\n/,
  ""
);
ud = ud.replace(
  /  useEffect\(\(\) => \{\n    if \(value && universities\.length > 0\) \{\n      const selected = universities\.find\(u => u\.id === value\);\n      if \(selected\) \{\n        setSearchTerm\(selected\.name\);\n      \}\n    \}\n  \}, \[value, universities\]\);\n/,
  ""
);

fs.writeFileSync('src/components/UniversityDropdown.tsx', ud);
