import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

target = """              <h3 className="text-lg font-bold text-ink mb-1">{topic.title}</h3>"""
replacement = """              <h3 className="text-lg font-bold text-ink mb-1 flex items-center gap-2 group/h3">
                 {topic.title}
                 <div 
                    onClick={async (e) => {
                       e.stopPropagation();
                       const newTitle = prompt('Rename topic:', topic.title);
                       if (newTitle && newTitle.trim() !== '') {
                          await supabase.from('topics').update({ title: newTitle }).eq('id', topic.id);
                          topic.title = newTitle;
                          setRefreshKey(k => k + 1);
                       }
                    }}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-ink opacity-0 group-hover/h3:opacity-100 transition-opacity"
                 >
                    <Edit2 className="w-3.5 h-3.5" />
                 </div>
              </h3>"""
content = content.replace(target, replacement)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)

