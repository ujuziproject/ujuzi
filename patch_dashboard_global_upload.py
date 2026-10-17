import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

import_line = "import { CourseUpload } from './CourseUpload';\nimport { supabase } from '../lib/supabase';"
import_line_new = "import { CourseUpload } from './CourseUpload';\nimport { GlobalUploadFlow } from './GlobalUploadFlow';\nimport { supabase } from '../lib/supabase';"
content = content.replace(import_line, import_line_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
