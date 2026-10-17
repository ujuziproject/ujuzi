const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Ensure tailwind config matches the new LandingPage.css --theme-ink in .dark
css = css.replace(/\.dark \{\n    --theme-ink: #F5F4FA;/g, '.dark {\n    --theme-ink: #0F0B2E;');

fs.writeFileSync('src/index.css', css);
