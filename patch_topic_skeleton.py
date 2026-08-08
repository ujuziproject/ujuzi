import re

with open('src/components/CurriculumResults.tsx', 'r') as f:
    content = f.read()

# CurriculumResults loading
old_curr_loading = """  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }"""

new_curr_loading = """  if (loading) {
    return (
      <div className="animate-in fade-in duration-500 w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 w-96 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse h-[160px]"></div>
          ))}
        </div>
      </div>
    );
  }"""

content = content.replace(old_curr_loading, new_curr_loading)

# TopicView loading
old_topic_loading = """          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : ("""

new_topic_loading = """          {loading ? (
            <div className="animate-in fade-in duration-500">
              <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          ) : ("""

content = content.replace(old_topic_loading, new_topic_loading)

with open('src/components/CurriculumResults.tsx', 'w') as f:
    f.write(content)
