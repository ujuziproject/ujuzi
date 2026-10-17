const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

// The user is requesting to apply color: #ffffff to the hero h1. 
// It currently uses var(--text-on-ink). 
// Since they explicitly requested it via the focus mode, we will apply it directly.
css = css.replace(/\.landing-page \.hero h1 \{\n  font-size: 88px; font-weight: 800; color: var\(--text-on-ink\); margin-bottom: 28px;/g, '.landing-page .hero h1 {\n  font-size: 88px; font-weight: 800; color: #ffffff; margin-bottom: 28px;');

// Also remove it from the global h1 override block we added earlier
css = css.replace(/\.landing-page \.hero h1,\n/g, '');

fs.writeFileSync('src/components/LandingPage.css', css);
