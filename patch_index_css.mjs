import fs from 'fs';
let c = fs.readFileSync('src/index.css', 'utf-8');

if (!c.includes('@custom-variant dark')) {
  c = c.replace(
    '@theme {',
    '@custom-variant dark (&:where(.dark, .dark *));\n\n@theme {'
  );
  fs.writeFileSync('src/index.css', c);
}
