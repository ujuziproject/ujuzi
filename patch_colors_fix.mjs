import fs from 'fs';

let c = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
c = c.replace(/dark:bg-\[#5B4FE8\]/g, 'dark:bg-accent');
c = c.replace(/dark:text-\[#0F0B2E\]/g, 'dark:text-ink');
c = c.replace(/text-\[#0F0B2E\]/g, 'text-ink');
c = c.replace(/bg-\[#0F0B2E\]/g, 'bg-ink');
fs.writeFileSync('src/components/MainApp.tsx', c);

let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
d = d.replace(/dark:bg-\[#5B4FE8\]\/15/g, 'dark:bg-accent/15');
d = d.replace(/dark:bg-\[#F5A623\]\/15/g, 'dark:bg-accent-warm/15');
d = d.replace(/bg-\[#5B4FE8\]/g, 'bg-accent');
d = d.replace(/bg-\[#F5A623\]/g, 'bg-accent-warm');
fs.writeFileSync('src/components/Dashboard.tsx', d);

if (fs.existsSync('src/components/MyCourses.tsx')) {
  let m = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
  m = m.replace(/dark:bg-\[#5B4FE8\]\/15/g, 'dark:bg-accent/15');
  m = m.replace(/dark:bg-\[#F5A623\]\/15/g, 'dark:bg-accent-warm/15');
  fs.writeFileSync('src/components/MyCourses.tsx', m);
}

if (fs.existsSync('src/components/CourseDetail.tsx')) {
  let cd = fs.readFileSync('src/components/CourseDetail.tsx', 'utf-8');
  cd = cd.replace(/dark:bg-\[#5B4FE8\]\/15/g, 'dark:bg-accent/15');
  cd = cd.replace(/dark:bg-\[#F5A623\]\/15/g, 'dark:bg-accent-warm/15');
  cd = cd.replace(/dark:bg-\[#2FBF8F\]\/15/g, 'dark:bg-success/15');
  fs.writeFileSync('src/components/CourseDetail.tsx', cd);
}

