with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = "import { AboutPage, ContactPage, TermsPage, PrivacyPage } from './components/StaticPages';\n"
if "StaticPages" not in content:
    content = content.replace("import { LandingPage } from './components/LandingPage';", "import { LandingPage } from './components/LandingPage';\n" + import_statement)

# Replace landing page render
landing_old = "if (step === -1) {\n    return <LandingPage onLogin={() => setStep(0)} onGetStarted={() => setStep(1)} />;\n  }"
landing_new = """if (step === 'about') return <AboutPage onBack={() => setStep(-1)} />;
  if (step === 'contact') return <ContactPage onBack={() => setStep(-1)} />;
  if (step === 'terms') return <TermsPage onBack={() => setStep(-1)} />;
  if (step === 'privacy') return <PrivacyPage onBack={() => setStep(-1)} />;

  if (step === -1) {
    return <LandingPage onLogin={() => setStep(0)} onGetStarted={() => setStep(1)} onNavigate={(page) => setStep(page)} />;
  }"""
if "step === 'about'" not in content:
    content = content.replace(landing_old, landing_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
