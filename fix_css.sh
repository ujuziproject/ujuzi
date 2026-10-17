#!/bin/bash
CSS="src/components/LandingPage.css"

# Insert CSS variables in :root
sed -i '/--font-mono/a\
  --nav-bg: rgba(255,255,255,0.96);\
  --on-ink-trans-5: rgba(255,255,255,0.05);\
  --on-ink-trans-6: rgba(255,255,255,0.06);\
  --on-ink-trans-8: rgba(255,255,255,0.08);\
  --on-ink-trans-10: rgba(255,255,255,0.1);\
  --on-ink-trans-25: rgba(255,255,255,0.25);\
  --on-ink-trans-50: rgba(255,255,255,0.5);\
  --on-ink-trans-85: rgba(255,255,255,0.85);' "$CSS"

# Insert CSS variables in .dark
sed -i '/--text-on-ink-soft/a\
  --nav-bg: rgba(15, 11, 46, 0.96);\
  --on-ink-trans-5: rgba(15, 11, 46, 0.05);\
  --on-ink-trans-6: rgba(15, 11, 46, 0.06);\
  --on-ink-trans-8: rgba(15, 11, 46, 0.08);\
  --on-ink-trans-10: rgba(15, 11, 46, 0.1);\
  --on-ink-trans-25: rgba(15, 11, 46, 0.25);\
  --on-ink-trans-50: rgba(15, 11, 46, 0.5);\
  --on-ink-trans-85: rgba(15, 11, 46, 0.85);' "$CSS"

# Now replace hardcoded #fff and rgba(255,255,255,*)
sed -i 's/border: 1.5px solid rgba(255,255,255,0.25)/border: 1.5px solid var(--on-ink-trans-25)/g' "$CSS"
sed -i 's/background: rgba(255,255,255,0.06)/background: var(--on-ink-trans-6)/g' "$CSS"
sed -i 's/background: rgba(255,255,255,0.96)/background: var(--nav-bg)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.06)/var(--on-ink-trans-6)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.05)/var(--on-ink-trans-5)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.04)/var(--on-ink-trans-5)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.1)/var(--on-ink-trans-10)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.5)/var(--on-ink-trans-50)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.08)/var(--on-ink-trans-8)/g' "$CSS"
sed -i 's/rgba(255,255,255,0.85)/var(--on-ink-trans-85)/g' "$CSS"

# Specific #fff replacements
sed -i 's/color: #fff;/color: var(--text-on-ink);/g' "$CSS"
sed -i 's/background: #fff;/background: var(--text-on-ink);/g' "$CSS"
# Revert the ones that MUST be white
sed -i 's/color: var(--text-on-ink); box-shadow: 0 8px 22px -6px rgba(91,79,232,0.55);/color: #fff; box-shadow: 0 8px 22px -6px rgba(91,79,232,0.55);/g' "$CSS"
sed -i '/\.logo-mark {/!b;n;n;s/color: var(--text-on-ink);/color: #fff;/g' "$CSS"
sed -i '/\.step-num {/s/color: var(--text-on-ink);/color: #fff;/g' "$CSS"
sed -i '/\.carousel-btn:hover {/s/color: var(--text-on-ink);/color: #fff;/g' "$CSS"
sed -i '/\.faq-item.open .faq-icon {/s/color: var(--text-on-ink);/color: #fff;/g' "$CSS"
