content = """import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  
  return <div ref={ref} className="num">{count}{suffix}</div>;
};

export function LandingPage({ onLogin, onGetStarted }: LandingPageProps) {
  const cycleWords = ['WAEC syllabus', 'course outline', 'certification path'];
  const [cycleIndex, setCycleIndex] = useState(0);
  const [wordOpacity, setWordOpacity] = useState(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordOpacity(0);
      setTimeout(() => {
        setCycleIndex((prev) => (prev + 1) % cycleWords.length);
        setWordOpacity(1);
      }, 200);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const stepData = [
    { heading: 'Upload your curriculum', rows: ['syllabus.pdf uploaded', 'File parsed successfully', 'Ready for AI processing'], filled: 0 },
    { heading: 'AI breaks it into topics', rows: ['Course: Organic Chemistry', 'Topics detected: 6', 'Structuring semester...'], filled: 1 },
    { heading: 'Get personalized materials', rows: ['Notes generated', 'Flashcards: 42 cards', 'Quiz: 5 questions per topic'], filled: 2 },
    { heading: 'Study and track progress', rows: ['Mastery 74%', 'Streak 5 days', 'Weak spot: Isomerism'], filled: 3 }
  ];
  const [activeStep, setActiveStep] = useState(3);
  
  const [activeTab, setActiveTab] = useState(0);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  
  const slideFeatures = (dir: number) => {
    if (trackRef.current && trackRef.current.firstElementChild) {
      const cardW = trackRef.current.firstElementChild.getBoundingClientRect().width + 22;
      trackRef.current.scrollBy({ left: dir * cardW, behavior: 'smooth' });
    }
  };
  
  const handleScroll = () => {
    if (trackRef.current && trackRef.current.firstElementChild) {
      const cardW = trackRef.current.firstElementChild.getBoundingClientRect().width + 22;
      const page = Math.round(trackRef.current.scrollLeft / cardW);
      setActiveDot(page);
    }
  };
  
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="landing-page">
      <nav>
        <div className="nav-pill">
          <div className="logo"><div class="logo-mark">uJ</div>uJuzi</div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#tracks">Who it's for</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-cta">
            <button className="theme-toggle">🌙</button>
            <button onClick={onLogin} className="link-login border-none bg-transparent cursor-pointer">Log in</button>
            <button onClick={onGetStarted} className="pill pill-primary border-none">Get started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="badge-warm">✦ Built from your real syllabus</div>
            <h1>Your<br /><span className="gradient-word" style={{ opacity: wordOpacity, transition: 'opacity 0.35s ease' }}>{cycleWords[cycleIndex]}</span><br />becomes a study plan.</h1>
            <p className="hero-sub">Upload your actual curriculum — WAEC, a university course outline, or a certification you're chasing — and uJuzi turns it into notes, flashcards and quizzes built for exactly what you're tested on.</p>
            <div className="hero-ctas">
              <button onClick={onGetStarted} className="pill pill-primary border-none">Get started free →</button>
              <a href="#how" className="pill pill-outline-dark">See how it works</a>
            </div>
          </div>
          <div className="float-stage">
            <div className="float-card card-topic">
              <div className="fc-eyebrow">Topic Mastery</div>
              <div className="fc-title">Organic Chemistry</div>
              <div className="fc-sub">4 of 6 topics reviewed</div>
              <div className="fc-progress"><div></div></div>
            </div>
            <div className="float-card card-flash">
              <div className="fc-flash-tag">FLASHCARD</div>
              <div className="fc-question">What's the powerhouse of the cell?</div>
              <div className="fc-reveal">Tap to reveal →</div>
            </div>
            <div className="float-card card-streak">
              <div className="fc-eyebrow">Current Streak</div>
              <div className="streak-num">🔥 <strong>5</strong> <span>days in a row</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="stat-strip">
        <div className="wrap">
          <div className="stat-item">
            <CountUp target={3} />
            <div className="lbl">Learning tracks — secondary, university, independent</div>
          </div>
          <div className="stat-item">
            <div className="num">AI-built</div>
            <div className="lbl">Notes, flashcards & quizzes from your own syllabus</div>
          </div>
          <div className="stat-item">
            <CountUp target={273} suffix="+" />
            <div className="lbl">NUC-listed Nigerian universities supported</div>
          </div>
          <div className="stat-item">
            <div className="num">🇳🇬</div>
            <div className="lbl">Built for Nigerian students, from WAEC to postgrad</div>
          </div>
        </div>
      </div>

      {/* PROBLEM BAND */}
      <section className="band-dark">
        <div className="wrap band-grid">
          <div>
            <h2>Nigerian curricula don't wait for you to catch up. <span className="accent-inline">Neither should your study materials.</span></h2>
            <p>Generic study apps hand every student the same content. uJuzi starts from the syllabus you were actually given — so what you study matches what you'll be tested on, not a rough approximation of it.</p>
          </div>
          <div className="problem-list">
            <div className="problem-item">
              <div className="problem-icon">⚠</div>
              <div><strong>Outdated materials</strong><p>Textbooks and past questions don't always reflect the actual current syllabus.</p></div>
              <div className="problem-sparkle">✦</div>
            </div>
            <div className="problem-item">
              <div className="problem-icon violet">👥</div>
              <div><strong>One-size-fits-all apps</strong><p>Most study platforms ignore your specific course, institution, or exam board entirely.</p></div>
            </div>
            <div className="problem-item">
              <div className="problem-icon pink">⏱</div>
              <div><strong>No time to build your own</strong><p>Turning a syllabus into flashcards and practice questions by hand takes hours you don't have.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">How it works</div>
            <h2>From syllabus to study plan in four steps</h2>
            <p>No manual setup, no searching for the \"right\" materials — the whole process runs on what you actually upload.</p>
          </div>
          <div className="steps-grid">
            <div className="steps-list">
              <div className={`step-item ${activeStep === 0 ? 'active' : ''}`} onClick={() => setActiveStep(0)}><div className="step-num">01</div><div className="step-body"><h3>Upload your curriculum</h3><p>Paste your syllabus, or upload a PDF or photo — one course at a time, or your whole semester at once.</p></div></div>
              <div className={`step-item ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(1)}><div className="step-num">02</div><div className="step-body"><h3>AI breaks it into topics</h3><p>Your syllabus is parsed into a clear list of topics and courses, organized the way your term actually is.</p></div></div>
              <div className={`step-item ${activeStep === 2 ? 'active' : ''}`} onClick={() => setActiveStep(2)}><div className="step-num">03</div><div className="step-body"><h3>Get personalized materials</h3><p>Notes, flashcards and quizzes generated per topic — matched to your learning style and interests.</p></div></div>
              <div className={`step-item ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(3)}><div className="step-num">04</div><div className="step-body"><h3>Study and track progress</h3><p>Spaced-repetition flashcards, quiz scores, streaks, and a real breakdown of your strengths and weak spots.</p></div></div>
            </div>
            <div className="workspace-card">
              <div className="workspace-header">
                <div className="dot-row"><span></span><span></span><span></span></div>
                <span className="title-mono">uJuzi workspace</span>
              </div>
              <div className="workspace-title">
                <div className="icon-square">📈</div>
                <h3>{stepData[activeStep].heading}</h3>
              </div>
              <div className="workspace-row">{stepData[activeStep].rows[0]}</div>
              <div className="workspace-row">{stepData[activeStep].rows[1]}</div>
              <div className="workspace-row">{stepData[activeStep].rows[2]}</div>
              <div className="workspace-progress">
                <div className={activeStep >= 0 ? 'filled' : ''}></div>
                <div className={activeStep >= 1 ? 'filled' : ''}></div>
                <div className={activeStep >= 2 ? 'filled' : ''}></div>
                <div className={activeStep >= 3 ? 'filled' : ''}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKS */}
      <section className="section" id="tracks" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Who it's for</div>
            <h2>Built for however you're studying right now</h2>
            <p>Pick your track — the whole experience adjusts to match.</p>
          </div>
          <div className="tab-row">
            <button className={`tab-pill ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Secondary</button>
            <button className={`tab-pill ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>University</button>
            <button className={`tab-pill ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>Independent</button>
          </div>
          <div className="tracks">
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
          </div>
        </div>
      </section>

      {/* FEATURES CAROUSEL */}
      <section className="section" id="features" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Features</div>
            <h2>More than flashcards</h2>
            <p>Every part of uJuzi is built around one syllabus — yours.</p>
          </div>
          <div className="carousel-wrap">
            <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
              <div className="feature-card"><div className="feature-icon-round icon-teal">🧠</div><h3>Quizzes in your exam's voice</h3><p>Questions generated in the style of your exam board, not generic multiple choice pulled from nowhere.</p></div>
              <div className="feature-card"><div className="feature-icon-round icon-teal">⏱</div><h3>Plans that fit your week</h3><p>Tell uJuzi how many hours you have — it paces your topics so nothing gets crammed the night before.</p></div>
              <div className="feature-card"><div className="feature-icon-round icon-violet">🎯</div><h3>Matched to your learning style</h3><p>A short quiz figures out if you learn best visually or through text, simply or in depth — and content adapts to match.</p></div>
              <div className="feature-card"><div className="feature-icon-round icon-amber">🔥</div><h3>Streaks that actually mean something</h3><p>Daily streaks, spaced-repetition flashcards, and a Learner Type badge that reflects how you really study.</p></div>
              <div className="feature-card"><div className="feature-icon-round icon-teal">📊</div><h3>Real progress analytics</h3><p>Study time by day, strengths and weaknesses by topic, and exactly where your revision time is going.</p></div>
              <div className="feature-card"><div className="feature-icon-round icon-violet">📚</div><h3>Interest-matched reading</h3><p>A personal library of articles matched to what you're into — sports, fashion, politics and more.</p></div>
            </div>
            <div className="carousel-nav">
              <button className="carousel-btn" onClick={() => slideFeatures(-1)}>←</button>
              <div className="carousel-dots">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <span key={i} className={activeDot === i ? 'active' : ''}></span>
                ))}
              </div>
              <button className="carousel-btn" onClick={() => slideFeatures(1)}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Pricing</div>
            <h2>Start free. Upgrade when you're ready.</h2>
            <p>Real prices coming soon — these are placeholder tiers to shape the plan.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-name">Starter</div>
              <div className="price-cost"><span className="amt">₦0</span><span className="per">/ month</span></div>
              <p className="price-desc">Everything to try uJuzi with one course.</p>
              <ul className="price-list">
                <li>1 curriculum upload</li>
                <li>AI-generated notes, flashcards & quizzes</li>
                <li>Basic progress tracking</li>
                <li>Community support</li>
              </ul>
              <button onClick={onGetStarted} className="pill pill-outline-light price-cta border-solid cursor-pointer">Get started</button>
            </div>
            <div className="price-card featured">
              <div className="price-badge">MOST POPULAR</div>
              <div className="price-name">Scholar</div>
              <div className="price-cost"><span className="amt">₦2,500</span><span className="per">/ month</span></div>
              <p className="price-desc">For a full semester or exam prep season.</p>
              <ul className="price-list">
                <li>Unlimited curriculum uploads</li>
                <li>Learning style personalization</li>
                <li>Full analytics dashboard</li>
                <li>"Find my curriculum" AI search</li>
                <li>Priority AI generation</li>
              </ul>
              <button onClick={onGetStarted} className="pill pill-primary price-cta border-none cursor-pointer">Start free trial</button>
            </div>
            <div className="price-card">
              <div className="price-name">School</div>
              <div className="price-cost"><span className="amt">Custom</span></div>
              <p className="price-desc">For schools, departments, tutors managing groups.</p>
              <ul className="price-list">
                <li>Everything in Scholar</li>
                <li>Teacher / admin dashboard</li>
                <li>Student progress oversight</li>
                <li>Bulk seat licensing</li>
                <li>Onboarding & support</li>
              </ul>
              <button className="pill pill-outline-light price-cta border-solid cursor-pointer">Talk to us</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Got questions?</div>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            {[
              { q: "Is uJuzi free to use?", a: "Yes — you can upload your first syllabus, generate topics and start studying without paying. Heavier usage and extra generation live on a paid plan." },
              { q: "What if I don't have my exact curriculum on hand?", a: "uJuzi can search for the real one online, or suggest a solid general starting point for your course and level — clearly labeled either way, so you always know what you're studying from." },
              { q: "Does it work for WAEC and JAMB, not just university?", a: "Yes — secondary school prep, full university semesters, and independent certification study are all supported as separate tracks from sign-up." },
              { q: "Is my data private?", a: "Your curriculum uploads and study data are yours — used only to personalize your own study plan, not shared or sold." }
            ].map((faq, i) => (
              <div key={i} className={`faq-item ${activeFaq === i ? 'open' : ''}`}>
                <button className="faq-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{faq.q}</span><span className="faq-icon">+</span>
                </button>
                <div className="faq-panel" style={{ maxHeight: activeFaq === i ? '200px' : '0' }}>
                  <div className="faq-panel-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEYWORD MARQUEE */}
      <div className="keyword-strip">
        <div className="keyword-track">
          <span>QUIZZES</span><span className="dot"></span>
          <span>WAEC</span><span className="dot"></span>
          <span>JAMB</span><span className="dot"></span>
          <span>NUC-LISTED UNIVERSITIES</span><span className="dot"></span>
          <span>CERTIFICATIONS</span><span className="dot"></span>
          <span>SPACED REPETITION</span><span className="dot"></span>
          <span>TOPIC MASTERY</span><span className="dot"></span>
          <span>STREAKS</span><span className="dot"></span>
          <span>PAST QUESTIONS</span><span className="dot"></span>
          <span>QUIZZES</span><span className="dot"></span>
          <span>WAEC</span><span className="dot"></span>
          <span>JAMB</span><span className="dot"></span>
          <span>NUC-LISTED UNIVERSITIES</span><span className="dot"></span>
          <span>CERTIFICATIONS</span><span className="dot"></span>
          <span>SPACED REPETITION</span><span className="dot"></span>
          <span>TOPIC MASTERY</span><span className="dot"></span>
          <span>STREAKS</span><span className="dot"></span>
          <span>PAST QUESTIONS</span><span className="dot"></span>
        </div>
      </div>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="wrap">
          <div className="final-cta-inner">
            <h2>Ready to build your learning plan?</h2>
            <p>Upload your first syllabus and see your study plan in minutes — free to start.</p>
            <div className="final-cta-actions">
              <button onClick={onGetStarted} className="pill pill-primary border-none cursor-pointer">Get started free →</button>
              <button onClick={onLogin} className="pill pill-outline-dark cursor-pointer">Log in</button>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo"><div className="logo-mark">uJ</div>uJuzi</div>
              <p>AI-personalized study plans built from your real curriculum — for WAEC, JAMB, university and independent learners across Nigeria.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#tracks">Who it's for</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 uJuzi. Built for the next generation of Nigerian learners.</span>
            <span>Made in Lagos 🇳🇬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
"""

with open('src/components/LandingPage.tsx', 'w') as f:
    f.write(content)
