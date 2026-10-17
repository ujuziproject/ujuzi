const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

css = css.replace(/border: 1\.5px solid rgba\(255,255,255,0\.25\)/g, 'border: 1.5px solid var(--on-ink-trans-25)');
css = css.replace(/background: rgba\(255,255,255,0\.06\)/g, 'background: var(--on-ink-trans-6)');
css = css.replace(/background: rgba\(255,255,255,0\.96\)/g, 'background: var(--nav-bg)');
css = css.replace(/rgba\(255,255,255,0\.06\)/g, 'var(--on-ink-trans-6)');
css = css.replace(/rgba\(255,255,255,0\.05\)/g, 'var(--on-ink-trans-5)');
css = css.replace(/rgba\(255,255,255,0\.04\)/g, 'var(--on-ink-trans-5)');
css = css.replace(/rgba\(255,255,255,0\.1\)/g, 'var(--on-ink-trans-10)');
css = css.replace(/rgba\(255,255,255,0\.5\)/g, 'var(--on-ink-trans-50)');
css = css.replace(/rgba\(255,255,255,0\.08\)/g, 'var(--on-ink-trans-8)');
css = css.replace(/rgba\(255,255,255,0\.85\)/g, 'var(--on-ink-trans-85)');

// Replace hardcoded #fff with var(--text-on-ink) EXCEPT for the ones that MUST be white
css = css.replace(/color: #fff;/g, 'color: var(--text-on-ink);');
css = css.replace(/background: #fff;/g, 'background: var(--text-on-ink);');

// Revert exceptions
css = css.replace(/color: var\(--text-on-ink\); box-shadow: 0 8px 22px -6px rgba\(91,79,232,0\.55\);/g, 'color: #fff; box-shadow: 0 8px 22px -6px rgba(91,79,232,0.55);');
css = css.replace(/\.logo-mark \{\n  width: 30px; height: 30px; border-radius: 8px;\n  background: var\(--accent-primary\); color: var\(--text-on-ink\);/g, '.logo-mark {\n  width: 30px; height: 30px; border-radius: 8px;\n  background: var(--accent-primary); color: #fff;');
css = css.replace(/\.step-item\.active \.step-num \{ background: var\(--accent-primary\); color: var\(--text-on-ink\); \}/g, '.step-item.active .step-num { background: var(--accent-primary); color: #fff; }');
css = css.replace(/\.carousel-btn:hover \{ background: var\(--accent-primary\); color: var\(--text-on-ink\); border-color: var\(--accent-primary\); \}/g, '.carousel-btn:hover { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }');
css = css.replace(/\.faq-item\.open \.faq-icon \{ transform: rotate\(45deg\); background: var\(--accent-primary\); color: var\(--text-on-ink\); \}/g, '.faq-item.open .faq-icon { transform: rotate(45deg); background: var(--accent-primary); color: #fff; }');

fs.writeFileSync('src/components/LandingPage.css', css);
