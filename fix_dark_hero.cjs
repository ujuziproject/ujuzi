const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

// The user wants ALL sections to be dark in dark mode.
// The designer originally inverted --ink from #0F0B2E to #F5F4FA in dark mode.
// We need to change --ink back to #0F0B2E in .dark so that the hero and bands stay dark!
// We also need to change --ink-2 and --ink-3 to dark variants (they were #1A1449 and #241C63 in light mode, let's keep them the same or darker).
// And --text-on-ink should stay #FFFFFF.
// And --text-on-ink-soft should stay rgba(255,255,255,0.72).

// 1. In .dark {, replace --ink, --ink-2, --ink-3
css = css.replace(/\.dark \{\n  --ink: #F5F4FA;\n  --ink-2: #E4E1F5;\n  --ink-3: #C8C2E6;/g, '.dark {\n  --ink: #0F0B2E;\n  --ink-2: #1A1449;\n  --ink-3: #241C63;');

// 2. In .dark {, replace --text-on-ink and --text-on-ink-soft
css = css.replace(/--text-on-ink: #0F0B2E;\n  --text-on-ink-soft: rgba\(15, 11, 46, 0\.72\);/g, '--text-on-ink: #FFFFFF;\n  --text-on-ink-soft: rgba(255,255,255,0.72);');

// 3. Since --ink is now dark, the translucent vars we added to .dark (which are rgba(15, 11, 46, ...)) should ALSO be white!
// Let's replace the translucent vars in .dark
css = css.replace(/--on-ink-trans-5: rgba\(15, 11, 46, 0\.05\);/g, '--on-ink-trans-5: rgba(255,255,255,0.05);');
css = css.replace(/--on-ink-trans-6: rgba\(15, 11, 46, 0\.06\);/g, '--on-ink-trans-6: rgba(255,255,255,0.06);');
css = css.replace(/--on-ink-trans-8: rgba\(15, 11, 46, 0\.08\);/g, '--on-ink-trans-8: rgba(255,255,255,0.08);');
css = css.replace(/--on-ink-trans-10: rgba\(15, 11, 46, 0\.1\);/g, '--on-ink-trans-10: rgba(255,255,255,0.1);');
css = css.replace(/--on-ink-trans-25: rgba\(15, 11, 46, 0\.25\);/g, '--on-ink-trans-25: rgba(255,255,255,0.25);');
css = css.replace(/--on-ink-trans-50: rgba\(15, 11, 46, 0\.5\);/g, '--on-ink-trans-50: rgba(255,255,255,0.5);');
css = css.replace(/--on-ink-trans-85: rgba\(15, 11, 46, 0\.85\);/g, '--on-ink-trans-85: rgba(255,255,255,0.85);');

// 4. Remove the badge and gradient fixes we added for the inverted background, as the background is dark again.
css = css.replace(/\.dark \.landing-page \.badge-warm \{\n  color: #B45309;\n  border-color: rgba\(245,166,35,0\.4\);\n\}/g, '');
css = css.replace(/\.dark \.landing-page \.band-dark h2 \.accent-inline \{\n  background: linear-gradient\(90deg, #D97706, #E85D8F\);\n  -webkit-background-clip: text; background-clip: text; color: transparent;\n\}/g, '');

fs.writeFileSync('src/components/LandingPage.css', css);
