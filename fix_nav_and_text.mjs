import fs from 'fs';

// Fix MainApp navigation
let m = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');
m = m.replace(
  '<SidebarItem active={currentView === \\'flashcards\\'} icon={<Library className="w-[18px] h-[18px]" />} label="Flashcards" onClick={() => setCurrentView(\\'progress\\')} />',
  '<SidebarItem active={currentView === \\'flashcards\\'} icon={<Library className="w-[18px] h-[18px]" />} label="Flashcards" onClick={() => setCurrentView(\\'flashcards\\')} />'
);
m = m.replace(
  '<SidebarItem active={currentView === \\'quizzes\\'} icon={<CheckSquare className="w-[18px] h-[18px]" />} label="Quizzes" onClick={() => setCurrentView(\\'progress\\')} />',
  '<SidebarItem active={currentView === \\'quizzes\\'} icon={<CheckSquare className="w-[18px] h-[18px]" />} label="Quizzes" onClick={() => setCurrentView(\\'quizzes\\')} />'
);
m = m.replace(
  '<SidebarItem active={currentView === \\'planner\\'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView(\\'progress\\')} />',
  `<SidebarItem active={currentView === 'progress'} icon={<Activity className="w-[18px] h-[18px]" />} label="Progress" onClick={() => setCurrentView('progress')} />
           <SidebarItem active={currentView === 'planner'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView('planner')} />`
);
fs.writeFileSync('src/components/MainApp.tsx', m);

// Fix hardcoded text in Dashboard
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
d = d.replace(
  'const nextUpText = mostActiveCourse ? `You\\'re 3 sessions away from finishing ${mostActiveCourse.title} this week.` : "Let\\'s keep the momentum going!";',
  'const nextUpText = mostActiveCourse ? `Keep up the momentum in ${mostActiveCourse.title}!` : "Let\\'s keep the momentum going!";'
);
d = d.replace(
  '<div className="text-[12.5px] text-ink/60">Next: Continue learning</div>',
  '<div className="text-[12.5px] text-ink/60">Next: {c.nextTopic || (c.topic_count === 0 ? "No topics added" : "Ready to start")}</div>'
);

// Make sure enrichedCurricula has nextTopic
if (!d.includes('nextTopic =')) {
  d = d.replace(
    /let progress = 0;\\s*if \\(topicCount > 0\\) \\{/,
    `let progress = 0;
      let nextTopic = null;
      if (topicCount > 0) {
        nextTopic = topics[0].title;
        // simple next topic heuristic for dashboard
`
  );
  d = d.replace(
    'return { ...c, topic_count: topicCount, progress };',
    'return { ...c, topic_count: topicCount, progress, nextTopic };'
  );
}

fs.writeFileSync('src/components/Dashboard.tsx', d);
