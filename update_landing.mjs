import fs from 'fs';

let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

if (!content.includes('onTryIt: () => void;')) {
  content = content.replace("interface LandingPageProps {\n  onLogin: () => void;\n  onGetStarted: () => void;\n  onNavigate?: (page: string) => void;\n}", "interface LandingPageProps {\n  onLogin: () => void;\n  onGetStarted: () => void;\n  onTryIt: () => void;\n  onNavigate?: (page: string) => void;\n}");
  
  content = content.replace("export function LandingPage({ onLogin, onGetStarted, onNavigate }: LandingPageProps) {", "export function LandingPage({ onLogin, onGetStarted, onTryIt, onNavigate }: LandingPageProps) {");
  
  content = content.replace('<a href="#how" className="pill pill-outline-dark">See how it works</a>', '<button onClick={onTryIt} className="pill pill-outline-dark border-none cursor-pointer">Try it now</button>');
}

fs.writeFileSync('src/components/LandingPage.tsx', content);
