import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Save, Upload } from 'lucide-react';
import { Track } from '../types';
import { Step5LearningStyle } from './Step5LearningStyle';
import { UniversityDropdown } from './UniversityDropdown';

function Step5LearningStyleWrapper({userId, onComplete}: {userId: string, onComplete: () => void}) {
  return <Step5LearningStyle userId={userId} onNext={onComplete} />;
}

export function Profile({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [track, setTrack] = useState<Track>('secondary');
  const [universityId, setUniversityId] = useState('');
  const [institution, setInstitution] = useState('');
  const [faculty, setFaculty] = useState('Sciences');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  
  const faculties = [
    'Sciences', 'Engineering', 'Medicine & Health Sciences', 'Law', 
    'Arts & Humanities', 'Social Sciences', 'Education', 'Agriculture', 
    'Environmental Sciences', 'Management/Business', 'Computing & Information Technology', 'Other'
  ];
  const [examType, setExamType] = useState('WAEC');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [msg, setMsg] = useState('');
  const [myInterests, setMyInterests] = useState<string[]>([]);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [contentFormat, setContentFormat] = useState('balanced');
  const [explanationComplexity, setExplanationComplexity] = useState('balanced');
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  const [retakingQuiz, setRetakingQuiz] = useState(false);

  const loadProfile = async () => {
    const { data: profile } = await supabase.from('student_profiles').select('*').eq('id', userId).maybeSingle();
    if (profile) {
      setTrack(profile.track as Track);
      setUniversityId(profile.university_id || '');
      setInstitution(profile.institution_name || '');
      setCourse(profile.course_of_study || '');
      setLevel(profile.level_year?.toString() || '');
      setFaculty(profile.faculty || 'Sciences');
      setExamType(profile.exam_type || 'WAEC');
      setExamYear(profile.exam_year?.toString() || new Date().getFullYear().toString());
      
      setContentFormat(profile.content_format_preference || 'balanced');
      setExplanationComplexity(profile.explanation_complexity_preference || 'balanced');
      setHasTakenQuiz(!!profile.learning_style_set_at);

      if (profile.timezone) setTimezone(profile.timezone);
      
      const { data: pData } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
      if (pData?.avatar_url) setAvatarUrl(pData.avatar_url);
    }
    
    // Fetch interests
    const { data: userInterests } = await supabase.from('student_interests').select('interest_id').eq('student_id', userId);
    if (userInterests && userInterests.length > 0) {
        const { data: interestsData } = await supabase.from('interests').select('name').in('id', userInterests.map((i: any) => i.interest_id));
        if (interestsData) {
            setMyInterests(interestsData.map((i: any) => i.name));
        }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const url = publicUrlData.publicUrl;
      
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
      setAvatarUrl(url);
    } catch (error) {
      console.error(error);
      setMsg('Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    const updates = {
      id: userId,
      track,
      university_id: track === 'university' ? (universityId || null) : null,
      institution_name: track === 'university' ? institution : null,
      faculty: track === 'university' ? faculty : null,
      course_of_study: track === 'university' ? course : null,
      level_year: track === 'university' ? parseInt(level) || null : null,
      exam_type: track === 'secondary' ? examType : null,
      exam_year: track === 'secondary' ? parseInt(examYear) : null,
      timezone: timezone,
      content_format_preference: contentFormat,
      explanation_complexity_preference: explanationComplexity,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('student_profiles').upsert(updates);
    setSaving(false);
    if (!error) {
      setMsg('Profile saved successfully.');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg('Failed to save profile.');
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="w-full max-w-2xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2 font-display">My Profile</h1>
        <p className="text-slate-500">Update your academic information.</p>
      </div>

      <div className="bg-surface-alt p-8 rounded-3xl border border-border shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-ink mb-2">Track</label>
          <div className="flex gap-4">
            <button
              onClick={() => setTrack('secondary')}
              className={`flex-1 py-3 px-4 rounded-full border text-sm font-semibold transition-colors ${track === 'secondary' ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-surface border-border text-slate-500 hover:border-accent/30'}`}
            >
              Secondary School
            </button>
            <button
              onClick={() => setTrack('university')}
              className={`flex-1 py-3 px-4 rounded-full border text-sm font-semibold transition-colors ${track === 'university' ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-surface border-border text-slate-500 hover:border-accent/30'}`}
            >
              University
            </button>
            <button
              onClick={() => setTrack('independent')}
              className={`flex-1 py-3 px-4 rounded-full border text-sm font-semibold transition-colors ${track === 'independent' ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-surface border-border text-slate-500 hover:border-accent/30'}`}
            > Independent </button>
          </div>
        </div>

        
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
                initialName={institution}
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
 */}
        <div className="pt-8 border-t border-border mt-8">
            <h2 className="text-xl font-bold text-ink mb-4 font-display">Profile Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface p-5 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Interests</h3>
                    {myInterests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {myInterests.map(interest => (
                                <span key={interest} className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No interests selected yet.</p>
                    )}
                </div>
                <div className="bg-surface p-5 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Learning Style</h3>
                    {hasTakenQuiz ? (
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Content Format</p>
                                <p className="text-sm font-medium text-ink capitalize">{contentFormat.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Explanation Complexity</p>
                                <p className="text-sm font-medium text-ink capitalize">{explanationComplexity.replace('_', ' ')}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Learning style quiz not taken yet.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="pt-4 flex items-center justify-between mt-4 border-t border-border">
          <span className="text-sm font-semibold text-success">{msg}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-ink text-white hover:bg-ink/90 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
