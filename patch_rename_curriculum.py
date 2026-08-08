import re

with open('src/components/MyCurricula.tsx', 'r') as f:
    content = f.read()

import_target = "import { Loader2, BookOpen, Plus, ArrowLeft } from 'lucide-react';"
import_new = "import { Loader2, BookOpen, Plus, ArrowLeft, Edit2 } from 'lucide-react';"
content = content.replace(import_target, import_new)

render_target = """                  <h3 className="font-bold text-ink text-lg line-clamp-1">{c.title}</h3>"""
render_new = """                  <h3 className="font-bold text-ink text-lg line-clamp-1 flex items-center gap-2 group/title">
                     {c.title}
                     <div 
                        onClick={async (e) => {
                           e.stopPropagation();
                           const newTitle = prompt('Rename curriculum:', c.title);
                           if (newTitle && newTitle.trim() !== '') {
                              await supabase.from('curricula').update({ title: newTitle }).eq('id', c.id);
                              fetchCurricula();
                           }
                        }}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-ink opacity-0 group-hover/title:opacity-100 transition-opacity"
                     >
                        <Edit2 className="w-4 h-4" />
                     </div>
                  </h3>"""
content = content.replace(render_target, render_new)

with open('src/components/MyCurricula.tsx', 'w') as f:
    f.write(content)

