import fs from 'fs';

// Patch Dashboard.tsx
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

d = d.replace(
  'className="bg-[#FDF1DC] rounded-[18px] p-5 flex flex-col"',
  'className="bg-[#FDF1DC] dark:bg-[#F5A623]/15 rounded-[18px] p-5 flex flex-col"'
);

d = d.replace(
  'className="bg-[#EDEBFC] rounded-[18px] p-5 flex flex-col"',
  'className="bg-[#EDEBFC] dark:bg-[#5B4FE8]/15 rounded-[18px] p-5 flex flex-col"'
);

// Course items in active courses (Dashboard.tsx)
d = d.replace(
  /hover:bg-\[#EDEBFC\]/g,
  'hover:bg-[#EDEBFC] dark:hover:bg-[#5B4FE8]/15'
);

fs.writeFileSync('src/components/Dashboard.tsx', d);

// Patch MyCourses.tsx
if (fs.existsSync('src/components/MyCourses.tsx')) {
  let m = fs.readFileSync('src/components/MyCourses.tsx', 'utf-8');
  m = m.replace(
    /const bgClass = i % 2 === 0 \? 'bg-\[#EDEBFC\]' : 'bg-\[#FDF1DC\]';/g,
    "const bgClass = i % 2 === 0 ? 'bg-[#EDEBFC] dark:bg-[#5B4FE8]/15' : 'bg-[#FDF1DC] dark:bg-[#F5A623]/15';"
  );
  fs.writeFileSync('src/components/MyCourses.tsx', m);
}

// Patch CourseDetail.tsx
if (fs.existsSync('src/components/CourseDetail.tsx')) {
  let c = fs.readFileSync('src/components/CourseDetail.tsx', 'utf-8');
  c = c.replace(
    /bg-\[#EDEBFC\]/g,
    'bg-[#EDEBFC] dark:bg-[#5B4FE8]/15'
  );
  c = c.replace(
    /bg-\[#FDF1DC\]/g,
    'bg-[#FDF1DC] dark:bg-[#F5A623]/15'
  );
  c = c.replace(
    /bg-\[#DDF5EC\]/g,
    'bg-[#DDF5EC] dark:bg-[#2FBF8F]/15'
  );
  fs.writeFileSync('src/components/CourseDetail.tsx', c);
}

