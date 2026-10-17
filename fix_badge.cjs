const fs = require('fs');
let css = fs.readFileSync('src/components/LandingPage.css', 'utf8');

// I removed the dark badge overrides because the background is dark again, but wait!
// The original background was dark in light mode, so the badge looked good. 
// Now it's dark in dark mode too, so it looks good again! The default .badge-warm has:
// background: rgba(245,166,35,0.14);
// border: 1px solid rgba(245,166,35,0.25);
// color: var(--accent-warm); (which is #F8C370 in dark mode)
// This is perfect!

