import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

import_target = "import { Loader2, BookOpen, Layers, CheckSquare, ArrowLeft } from 'lucide-react';"
import_new = "import { Loader2, BookOpen, Layers, CheckSquare, ArrowLeft, Edit2 } from 'lucide-react';"
content = content.replace(import_target, import_new)

render_target = """          <h2 className="text-2xl font-bold text-ink mb-2">{topic.title}</h2>"""
render_new = """          <h2 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2 group/title">
             {topic.title}
             <button 
                onClick={async () => {
                   const newTitle = prompt('Rename topic:', topic.title);
                   if (newTitle && newTitle.trim() !== '') {
                      await supabase.from('topics').update({ title: newTitle }).eq('id', topic.id);
                      topic.title = newTitle; // Update local state immediately
                      setRefreshKey(k => k + 1); // Trigger re-render
                   }
                }}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-ink opacity-0 group-hover/title:opacity-100 transition-opacity"
             >
                <Edit2 className="w-4 h-4" />
             </button>
          </h2>"""
content = content.replace(render_target, render_new)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
