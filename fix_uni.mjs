import fs from 'fs';
let m = fs.readFileSync('src/components/UniversityDropdown.tsx', 'utf-8');

// Fix padding for icon
m = m.replace(/px-4 py-3/g, 'pl-10 pr-4 py-3');

// Fix initial name load
m = m.replace(
  "interface UniversityDropdownProps {",
  "interface UniversityDropdownProps {\n  initialName?: string;"
);

m = m.replace(
  "export function UniversityDropdown({ value, onChange, className }: UniversityDropdownProps) {",
  "export function UniversityDropdown({ value, onChange, className, initialName }: UniversityDropdownProps) {\n  useEffect(() => { if (initialName && !searchTerm) setSearchTerm(initialName); }, [initialName]);"
);

fs.writeFileSync('src/components/UniversityDropdown.tsx', m);
