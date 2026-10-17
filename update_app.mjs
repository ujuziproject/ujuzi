import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { TryItPreview } from')) {
  content = content.replace("import { Step6Review } from './components/Step6Review';", "import { Step6Review } from './components/Step6Review';\nimport { TryItPreview } from './components/TryItPreview';");
  
  // Update the LandingPage call
  content = content.replace("<LandingPage onLogin={() => setStep(0)} onGetStarted={() => setStep(1)} onNavigate={(p) => setStep(p)} />", "<LandingPage onLogin={() => setStep(0)} onGetStarted={() => setStep(1)} onTryIt={() => setStep('try')} onNavigate={(p) => setStep(p)} />");
  
  // Add TryItPreview below step === 0 logic
  const oldStep0 = "{step === 0 && <Step0Login onNext={handleLoginComplete} onSignUpClick={() => setStep(1)} />}";
  const newStepTry = "{step === 'try' && <TryItPreview onSignUpClick={() => setStep(1)} />}\n                  " + oldStep0;
  
  content = content.replace(oldStep0, newStepTry);
  
  fs.writeFileSync('src/App.tsx', content);
}
