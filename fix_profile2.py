import re

with open('src/components/Profile.tsx', 'r') as f:
    content = f.read()

# 1. Add imports:
content = content.replace("import { Loader2, Save } from 'lucide-react';", "import { Loader2, Save, Upload } from 'lucide-react';")

# 2. Add state for avatar and timezone
state_block = """  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [msg, setMsg] = useState('');
  const [myInterests, setMyInterests] = useState<string[]>([]);
"""
new_state = state_block + """
  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
"""
content = content.replace(state_block, new_state)

# 3. Add to loadProfile
load_block = """      setContentFormat(profile.content_format_preference || 'balanced');
      setExplanationComplexity(profile.explanation_complexity_preference || 'balanced');
      setHasTakenQuiz(!!profile.learning_style_set_at);
"""
new_load = load_block + """
      if (profile.timezone) setTimezone(profile.timezone);
      
      const { data: pData } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
      if (pData?.avatar_url) setAvatarUrl(pData.avatar_url);
"""
content = content.replace(load_block, new_load)

# 4. Add to handleSave
save_block = """      level_year: track === 'university' ? parseInt(level) || null : null,
      exam_type: track === 'secondary' ? examType : null,
      exam_year: track === 'secondary' ? parseInt(examYear) : null,
      content_format_preference: contentFormat,
      explanation_complexity_preference: explanationComplexity,
      timezone: timezone,
"""
content = content.replace("      exam_year: track === 'secondary' ? parseInt(examYear) : null,", "      exam_year: track === 'secondary' ? parseInt(examYear) : null,\n      timezone: timezone,")

# 5. Add Avatar Upload handler
handlers = """  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
"""
content = content.replace("  const handleSave = async () => {", handlers + "\n  const handleSave = async () => {")

# 6. Add UI for Avatar and Timezone
ui_block = """      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2 font-display">My Profile</h1>
        <p className="text-slate-500">Update your academic information.</p>
      </div>
      <div className="bg-surface-alt p-8 rounded-3xl border border-border shadow-sm space-y-6">"""

new_ui = """      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2 font-display">My Profile</h1>
        <p className="text-slate-500">Update your academic information.</p>
      </div>
      <div className="bg-surface-alt p-8 rounded-3xl border border-border shadow-sm space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6 pb-6 border-b border-border">
           <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">?</div>
              )}
              {uploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
           </div>
           <div>
              <label className="cursor-pointer bg-surface border border-border hover:border-accent hover:text-accent transition-colors px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <Upload className="w-4 h-4" /> Change Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
              <p className="text-xs text-slate-500 mt-2">Upload a square image, max 2MB.</p>
           </div>
        </div>

        {/* Timezone */}
        <div>
           <label className="block text-sm font-bold text-ink mb-2">Timezone</label>
           <select
             value={timezone}
             onChange={(e) => setTimezone(e.target.value)}
             className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink"
           >
             <option value="Africa/Lagos">West Africa Time (Africa/Lagos)</option>
             <option value="Africa/Nairobi">East Africa Time (Africa/Nairobi)</option>
             <option value="Africa/Johannesburg">South Africa Standard Time (Africa/Johannesburg)</option>
             <option value="Europe/London">Greenwich Mean Time (Europe/London)</option>
           </select>
        </div>
"""
content = content.replace(ui_block, new_ui)

# Fix UniversityDropdown initialName
content = content.replace("value={universityId}", "value={universityId}\n                initialName={institution}")

with open('src/components/Profile.tsx', 'w') as f:
    f.write(content)

