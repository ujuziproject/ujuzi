import re

with open('src/components/Progress.tsx', 'r') as f:
    content = f.read()

target = """      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-bold text-ink mb-4 font-display flex items-center gap-2">"""
replacement = """      <div className="mb-10">
        {renderCalendar()}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-bold text-ink mb-4 font-display flex items-center gap-2">"""
content = content.replace(target, replacement)

with open('src/components/Progress.tsx', 'w') as f:
    f.write(content)
