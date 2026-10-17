import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// 1. Rewrite ChecklistItem
const checklistItemRegex = /function ChecklistItem\(\{\s*title,\s*subText,\s*xp,\s*complete,\s*actionText,\s*onAction,\s*icon:\s*Icon,\s*darkButton\s*\}\s*:\s*any\)\s*\{[\s\S]*?return\s*\([\s\S]*?\}\);?\n\}/;

const newChecklistItem = `function ChecklistItem({ title, subText, complete, actionText, onAction, icon: Icon, darkButton }: any) {
  return (
    <div className={\`flex items-center justify-between p-4 rounded-[20px] mb-3 \${complete ? 'bg-[#E2F7EB]' : 'bg-white border border-slate-100 shadow-sm'}\`}>
       <div className="flex items-center gap-4">
          <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${complete ? 'bg-[#6C5CE7] text-white' : 'bg-[#F4F4F6] text-slate-500'}\`}>
             {complete ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> : Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <div className={\`font-bold text-[15px] \${complete ? 'text-slate-500 line-through' : 'text-ink'}\`}>{title}</div>
            <div className="text-[13px] text-slate-500 font-medium">{subText}</div>
          </div>
       </div>
       <div className="flex items-center gap-3">
          {!complete && actionText && (
            <button onClick={onAction} className={\`text-[13px] font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors \${darkButton ? 'bg-[#110B29] text-white hover:bg-[#1A114D]' : 'bg-[#6C5CE7] text-white hover:bg-[#5B4FE8]'}\`}>
              {actionText} {darkButton ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/></svg> : <ArrowRight className="w-4 h-4" />}
            </button>
          )}
       </div>
    </div>
  );
}`;

content = content.replace(checklistItemRegex, newChecklistItem);

// 2. Remove the "NEW LEARNER / ACTIVE LEARNER" toggle
const toggleRegex = /\s*\{\/\*\s*Top Toggle\s*\*\/\}\s*<div className="flex justify-end mb-6">[\s\S]*?<\/div>\s*<\/div>\n/;
content = content.replace(toggleRegex, '\n');

// 3. Update Hero Subtext
const subtextRegex = /<p className="text-white\/70 text-\[16px\] mb-10 leading-relaxed max-w-\[420px\]">\s*You're 2 steps from your first AI-built study pack\. Finish setup and we'll turn your syllabus into notes, cards and quizzes\.\s*<\/p>/;
const newSubtext = `<p className="text-white/70 text-[16px] mb-10 leading-relaxed max-w-[420px]">
               {6 - setupTasksCount > 0 
                  ? \`You're \${6 - setupTasksCount} step\${6 - setupTasksCount === 1 ? '' : 's'} from your first AI-built study pack. Finish setup and we'll turn your syllabus into notes, cards and quizzes.\`
                  : \`You're all set! We've turned your syllabus into notes, cards and quizzes.\`}
            </p>`;
content = content.replace(subtextRegex, newSubtext);

// 4. Remove XP Bar
const xpBarRegex = /\s*<div className="w-full max-w-\[400px\] mb-10">[\s\S]*?<\/div>\n\s*<\/div>/;
content = content.replace(xpBarRegex, '');

// 5. Update checklist items (remove xp=...)
content = content.replace(/xp=\{20\}\s*/, '');
content = content.replace(/xp=\{30\}\s*/, '');
content = content.replace(/xp=\{40\}\s*/, '');
content = content.replace(/xp=\{60\}\s*/, '');
content = content.replace(/xp=\{80\}\s*/, '');

// 6. Wrap "What unlocks next" and "Your launch quests" so they hide when complete
// But wait, the user said "Add a new section beneath the checklist (only shown while the checklist is still active/incomplete)"
// Should the checklist itself also hide when complete? Let's just wrap "What unlocks next" for now, or maybe the whole setup block.
// "only shown while the checklist is still active/incomplete" -> let's wrap just that section for now. Wait, if it's 100%, does the user want the whole checklist gone? 
// The checklist says "4/6 Complete". Let's wrap "What unlocks next" and the checklist if setupProgressPercent < 100.
// Let's wrap "What unlocks next" first.

const unlocksNextRegex = /\{\/\*\s*What unlocks next\s*\*\/\}\s*<div className="bg-white rounded-\[32px\] p-8 md:p-10 shadow-sm border border-slate-100 mb-10">[\s\S]*?<\/div>\s*<\/div>/;

const unlocksMatch = content.match(unlocksNextRegex);
if (unlocksMatch) {
    const wrappedUnlocks = `{setupProgressPercent < 100 && (
      <>
      {/* What unlocks next */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
         <h3 className="font-display font-extrabold text-[24px] text-[#110B29] tracking-tight mb-8">What unlocks next</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#EAE4FF] rounded-[28px] p-7">
               <div className="w-14 h-14 bg-[#110B29] rounded-full flex items-center justify-center mb-6 text-white shadow-sm">
                  <BookOpen className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-[18px] text-[#110B29] mb-3 leading-tight">Syllabus → study plan</h4>
               <p className="text-[#695D94] text-[15px] font-medium leading-relaxed">Drop your WAEC, JAMB or course outline. We map every topic to a session.</p>
            </div>
            
            <div className="bg-[#FFF6D9] rounded-[28px] p-7">
               <div className="w-14 h-14 bg-[#110B29] rounded-full flex items-center justify-center mb-6 text-white shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M12 2v20"/></svg>
               </div>
               <h4 className="font-extrabold text-[18px] text-[#110B29] mb-3 leading-tight">Flashcards that adapt</h4>
               <p className="text-[#A5824C] text-[15px] font-medium leading-relaxed">Cards resurface exactly when you're about to forget them.</p>
            </div>
            
            <div className="bg-[#B9E9CD] rounded-[28px] p-7">
               <div className="w-14 h-14 bg-[#110B29] rounded-full flex items-center justify-center mb-6 text-white shadow-sm">
                  <Target className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-[18px] text-[#110B29] mb-3 leading-tight">Exam-shaped quizzes</h4>
               <p className="text-[#4E8D6B] text-[15px] font-medium leading-relaxed">Questions written in the style you'll actually be tested on.</p>
            </div>
         </div>
      </div>
      </>
      )}
`;
    content = content.replace(unlocksNextRegex, wrappedUnlocks);
}


fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('done');
