import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Import LandingPage
if 'import { LandingPage }' not in content:
    content = content.replace("import { Step0Login }", "import { LandingPage } from './components/LandingPage';\nimport { Step0Login }")

# Replace setStep(0) with setStep(-1) in checkSessionAndProfile
target_session = """      if (!session) {
        setStep(0); // Show Login by default
        setLoadingSession(false);
        return;
      }"""
replacement_session = """      if (!session) {
        setStep(-1); // Show Landing by default
        setLoadingSession(false);
        return;
      }"""
content = content.replace(target_session, replacement_session)

# Replace initial state to -1
target_state = "const [step, setStep] = useState(0); // 0 = login, 1 = signup"
replacement_state = "const [step, setStep] = useState(-1); // -1 = landing, 0 = login, 1 = signup"
content = content.replace(target_state, replacement_state)

# Render Landing Page outside of the split layout
target_render = """  if (step === 7) {
    return <MainApp name={name} userId={userId} onLogout={handleLogOut} />;
  }

  return (
    <div className="flex h-screen w-full bg-ink overflow-hidden font-sans">"""
replacement_render = """  if (step === -1) {
    return <LandingPage onLogin={() => setStep(0)} onGetStarted={() => setStep(1)} />;
  }

  if (step === 7) {
    return <MainApp name={name} userId={userId} onLogout={handleLogOut} />;
  }

  return (
    <div className="flex h-screen w-full bg-ink overflow-hidden font-sans">"""
content = content.replace(target_render, replacement_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)
