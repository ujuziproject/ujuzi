import fs from 'fs';
let m = fs.readFileSync('src/components/Profile.tsx', 'utf-8');

// Replace "Post-Development" label
m = m.replace(/>\s*Post-Development\s*<\/button>/g, "> Independent </span>".replace("span", "button"));

// Also fix the track specific forms:
m = m.replace(/\{\s*track === 'secondary' \? \([\s\S]*?\) : \([\s\S]*?\{\/\* Profile Test Results/g, `
        {track === 'secondary' && (
          <>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Target Exam</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
              >
                <option value="WAEC">WAEC</option>
                <option value="JAMB">JAMB</option>
                <option value="NECO">NECO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Exam Year</label>
              <input
                type="number"
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                placeholder="2024"
              />
            </div>
          </>
        )}
        {track === 'university' && (
          <>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Institution</label>
              <UniversityDropdown
                value={universityId}
                onChange={(id, name) => {
                  setUniversityId(id);
                  setInstitution(name);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Faculty</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
              >
                {faculties.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Course of Study</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Level / Year</label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
                placeholder="e.g. 100 Level"
              />
            </div>
          </>
        )}
        {/* Profile Test Results
`);

fs.writeFileSync('src/components/Profile.tsx', m);
