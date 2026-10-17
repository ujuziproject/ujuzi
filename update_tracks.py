import re

with open('src/components/LandingPage.tsx', 'r') as f:
    content = f.read()

target_tsx = """          <div className="tracks">
            <div className="track-card tone-dark">
              <div className="track-tag-pill">SECONDARY</div>
              <h3>WAEC & JAMB Prep</h3>
              <p>Study by subject with a clear exam year, built around what you're actually being tested on.</p>
              <ul className="track-list">
                <li>Subject-by-subject study plans</li>
                <li>Exam-year aware content</li>
                <li>Practice quizzes in exam style</li>
              </ul>
            </div>
            <div className="track-card tone-amber">
              <div className="track-tag-pill-plain">UNIVERSITY</div>
              <h3>Degree Students</h3>
              <p>Organize by level and semester — up to 8 courses a term, exactly like your real academic calendar.</p>
              <ul className="track-list">
                <li>Semester → course → topic structure</li>
                <li>Add one course, or a whole semester at once</li>
                <li>Pick your university from 270+ NUC-listed schools</li>
              </ul>
            </div>
            <div className="track-card tone-amber">
              <div className="track-tag-pill-plain">INDEPENDENT</div>
              <h3>Certifications & Skills</h3>
              <p>Studying for a certification or exam on your own? Set a goal, a timeline, and build your own plan.</p>
              <ul className="track-list">
                <li>Goal-based, not semester-based</li>
                <li>Your own materials, your own pace</li>
                <li>Works for any exam, cert, or skill</li>
              </ul>
            </div>
          </div>"""

replacement_tsx = """          <div className="tracks">
            <div className={`track-card ${activeTab === 0 ? 'tone-dark' : 'tone-purple'}`} onClick={() => setActiveTab(0)}>
              <div className={activeTab === 0 ? 'track-tag-pill' : 'track-tag-pill-plain'}>SECONDARY</div>
              <h3>WAEC & JAMB Prep</h3>
              <p>Study by subject with a clear exam year, built around what you're actually being tested on.</p>
              <ul className="track-list">
                <li>Subject-by-subject study plans</li>
                <li>Exam-year aware content</li>
                <li>Practice quizzes in exam style</li>
              </ul>
            </div>
            <div className={`track-card ${activeTab === 1 ? 'tone-dark' : 'tone-amber'}`} onClick={() => setActiveTab(1)}>
              <div className={activeTab === 1 ? 'track-tag-pill' : 'track-tag-pill-plain'}>UNIVERSITY</div>
              <h3>Degree Students</h3>
              <p>Organize by level and semester — up to 8 courses a term, exactly like your real academic calendar.</p>
              <ul className="track-list">
                <li>Semester → course → topic structure</li>
                <li>Add one course, or a whole semester at once</li>
                <li>Pick your university from 270+ NUC-listed schools</li>
              </ul>
            </div>
            <div className={`track-card ${activeTab === 2 ? 'tone-dark' : 'tone-sand'}`} onClick={() => setActiveTab(2)}>
              <div className={activeTab === 2 ? 'track-tag-pill' : 'track-tag-pill-plain'}>INDEPENDENT</div>
              <h3>Certifications & Skills</h3>
              <p>Studying for a certification or exam on your own? Set a goal, a timeline, and build your own plan.</p>
              <ul className="track-list">
                <li>Goal-based, not semester-based</li>
                <li>Your own materials, your own pace</li>
                <li>Works for any exam, cert, or skill</li>
              </ul>
            </div>
          </div>"""

content = content.replace(target_tsx, replacement_tsx)

with open('src/components/LandingPage.tsx', 'w') as f:
    f.write(content)


with open('src/components/LandingPage.css', 'r') as f:
    css_content = f.read()

target_css = """.landing-page .tracks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; }
.landing-page .track-card {
  border-radius: 22px; padding: 32px 28px; display: flex; flex-direction: column; gap: 18px;
  min-height: 340px;
}
.landing-page .track-card.tone-dark {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(91,79,232,0.4), transparent 55%),
    var(--ink);
  color: #fff;
}
.landing-page .track-card.tone-amber { background: var(--accent-warm-soft); }
.landing-page .track-tag-pill {
  align-self: flex-start;
  background: var(--accent-warm); color: var(--ink);
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  padding: 5px 12px; border-radius: 6px; letter-spacing: 0.06em;
}
.landing-page .track-card.tone-amber .track-tag-pill { background: #fff; color: var(--accent-warm); }
.landing-page .track-tag-pill-plain {
  align-self: flex-start; background: #fff;
  color: var(--accent-primary); font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  padding: 5px 12px; border-radius: 6px; letter-spacing: 0.06em; border: 1px solid var(--border);
}
.landing-page .track-card h3 { font-family: var(--font-display); font-weight: 700; font-size: 26px; }
.landing-page .track-card.tone-dark h3 { color: #fff; }
.landing-page .track-card p { font-size: 15px; line-height: 1.55; color: var(--text-secondary); }
.landing-page .track-card.tone-dark p { color: var(--text-on-ink-soft); }
.landing-page .track-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: auto; padding: 0; }
.landing-page .track-list li {
  display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-secondary);
}
.landing-page .track-card.tone-dark .track-list li { color: var(--text-on-ink-soft); }
.landing-page .track-list li::before {
  content: "→"; color: var(--accent-warm); font-weight: 700; flex-shrink: 0;
}"""

replacement_css = """.landing-page .tracks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; }
.landing-page .track-card {
  border-radius: 22px; padding: 32px 28px; display: flex; flex-direction: column; gap: 18px;
  min-height: 340px; cursor: pointer; transition: all 0.3s ease;
}
.landing-page .track-card.tone-dark {
  background:
    radial-gradient(ellipse at 30% 0%, rgba(91,79,232,0.4), transparent 55%),
    var(--ink);
  color: #fff;
}
.landing-page .track-card.tone-purple { background: #EFEDFD; }
.landing-page .track-card.tone-amber { background: #FDF1DC; }
.landing-page .track-card.tone-sand { background: #FFF3E5; }

.landing-page .track-tag-pill {
  align-self: flex-start;
  background: var(--accent-warm); color: var(--ink);
  font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 5px 12px; border-radius: 6px; letter-spacing: 0.06em;
}
.landing-page .track-tag-pill-plain {
  align-self: flex-start; background: #fff;
  color: var(--accent-primary); font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  padding: 5px 12px; border-radius: 6px; letter-spacing: 0.06em;
  border: none;
}
.landing-page .track-card h3 { font-family: var(--font-display); font-weight: 700; font-size: 26px; color: var(--ink); }
.landing-page .track-card.tone-dark h3 { color: #fff; }
.landing-page .track-card p { font-size: 15px; line-height: 1.55; color: var(--text-secondary); }
.landing-page .track-card.tone-dark p { color: var(--text-on-ink-soft); }

.landing-page .track-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: auto; padding: 0; }
.landing-page .track-list li {
  display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-secondary);
}
.landing-page .track-card.tone-dark .track-list li { color: var(--text-on-ink-soft); }

.landing-page .track-list li::before {
  content: "→"; color: var(--accent-primary); font-weight: 700; flex-shrink: 0; font-size: 16px; line-height: 1.2;
}
.landing-page .track-card.tone-dark .track-list li::before { color: var(--accent-warm); }"""

css_content = css_content.replace(target_css, replacement_css)

with open('src/components/LandingPage.css', 'w') as f:
    f.write(css_content)

