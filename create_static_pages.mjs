import fs from 'fs';

const nav = `
<nav>
  <div className="nav-pill">
    <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="logo"><div className="logo-mark">uJ</div>uJuzi</a>
    <div className="nav-links">
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>How it works</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Who it's for</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Features</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Pricing</a>
    </div>
    <div className="nav-cta">
      <button className="theme-toggle">🌙</button>
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="link-login">Log in</a>
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="pill pill-primary">Get started</a>
    </div>
  </div>
</nav>
`;

const footer = `
<footer>
  <div className="wrap">
    <div className="footer-grid">
      <div className="footer-brand">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="logo"><div className="logo-mark">uJ</div>uJuzi</a>
        <p>AI-personalized study plans built from your real curriculum — for WAEC, JAMB, university and independent learners across Nigeria.</p>
      </div>
      <div className="footer-col">
        <h4>Product</h4>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>How it works</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Who it's for</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Features</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Pricing</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>Contact</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}>Terms of Service</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}>Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} uJuzi. Built for the next generation of Nigerian learners.</span>
      <span>Made in Lagos 🇳🇬</span>
    </div>
  </div>
</footer>
`;

const content = `
import React, { useState } from 'react';

interface PageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const AboutPage = ({ onBack, onNavigate }: PageProps) => (
  <div className="landing-page">
    ${nav}
    
    <section className="page-hero" style={{ paddingBottom: '60px' }}>
      <div className="wrap">
        <h1 style={{ fontSize: '44px' }}>Built to close the gap between what you're taught and what you're tested on.</h1>
        <p>uJuzi exists because a syllabus and a stack of generic study notes are rarely the same thing — and in Nigeria, that gap costs students more than it should.</p>
      </div>
    </section>

    <section className="section" style={{ paddingTop: '60px' }}>
      <div className="wrap story-block">
        <p>uJuzi started as an idea in 2012 — long before "AI" meant what it means today. The problem it was trying to solve hasn't changed since: students in Nigeria are handed a syllabus, an exam board, a course outline — and then largely left to find their own materials to match it. Textbooks lag behind. Past questions circulate without context. Study apps built for one country's curriculum get repurposed for another, with the mismatches papered over.</p>
        <p>What's changed is that the piece the original idea was missing — <strong>actually generating study materials matched to a specific syllabus, at scale, cheaply</strong> — is now genuinely possible. That's what uJuzi does. You upload your real curriculum — a WAEC subject list, a university course outline, or the requirements for a certification you're chasing on your own — and it becomes notes, flashcards and quizzes built around exactly what you're being tested on.</p>
        <p>We built it for three kinds of learners because that's who's actually out there studying in Nigeria right now: <strong>secondary school students</strong> preparing for WAEC and JAMB, <strong>university students</strong> juggling up to eight courses a semester, and <strong>independent learners</strong> working toward a certification or skill with no institution behind them at all.</p>
      </div>
    </section>

    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head">
          <div className="section-eyebrow">What we believe</div>
          <h2>Three ideas this whole product is built on</h2>
        </div>
        <div className="values-grid">
          <div className="value-card">
            <div className="num">01</div>
            <h3>Your syllabus, not a stranger's</h3>
            <p>Generic study content is built for an average student who doesn't exist. Materials should start from what you were actually given, not a rough approximation of it.</p>
          </div>
          <div className="value-card">
            <div className="num">02</div>
            <h3>Built for Nigeria first</h3>
            <p>WAEC, JAMB, and 270+ NUC-listed universities aren't an afterthought bolted onto a platform built for somewhere else — they're the whole starting point.</p>
          </div>
          <div className="value-card">
            <div className="num">03</div>
            <h3>Honest about what AI can't do</h3>
            <p>AI-generated materials are a starting point for study, not a replacement for your official curriculum or lecturer — we say so clearly, every time.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="founder-note">
          <div className="quote-mark">"</div>
          <p>In 2012, I sketched out an idea for a platform that would connect students to the exact resources they needed for their course — not just whatever happened to be in a textbook. The idea sat for over a decade. What hasn't changed is the problem: Nigerian curricula move faster than the materials built around them. What's changed is that AI can finally do the personalization work that used to require an army of people to build by hand. uJuzi is that original idea, rebuilt for right now.</p>
          <div className="sign">Ebrahim Durosimi<span>Founder, uJuzi</span></div>
        </div>
      </div>
    </section>

    <section className="final-cta">
      <div className="wrap">
        <div className="final-cta-inner">
          <h2>Ready to see it for yourself?</h2>
          <p>Upload your first syllabus and see your study plan in minutes — free to start.</p>
          <div className="final-cta-actions">
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="pill pill-primary">Get started free →</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="pill pill-outline-dark">Get in touch</a>
          </div>
        </div>
      </div>
    </section>

    ${footer}
  </div>
);

export const ContactPage = ({ onBack, onNavigate }: PageProps) => {
  const [submitted, setSubmitted] = useState(false);
  
  return (
    <div className="landing-page">
      ${nav}
      
      <section className="page-hero" style={{ paddingBottom: '60px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: '44px' }}>We'd love to hear from you</h1>
          <p>Questions about your account, feedback on how it's working, or a school interested in bringing uJuzi to your students — reach out.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '60px' }}>
        <div className="wrap contact-grid">
          <div className="contact-methods">
            <div className="contact-method">
              <div className="icon" style={{ background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}>✉</div>
              <div>
                <h3>General support</h3>
                <p>Account issues, questions about how something works</p>
                <a className="val" href="mailto:support@ujuzi.ng">support@ujuzi.ng</a>
              </div>
            </div>
            <div className="contact-method">
              <div className="icon" style={{ background: 'var(--accent-warm-soft)', color: 'var(--accent-warm)' }}>🏫</div>
              <div>
                <h3>Schools & institutions</h3>
                <p>Interested in uJuzi for a class, department, or school</p>
                <a className="val" href="mailto:schools@ujuzi.ng">schools@ujuzi.ng</a>
              </div>
            </div>
            <div className="contact-method">
              <div className="icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>🔒</div>
              <div>
                <h3>Privacy & data requests</h3>
                <p>Access, correction, or deletion of your data</p>
                <a className="val" href="mailto:privacy@ujuzi.ng">privacy@ujuzi.ng</a>
              </div>
            </div>
            <div className="contact-method">
              <div className="icon" style={{ background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}>📍</div>
              <div>
                <h3>Based in</h3>
                <p>Lagos, Nigeria — building for students across the country</p>
              </div>
            </div>
          </div>

          <div className="contact-form">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', color: 'var(--success)' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Message sent</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full name</label>
                    <input type="text" placeholder="Your name" required />
                  </div>
                  <div className="form-group">
                    <label>Email address</label>
                    <input type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>What's this about?</label>
                  <select>
                    <option>General question</option>
                    <option>Account or technical support</option>
                    <option>School or institution partnership</option>
                    <option>Privacy or data request</option>
                    <option>Press / media</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={5} placeholder="How can we help?" required></textarea>
                </div>
                <button type="submit" className="pill pill-primary" style={{ width: '100%', justifyContent: 'center' }}>Send message</button>
                <div className="form-note">We typically reply within 1–2 business days.</div>
              </form>
            )}
          </div>
        </div>
      </section>

      ${footer}
    </div>
  );
};

export const TermsPage = ({ onBack, onNavigate }: PageProps) => (
  <div className="landing-page">
    ${nav}

    <section className="page-hero" style={{ paddingBottom: '60px' }}>
      <div className="wrap">
        <h1 style={{ fontSize: '44px' }}>Terms of Service</h1>
        <p>The rules for using uJuzi, written to actually be read.</p>
      </div>
    </section>

    <section className="section" style={{ paddingTop: '60px' }}>
      <div className="wrap">
        <div className="legal-meta">
          <span>Last updated: August 2026</span>
          <span>Governing law: Federal Republic of Nigeria</span>
        </div>

        <div className="legal-toc">
          <h4>Contents</h4>
          <ol>
            <li><a href="#accept">Acceptance of these Terms</a></li>
            <li><a href="#eligibility">Eligibility & accounts</a></li>
            <li><a href="#service">What uJuzi is</a></li>
            <li><a href="#content">Your content</a></li>
            <li><a href="#ai">AI-generated content — read this one</a></li>
            <li><a href="#use">Acceptable use</a></li>
            <li><a href="#plans">Plans & payment</a></li>
            <li><a href="#ip">Intellectual property</a></li>
            <li><a href="#term">Suspension & termination</a></li>
            <li><a href="#disclaimer">Disclaimers & limitation of liability</a></li>
            <li><a href="#law">Governing law</a></li>
            <li><a href="#changes">Changes to these terms</a></li>
            <li><a href="#contact">Contact us</a></li>
          </ol>
        </div>

        <div className="legal-content">
          <h2 id="accept">1. Acceptance of these Terms</h2>
          <p>By creating an account or otherwise using uJuzi ("uJuzi," "we," "us," "our"), you agree to these Terms of Service and our Privacy Policy. If you don't agree, please don't use the service. If you're using uJuzi on behalf of a school, department, or organization, you're confirming you have the authority to bind that organization to these terms.</p>

          <h2 id="eligibility">2. Eligibility & accounts</h2>
          <p>uJuzi is built for secondary school students, university students, and independent learners — which means many of our users are minors.</p>
          <ul>
            <li>If you are <strong>under 18</strong>, you may only use uJuzi with the involvement or consent of a parent or legal guardian, consistent with the Nigeria Data Protection Act 2023 and the Child Rights Act 2003.</li>
            <li>You're responsible for keeping your account credentials secure and for all activity that happens under your account.</li>
            <li>You must provide accurate information when creating your profile (academic track, institution, exam details) — this directly affects the study materials uJuzi generates for you.</li>
            <li>One account per person. Don't create accounts on behalf of others without their knowledge.</li>
          </ul>

          <h2 id="service">3. What uJuzi is</h2>
          <p>uJuzi lets you upload or describe a curriculum, syllabus, or course outline, and uses AI to generate study materials — lecture notes, flashcards, and quizzes — matched to what you submitted. It also provides progress tracking, spaced-repetition review, and (where enabled) recommendations based on your interests and learning style.</p>
          <p>uJuzi is a study aid. It is not an accredited educational institution, an examination body, and does not guarantee any academic outcome, grade, or exam result.</p>

          <h2 id="content">4. Your content</h2>
          <p>When you upload a curriculum, syllabus, or any other file or text ("Your Content"), you retain ownership of it. By submitting it, you give uJuzi permission to process, store, and use it — including sending it to AI providers — for the purpose of generating your study materials and operating the service.</p>
          <ul>
            <li>Don't upload content you don't have the right to share (e.g., material under a license that prohibits redistribution or AI processing).</li>
            <li>Don't upload content containing other people's personal information without their consent.</li>
            <li>We don't claim ownership of Your Content, and we don't use it to train AI models beyond what's needed to generate your own materials, unless we tell you otherwise and get your consent.</li>
          </ul>

          <h2 id="ai">5. AI-generated content — read this one</h2>
          <div className="legal-callout warm">
            <p><strong>AI can be wrong.</strong> Notes, flashcards, quiz questions, and any "help me find a curriculum" suggestions are generated by AI models and may contain errors, omissions, or outdated information — even when they look confident and well-formatted.</p>
          </div>
          <p>You're responsible for verifying anything generated by uJuzi against your official curriculum, textbook, or instructor before relying on it for an actual exam or assessment. Where uJuzi labels content as a "general suggestion" rather than a verified match to your real syllabus, treat it accordingly.</p>

          <h2 id="use">6. Acceptable use</h2>
          <p>Don't use uJuzi to:</p>
          <ul>
            <li>Upload malicious files, attempt to access other users' accounts or data, or interfere with the service's normal operation.</li>
            <li>Scrape, resell, or redistribute uJuzi's generated content at scale without our written permission.</li>
            <li>Impersonate another person or misrepresent your academic affiliation.</li>
            <li>Use the service for anything unlawful under Nigerian law or the law of your jurisdiction.</li>
          </ul>

          <h2 id="plans">7. Plans & payment</h2>
          <p>uJuzi offers a free tier and paid plans with expanded usage limits, as described on our <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>pricing page</a>. Paid plan pricing, billing cycles, and refund terms will be presented clearly at the point of purchase before you're charged. We'll give reasonable notice before any price change affecting an active subscription.</p>

          <h2 id="ip">8. Intellectual property</h2>
          <p>The uJuzi name, logo, interface design, and underlying software are owned by uJuzi and protected by applicable intellectual property law. These Terms don't grant you any rights to our branding or codebase beyond what's needed to use the service normally.</p>

          <h2 id="term">9. Suspension & termination</h2>
          <p>You can stop using uJuzi and delete your account at any time. We may suspend or terminate accounts that violate these Terms, misuse the service, or where required by law — where practical, we'll tell you why.</p>

          <h2 id="disclaimer">10. Disclaimers & limitation of liability</h2>
          <p>uJuzi is provided "as is." To the fullest extent permitted by Nigerian law, we disclaim warranties of any kind regarding the accuracy, completeness, or reliability of AI-generated content, and we are not liable for academic outcomes, exam results, or decisions made based on materials generated through the service.</p>

          <h2 id="law">11. Governing law</h2>
          <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be subject to the exclusive jurisdiction of Nigerian courts.</p>

          <h2 id="changes">12. Changes to these terms</h2>
          <p>We may update these Terms from time to time. If a change is material, we'll notify you (e.g., by email or an in-app notice) before it takes effect. Continuing to use uJuzi after a change takes effect means you accept the updated Terms.</p>

          <h2 id="contact">13. Contact us</h2>
          <p>Questions about these Terms? Reach us at <a href="mailto:support@ujuzi.ng" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>support@ujuzi.ng</a> or via our <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>contact page</a>.</p>
        </div>
      </div>
    </section>

    ${footer}
  </div>
);

export const PrivacyPage = ({ onBack, onNavigate }: PageProps) => (
  <div className="landing-page">
    ${nav}

    <section className="page-hero" style={{ paddingBottom: '60px' }}>
      <div className="wrap">
        <h1 style={{ fontSize: '44px' }}>Privacy Policy</h1>
        <p>What we collect, why, and what you can do about it.</p>
      </div>
    </section>

    <section className="section" style={{ paddingTop: '60px' }}>
      <div className="wrap">
        <div className="legal-meta">
          <span>Last updated: August 2026</span>
          <span>Regulator: Nigeria Data Protection Commission (NDPC)</span>
        </div>

        <div className="legal-toc">
          <h4>Contents</h4>
          <ol>
            <li><a href="#who">Who we are</a></li>
            <li><a href="#collect">Information we collect</a></li>
            <li><a href="#use">How we use it</a></li>
            <li><a href="#ai-processing">AI processing & sub-processors</a></li>
            <li><a href="#children">If you're under 18</a></li>
            <li><a href="#sharing">When we share data</a></li>
            <li><a href="#transfers">International transfers</a></li>
            <li><a href="#retention">How long we keep it</a></li>
            <li><a href="#rights">Your rights under the NDPA</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#changes">Changes to this policy</a></li>
            <li><a href="#contact">Contact & Data Protection queries</a></li>
          </ol>
        </div>

        <div className="legal-content">
          <h2 id="who">1. Who we are</h2>
          <p>uJuzi is an AI-personalized study platform built for students in Nigeria. For the purposes of the Nigeria Data Protection Act 2023 (NDPA), uJuzi is the data controller for the personal data described in this policy.</p>

          <h2 id="collect">2. Information we collect</h2>
          <p>We collect what's actually needed to build your personalized study plan — nothing beyond that. Specifically:</p>
          <h3>Account information</h3>
          <ul>
            <li>Name, email address, and login credentials</li>
          </ul>
          <h3>Academic profile</h3>
          <ul>
            <li>Your track (secondary, university, or independent)</li>
            <li>For secondary: exam type (WAEC/JAMB/NECO) and exam year</li>
            <li>For university: your institution, faculty, course of study, and level</li>
            <li>For independent learners: your stated goal (e.g. a certification name) and target date</li>
            <li>Your selected interests (e.g. sports, fashion, politics) — used to personalize recommended reading, entirely optional</li>
            <li>Your learning style (content format and explanation complexity preference), if you complete the learning style quiz</li>
          </ul>
          <h3>Curriculum content</h3>
          <ul>
            <li>The syllabus text, PDF, or photo you upload or paste, and the topics, notes, flashcards and quizzes generated from it</li>
          </ul>
          <h3>Study activity</h3>
          <ul>
            <li>Quiz attempts and scores, flashcard review history, study session duration (time spent on notes/flashcards/quizzes), streaks, and general activity logs</li>
          </ul>
          <h3>Technical data</h3>
          <ul>
            <li>Basic device and usage information collected automatically (e.g. for security and to keep the service working properly)</li>
          </ul>

          <h2 id="use">3. How we use it</h2>
          <ul>
            <li>To generate study materials matched to your actual curriculum</li>
            <li>To personalize content by your learning style and interests</li>
            <li>To power progress tracking — streaks, mastery breakdowns, strengths and weaknesses</li>
            <li>To operate, secure, and improve the service</li>
            <li>To communicate with you about your account or material changes to the service</li>
          </ul>
          <p>We do not sell your personal data, and we do not use your curriculum uploads or study data to advertise to you or to third parties.</p>

          <h2 id="ai-processing">4. AI processing & sub-processors</h2>
          <p>To generate your study materials, your curriculum content and related prompts are sent to our AI provider (Google's Gemini API) for processing. Your account and study data are stored using Supabase, our database and infrastructure provider. Both are engaged as data processors acting on our instructions — they don't independently use your data for their own purposes.</p>

          <h2 id="children">5. If you're under 18</h2>
          <div className="legal-callout">
            <p>Many uJuzi users are secondary school students under 18. If that's you, uJuzi should be used with a parent or guardian's knowledge and consent, consistent with the NDPA and the Child Rights Act 2003. We collect the minimum information needed to provide the service and do not knowingly use children's data for any purpose beyond operating uJuzi itself.</p>
          </div>
          <p>Where uJuzi's parent/teacher visibility features are enabled, a student's progress data may be made visible to a linked parent or teacher account — this only happens with the student's (and, where applicable, parent's) explicit opt-in, never automatically.</p>

          <h2 id="sharing">6. When we share data</h2>
          <p>We share personal data only with:</p>
          <ul>
            <li>The service providers described above (Gemini, Supabase), strictly to operate uJuzi</li>
            <li>A linked parent or teacher account, only where you've opted into that visibility</li>
            <li>Law enforcement or regulators, only where required by Nigerian law</li>
            <li>A successor entity, if uJuzi is ever acquired or merged — with notice to you first</li>
          </ul>

          <h2 id="transfers">7. International transfers</h2>
          <p>Because our AI and infrastructure providers may process data on servers outside Nigeria, your information may be transferred internationally. Where this happens, we require appropriate safeguards consistent with NDPA requirements for cross-border data transfer.</p>

          <h2 id="retention">8. How long we keep it</h2>
          <p>We keep your account and study data for as long as your account is active. If you delete your account, we delete or anonymize your personal data within a reasonable period, except where we're required to retain it for legal or regulatory reasons.</p>

          <h2 id="rights">9. Your rights under the NDPA</h2>
          <p>As a data subject under the Nigeria Data Protection Act, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data, subject to legal exceptions</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent at any time, where processing is based on consent</li>
            <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC)</li>
          </ul>
          <p>To exercise any of these rights, contact us using the details below.</p>

          <h2 id="security">10. Security</h2>
          <p>We use industry-standard safeguards — including encryption in transit, access controls, and row-level data isolation — to protect your information. No system is perfectly secure, but we take this seriously and will notify affected users and the NDPC of any significant data breach as required by law.</p>

          <h2 id="changes">11. Changes to this policy</h2>
          <p>We'll update this policy as uJuzi evolves. Material changes will be communicated before they take effect.</p>

          <h2 id="contact">12. Contact & Data Protection queries</h2>
          <p>For privacy questions or to exercise your data rights, contact us at <a href="mailto:privacy@ujuzi.ng" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>privacy@ujuzi.ng</a> or via our <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>contact page</a>.</p>
        </div>
      </div>
    </section>

    ${footer}
  </div>
);
`;

fs.writeFileSync('src/components/StaticPages.tsx', content);

