import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  '<button className="bg-[#5B4FE8] text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-[#5B4FE8]/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]">',
  `<button onClick={() => {
                   const firstPending = plannerItems.find(i => !i.completed);
                   if (firstPending && firstPending.topic_id) {
                     setDashboardTopicId(firstPending.topic_id);
                     setView('curriculum');
                   } else if (mostActiveCourse) {
                     setDashboardCourseId(mostActiveCourse.id);
                     setDashboardCurriculumId(mostActiveCourse.id);
                     setView('courseDetail');
                   }
                 }} className="bg-[#5B4FE8] text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-[#5B4FE8]/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]">`
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
