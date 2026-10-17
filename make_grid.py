import re

with open('src/components/Step3ProfileForm.tsx', 'r') as f:
    content = f.read()

target_secondary = """        {track === 'secondary' && (
          <>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Target Exam</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              >
                <option value="WAEC">WAEC</option>
                <option value="JAMB">JAMB</option>
                <option value="NECO">NECO</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Expected Exam Year</label>
              <input 
                type="text" 
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
                placeholder="e.g. 2024"
                maxLength={4}
              />
            </div>
          </>
        )}"""

replacement_secondary = """        {track === 'secondary' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">Target Exam</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="block w-full px-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
              >
                <option value="WAEC">WAEC</option>
                <option value="JAMB">JAMB</option>
                <option value="NECO">NECO</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">Expected Exam Year</label>
              <input 
                type="text" 
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="block w-full px-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
                placeholder="e.g. 2024"
                maxLength={4}
              />
            </div>
          </div>
        )}"""

content = content.replace(target_secondary, replacement_secondary)

target_university = """        {track === 'university' && (
          <>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Institution</label>
              <UniversityDropdown 
                value={universityId} 
                onChange={(id, name) => {
                  setUniversityId(id);
                  setInstitution(name);
                }} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Faculty / College</label>
              <select 
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              >
                {faculties.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Course of Study</label>
              <input 
                type="text" 
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Computer Science"
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Level / Year</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors"
              >
                <option value="1">100 Level (First Year)</option>
                <option value="2">200 Level (Second Year)</option>
                <option value="3">300 Level (Third Year)</option>
                <option value="4">400 Level (Fourth Year)</option>
                <option value="5">500 Level (Fifth Year)</option>
                <option value="6">600 Level (Sixth Year)</option>
              </select>
            </div>
          </>
        )}"""

replacement_university = """        {track === 'university' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">Institution</label>
              <UniversityDropdown 
                value={universityId} 
                onChange={(id, name) => {
                  setUniversityId(id);
                  setInstitution(name);
                }} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">Faculty / College</label>
              <select 
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="block w-full px-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
              >
                {faculties.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">Course of Study</label>
              <input 
                type="text" 
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Computer Science"
                className="block w-full px-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ink/70 mb-2 uppercase tracking-wider">Level / Year</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="block w-full px-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-white transition-colors font-medium"
              >
                <option value="1">100 Level (First Year)</option>
                <option value="2">200 Level (Second Year)</option>
                <option value="3">300 Level (Third Year)</option>
                <option value="4">400 Level (Fourth Year)</option>
                <option value="5">500 Level (Fifth Year)</option>
                <option value="6">600 Level (Sixth Year)</option>
              </select>
            </div>
          </div>
        )}"""
content = content.replace(target_university, replacement_university)

with open('src/components/Step3ProfileForm.tsx', 'w') as f:
    f.write(content)
