import fs from 'fs';
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

if (!content.includes('BadgeToast')) {
   content = content.replace("import { Dashboard } from './Dashboard';", "import { Dashboard } from './Dashboard';\nimport { BadgeToast } from './BadgeToast';");
   content = content.replace("</div>\n    </div>\n  );", "  <BadgeToast />\n    </div>\n    </div>\n  );");
   fs.writeFileSync('src/components/MainApp.tsx', content);
}
