import fs from 'fs';
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

d = d.replace(
  `        }
    }
    
    // Fetch topics count and progress for each
    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {`,
  `        }
    }
    const currsList = fetchedCourses;
    
    // Fetch topics count and progress for each
    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {`
);

fs.writeFileSync('src/components/Dashboard.tsx', d);
