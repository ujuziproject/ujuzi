import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Track, ExamType } from '../types';
import { Loader2 } from 'lucide-react';
import { UniversityDropdown } from './UniversityDropdown';

interface Step3Props {
 userId: string;
 track: Track;
 onNext: () => void;
 onBack: () => void;
}

export function Step3ProfileForm({ userId, track, onNext, onBack }: Step3Props) {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 // Secondary states
 const [examType, setExamType] = useState<ExamType>('WAEC');
 const [examYear, setExamYear] = useState<string>(new Date().getFullYear().toString());

 // University states
 const [universityId, setUniversityId] = useState('');
 const [institution, setInstitution] = useState('');
 const [faculty, setFaculty] = useState('Sciences');
 const [course, setCourse] = useState('');
 const [level, setLevel] = useState<string>('1');

 const faculties = [
 'Sciences', 'Engineering', 'Medicine & Health Sciences', 'Law', 
 'Arts & Humanities', 'Social Sciences', 'Education', 'Agriculture', 
 'Environmental Sciences', 'Management/Business', 'Computing & Information Technology', 'Other'
 ];

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const payload: any = track === 'secondary' 
 ? {
 id: userId,
 track,
 exam_type: examType,
 exam_year: parseInt(examYear, 10)
 }
 : {
 id: userId,
 track,
 university_id: universityId || null,
 institution_name: institution,
 faculty: faculty,
 course_of_study: course,
 level_year: parseInt(level, 10)
 };

 const { error: insertError } = await supabase
 .from('student_profiles')
 .upsert(payload);

 if (insertError) throw insertError;
 
 onNext();
 } catch (err: any) {
 setError(err.message || 'Failed to save profile details.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="w-full ">
 <div className="text-center mb-10">
 
 <h1 className="text-3xl font-bold text-ink mb-2">Academic Profile</h1>
 <p className="text-slate-500 font-medium">
 {track === 'secondary' 
 ? 'Help us tailor your exam preparation journey.' 
 : 'Let us know what you are studying.'}
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
 {error}
 </div>
 )}

 {track === 'secondary' && (
 <>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
 <select
 value={examType}
 onChange={(e) => setExamType(e.target.value as ExamType)}
 className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
 >
 <option value="WAEC">WAEC</option>
 <option value="JAMB">JAMB</option>
 <option value="NECO">NECO</option>
 <option value="other">Other</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Expected Exam Year</label>
 <input
 type="number"
 required
 min={2020}
 max={2030}
 value={examYear}
 onChange={(e) => setExamYear(e.target.value)}
 className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
 placeholder="e.g. 2025"
 />
 </div>
 </>
 )}

 {track === 'university' && (
 <>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
 <UniversityDropdown
 value={universityId}
 onChange={(id, name) => {
 setUniversityId(id);
 setInstitution(name);
 }}
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
 <select
 value={faculty}
 onChange={(e) => setFaculty(e.target.value)}
 className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
 >
 {faculties.map(f => (
 <option key={f} value={f}>{f}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Course of Study</label>
 <input
 type="text"
 required
 value={course}
 onChange={(e) => setCourse(e.target.value)}
 className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
 placeholder="e.g. Computer Science"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Level / Year</label>
 <select
 value={level}
 onChange={(e) => setLevel(e.target.value)}
 className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
 >
 <option value="1">100 Level (Year 1)</option>
 <option value="2">200 Level (Year 2)</option>
 <option value="3">300 Level (Year 3)</option>
 <option value="4">400 Level (Year 4)</option>
 <option value="5">500 Level (Year 5)</option>
 <option value="6">600 Level (Year 6)</option>
 </select>
 </div>
 </>
 )}

 <button
 type="submit"
 disabled={loading}
 className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-accent/20"
 >
 {loading ? (
 <Loader2 className="w-5 h-5 animate-spin" />
 ) : (
 'Continue'
 )}
 </button>
 </form>
 </div>
 );
}
