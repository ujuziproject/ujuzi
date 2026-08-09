import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# We need to replace lines 380 to 434 roughly.
# Let's find the boundaries.
start_idx = content.find('{(totalTopics > 0 || curricula.length > 0) ? (')
end_idx = content.find('{/* Stats Cards */}')

if start_idx != -1 and end_idx != -1:
    replacement = """
      <div className="bg-gradient-to-br from-[#110B30] to-[#1A114D] rounded-3xl p-8 md:p-11 mb-6 relative overflow-hidden text-white shadow-sm">
         <div className="relative z-10 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 bg-accent-warm/15 border border-[#F5A623]/25 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold mb-4 backdrop-blur-sm">
               {totalTopics > 0 || curricula.length > 0 
                 ? (isPlanUpToDate ? "✦ Your plan is up to date" : "✦ You have tasks pending today")
                 : "✦ Ready to start"}
            </div>
               
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
               {totalTopics > 0 || curricula.length > 0 ? 'Welcome back' : 'Welcome to uJuzi'}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5A623] to-[#E85D8F]">{firstName}</span>.
            </h1>
               
            <p className="text-white/70 text-[15px] mb-6 max-w-xl">
               {totalTopics > 0 || curricula.length > 0 
                 ? nextUpText
                 : "Your dashboard is looking a little empty. Follow these simple steps to start turning your study materials into interactive, AI-powered learning experiences."}
            </p>
               
            <div className="flex flex-wrap items-center gap-3">
               {(totalTopics > 0 || curricula.length > 0) ? (
                 <>
                   <button onClick={() => {
                     const firstPending = plannerItems.find(i => !i.completed);
                     if (firstPending && firstPending.topic_id) {
                       setInitialTopicId(firstPending.topic_id);
                       setView('curriculum');
                     } else if (mostActiveCourse) {
                       setDashboardCourseId(mostActiveCourse.id);
                       setDashboardCurriculumId(mostActiveCourse.id);
                       setView('courseDetail');
                     }
                   }} className="bg-accent text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]">
                     <Play className="w-[18px] h-[18px] fill-current" /> Start today's session
                   </button>
                   <button onClick={() => { document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-transparent text-white border-2 border-white/25 px-6 py-[12px] rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-white/10 transition-colors">
                     Adjust plan <ArrowRight className="w-4 h-4" />
                   </button>
                 </>
               ) : (
                 <button 
                  onClick={() => setView('upload')}
                  className="bg-accent text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]"
                 >
                   <Plus className="w-[18px] h-[18px] fill-current" /> Add Materials
                 </button>
               )}
            </div>
         </div>
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#5B4FE8]/20 to-[#9B5DE8]/20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      </div>
      
"""
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open('src/components/Dashboard.tsx', 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Could not find boundaries")
