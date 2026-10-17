import fs from 'fs';

let content = fs.readFileSync('src/components/CourseUpload.tsx', 'utf-8');

const oldEnd = `      for (const cid of courseIds) {
        if (cid) {
          await supabase.from('courses').update({ status: 'parsed' }).eq('id', cid);
        }
      }
      
      setStatus('success');
      onUploadComplete();`;

const newEnd = `      for (const cid of courseIds) {
        if (cid) {
          await supabase.from('courses').update({ status: 'parsed' }).eq('id', cid);
        }
      }
      
      try {
        const { adjustStudyPlan } = await import('../lib/pacing');
        await adjustStudyPlan(userId, profileData?.track || 'university');
      } catch (e) {
        console.error("Error generating study plan", e);
      }
      
      setStatus('success');
      onUploadComplete();`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync('src/components/CourseUpload.tsx', content);
