import fs from 'fs';
let f = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
f = f.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [track, setTrack] = useState<string>("secondary");'
);
f = f.replace(
  "const track = profile?.track || 'secondary';",
  "const currentTrack = profile?.track || 'secondary';\n      setTrack(currentTrack);"
);
f = f.replace(
  "if (track === 'university') {",
  "if (currentTrack === 'university') {"
);
f = f.replace(
  "} else if (track === 'independent') {",
  "} else if (currentTrack === 'independent') {"
);
fs.writeFileSync('src/components/MyCourses.tsx', f);
