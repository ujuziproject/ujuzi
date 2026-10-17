const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

const newLogoStyles = '.landing-page .logo { display: flex; align-items: center; gap: 10px; font-family: system-ui; font-weight: 700; font-size: 34px; font-style: normal; text-decoration: none; line-height: 27px; }';

css = css.replace(/\.landing-page \.logo \{[^\}]+\}/g, newLogoStyles);

fs.writeFileSync('src/components/LandingPage.css', css);
