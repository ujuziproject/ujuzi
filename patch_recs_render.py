import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Append recommended section right before the end of the main view
old_tail = """        )}
      </div>
    </div>
  );
}"""

new_tail = """        )}
      </div>
      
      {recommendations && recommendations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">Recommended for You</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {recommendations.map(r => (
              <a href={r.url} target="_blank" rel="noopener noreferrer" key={r.id} className="bg-white rounded-[1.5rem] border border-border p-5 hover:border-ink hover:shadow-md transition-all group flex flex-col h-full">
                <h3 className="font-bold text-ink mb-2 line-clamp-2">{r.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{r.description}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-accent-warm group-hover:text-ink transition-colors">
                  {r.type}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}"""

content = content.replace(old_tail, new_tail)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
