with open('src/components/LandingPage.tsx', 'r') as f:
    content = f.read()

props_old = """interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
}"""
props_new = """interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
  onNavigate?: (page: string) => void;
}"""
content = content.replace(props_old, props_new)

def_old = "export function LandingPage({ onLogin, onGetStarted }: LandingPageProps) {"
def_new = "export function LandingPage({ onLogin, onGetStarted, onNavigate }: LandingPageProps) {"
content = content.replace(def_old, def_new)

# Replace footer links
footer_old = """<div className="footer-col">
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
            </div>"""

footer_new = """<div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('about'); }}>About</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); }}>Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('terms'); }}>Terms of Service</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('privacy'); }}>Privacy Policy</a></li>
              </ul>
            </div>"""
content = content.replace(footer_old, footer_new)

with open('src/components/LandingPage.tsx', 'w') as f:
    f.write(content)
