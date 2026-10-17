import fs from 'fs';
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

if (!content.includes('<BadgeToast />')) {
   content = content.replace("</NavigationContext.Provider>", "  <BadgeToast />\n    </NavigationContext.Provider>");
   fs.writeFileSync('src/components/MainApp.tsx', content);
}
