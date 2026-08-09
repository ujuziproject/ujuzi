import fs from 'fs';
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

c = c.replace(
  "dashboardTopicId: initialTopicId, setDashboardTopicId, setDashboardCourseId, setDashboardCurriculumId",
  "dashboardTopicId: initialTopicId, setDashboardTopicId, setDashboardTopicId as setInitialTopicId, setDashboardCourseId, setDashboardCurriculumId"
);

// Wait, destructuring alias syntax is: property: localName
// So `setDashboardTopicId: setInitialTopicId` means local name is setInitialTopicId.
// I can do `setDashboardTopicId, setDashboardTopicId: setInitialTopicId`? No, duplicate property name.
// I'll just change the onClick to use setInitialTopicId instead of setDashboardTopicId!

c = c.replace(
  /setDashboardTopicId\(firstPending\.topic_id\);/g,
  "setInitialTopicId(firstPending.topic_id);"
);

c = c.replace(
  "setDashboardTopicId, setDashboardTopicId as setInitialTopicId",
  "setDashboardTopicId: setInitialTopicId"
);

// Also let's just make it simpler:
c = c.replace(
  "dashboardTopicId: initialTopicId, setDashboardTopicId, setDashboardCourseId, setDashboardCurriculumId",
  "dashboardTopicId: initialTopicId, setDashboardTopicId: setInitialTopicId, setDashboardCourseId, setDashboardCurriculumId"
);

fs.writeFileSync('src/components/Dashboard.tsx', c);
