import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

import_line = "import { CurriculumUpload } from './CurriculumUpload';"
import_line_new = "import { CourseUpload } from './CourseUpload';\nimport { supabase } from '../lib/supabase';"
content = content.replace(import_line, import_line_new)

upload_view = """  if (view === 'upload') {
    return (
      <div className="w-full">
        {curricula.length > 0 && (
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2 font-display">Upload Curriculum</h1>
          <p className="text-slate-500">Add a new subject or syllabus to generate study materials.</p>
        </div>
        <CurriculumUpload userId={userId} onUploadComplete={() => fetchDashboardData(true)} />
      </div>
    );
  }"""

new_upload_view = """  if (view === 'upload') {
    return (
      <div className="w-full">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2 font-display">Add New Materials</h1>
          <p className="text-slate-500">Select where to add your new study materials.</p>
        </div>
        <GlobalUploadFlow userId={userId} track={track} onUploadComplete={() => fetchDashboardData(true)} />
      </div>
    );
  }"""
content = content.replace(upload_view, new_upload_view)

button_line = """          <button 
            onClick={() => setView('upload')}
            className="px-6 py-3 rounded-full bg-ink text-white text-sm font-bold hover:bg-ink/90 flex items-center gap-2 transition-colors"
          >
            + Upload Curriculum
          </button>"""
button_line_new = """          <button 
            onClick={() => setView('upload')}
            className="px-6 py-3 rounded-full bg-ink text-white text-sm font-bold hover:bg-ink/90 flex items-center gap-2 transition-colors"
          >
            + Add Materials
          </button>"""
content = content.replace(button_line, button_line_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
