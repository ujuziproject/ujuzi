const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

const rootVars = `  --nav-bg: rgba(255,255,255,0.96);
  --on-ink-trans-5: rgba(255,255,255,0.05);
  --on-ink-trans-6: rgba(255,255,255,0.06);
  --on-ink-trans-8: rgba(255,255,255,0.08);
  --on-ink-trans-10: rgba(255,255,255,0.1);
  --on-ink-trans-25: rgba(255,255,255,0.25);
  --on-ink-trans-50: rgba(255,255,255,0.5);
  --on-ink-trans-85: rgba(255,255,255,0.85);`;

const darkVars = `  --nav-bg: rgba(15, 11, 46, 0.96);
  --on-ink-trans-5: rgba(15, 11, 46, 0.05);
  --on-ink-trans-6: rgba(15, 11, 46, 0.06);
  --on-ink-trans-8: rgba(15, 11, 46, 0.08);
  --on-ink-trans-10: rgba(15, 11, 46, 0.1);
  --on-ink-trans-25: rgba(15, 11, 46, 0.25);
  --on-ink-trans-50: rgba(15, 11, 46, 0.5);
  --on-ink-trans-85: rgba(15, 11, 46, 0.85);`;

css = css.replace(/--font-mono: [^;]+;/, match => match + '\n' + rootVars);
css = css.replace(/--text-on-ink-soft: [^;]+;/, match => match + '\n' + darkVars);

fs.writeFileSync('src/components/LandingPage.css', css);
