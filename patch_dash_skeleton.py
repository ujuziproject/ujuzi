import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

old_loading = """  if (view === 'loading') {
    return <div className="py-20 flex justify-center w-full"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }"""

new_loading = """  if (view === 'loading') {
    return (
      <div className="w-full animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
          <div>
            <div className="h-12 w-96 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
            <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="h-12 w-40 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="h-12 w-48 bg-slate-300 rounded-full animate-pulse"></div>
          </div>
        </div>
        {/* Hero Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="col-span-1 lg:col-span-2 bg-slate-100 rounded-[2rem] h-[340px] animate-pulse"></div>
          <div className="col-span-1 bg-slate-50 rounded-[2rem] border border-border h-[340px] animate-pulse"></div>
        </div>
      </div>
    );
  }"""

content = content.replace(old_loading, new_loading)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
