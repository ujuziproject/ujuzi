import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

if 'import { AnimatePresence, motion } from' not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { AnimatePresence, motion } from 'motion/react';")

with open('src/App.tsx', 'w') as f:
    f.write(content)
