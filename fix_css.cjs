const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

const lines = css.split('\n');
let inRoot = false;
let inDark = false;
const newLines = [];

for (let line of lines) {
  if (line.includes(':root {')) inRoot = true;
  if (line === '}') { inRoot = false; inDark = false; }
  if (line.includes('.dark {')) inDark = true;
  
  if (line.includes('--nav-bg: ') || line.includes('--on-ink-trans')) {
     continue;
  }
  newLines.push(line);
}

fs.writeFileSync('src/components/LandingPage.css', newLines.join('\n'));
