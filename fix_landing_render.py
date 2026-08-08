import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  if (step === 7) {
    return <MainApp name={name} userId={userId} onLogout={handleLogOut} />;
  }

  return (
    <div className="flex min-h-screen bg-surface font-sans overflow-hidden">"""
replacement = """  if (step === -1) {
    return <LandingPage onLogin={() => setStep(0)} onGetStarted={() => setStep(1)} />;
  }

  if (step === 7) {
    return <MainApp name={name} userId={userId} onLogout={handleLogOut} />;
  }

  return (
    <div className="flex min-h-screen bg-surface font-sans overflow-hidden">"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
