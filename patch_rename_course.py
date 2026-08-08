import re

with open('src/components/SemesterDetail.tsx', 'r') as f:
    content = f.read()

import_target = "import { Folder, Plus, ArrowLeft, BookOpen, Layers } from 'lucide-react';"
import_new = "import { Folder, Plus, ArrowLeft, BookOpen, Layers, Edit2 } from 'lucide-react';"
content = content.replace(import_target, import_new)

render_target = """              <div className="flex items-start justify-between w-full mb-3">
                <h3 className="text-lg font-bold text-ink font-display leading-tight flex-1">{c.course_title}</h3>
                {c.course_code && (
                  <span className="bg-surface border border-border text-xs font-bold px-2 py-1 rounded-md ml-2 text-slate-500">{c.course_code}</span>
                )}
              </div>"""
render_new = """              <div className="flex items-start justify-between w-full mb-3 group/header">
                <h3 className="text-lg font-bold text-ink font-display leading-tight flex-1 flex items-center gap-2">
                   {c.course_title}
                   <div 
                     onClick={async (e) => {
                        e.stopPropagation();
                        const newTitle = prompt('Rename course:', c.course_title);
                        if (newTitle && newTitle.trim() !== '') {
                           await supabase.from('courses').update({ course_title: newTitle }).eq('id', c.id);
                           fetchData();
                        }
                     }}
                     className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-ink opacity-0 group-hover/header:opacity-100 transition-opacity"
                   >
                     <Edit2 className="w-3.5 h-3.5" />
                   </div>
                </h3>
                {c.course_code && (
                  <span className="bg-surface border border-border text-xs font-bold px-2 py-1 rounded-md ml-2 text-slate-500">{c.course_code}</span>
                )}
              </div>"""
content = content.replace(render_target, render_new)

with open('src/components/SemesterDetail.tsx', 'w') as f:
    f.write(content)


with open('src/components/GoalDetail.tsx', 'r') as f:
    content2 = f.read()

import_target2 = "import { Target, ArrowLeft, BookOpen, Layers } from 'lucide-react';"
import_new2 = "import { Target, ArrowLeft, BookOpen, Layers, Edit2 } from 'lucide-react';"
content2 = content2.replace(import_target2, import_new2)

render_target2 = """              <div className="flex items-start justify-between w-full mb-3">
                <h3 className="text-lg font-bold text-ink font-display leading-tight flex-1">{c.course_title}</h3>
                {c.course_code && (
                  <span className="bg-surface border border-border text-xs font-bold px-2 py-1 rounded-md ml-2 text-slate-500">{c.course_code}</span>
                )}
              </div>"""
render_new2 = """              <div className="flex items-start justify-between w-full mb-3 group/header">
                <h3 className="text-lg font-bold text-ink font-display leading-tight flex-1 flex items-center gap-2">
                   {c.course_title}
                   <div 
                     onClick={async (e) => {
                        e.stopPropagation();
                        const newTitle = prompt('Rename course:', c.course_title);
                        if (newTitle && newTitle.trim() !== '') {
                           await supabase.from('courses').update({ course_title: newTitle }).eq('id', c.id);
                           fetchData();
                        }
                     }}
                     className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-ink opacity-0 group-hover/header:opacity-100 transition-opacity"
                   >
                     <Edit2 className="w-3.5 h-3.5" />
                   </div>
                </h3>
                {c.course_code && (
                  <span className="bg-surface border border-border text-xs font-bold px-2 py-1 rounded-md ml-2 text-slate-500">{c.course_code}</span>
                )}
              </div>"""
content2 = content2.replace(render_target2, render_new2)

with open('src/components/GoalDetail.tsx', 'w') as f:
    f.write(content2)
