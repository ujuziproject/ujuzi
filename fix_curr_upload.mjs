import fs from 'fs';

let content = fs.readFileSync('src/components/CurriculumUpload.tsx', 'utf-8');

const oldEnd = `      if (curriculumId) {
        await supabase
          .from('curricula')
          .update({ status: 'parsed' })
          .eq('id', curriculumId);
          
        await recordActivity(userId, 'curriculum_uploaded', { curriculumId });

        if (onUploadComplete) {
          onUploadComplete();
        } else {
          setCompletedCurriculumId(curriculumId);
        }
      } else {
         if (onUploadComplete) onUploadComplete();
      }`;

const newEnd = `      if (curriculumId) {
        await supabase
          .from('curricula')
          .update({ status: 'parsed' })
          .eq('id', curriculumId);
          
        await recordActivity(userId, 'curriculum_uploaded', { curriculumId });

        try {
          const { adjustStudyPlan } = await import('../lib/pacing');
          await adjustStudyPlan(userId, 'secondary');
        } catch (e) {
          console.error("Error generating study plan", e);
        }

        if (onUploadComplete) {
          onUploadComplete();
        } else {
          setCompletedCurriculumId(curriculumId);
        }
      } else {
         if (onUploadComplete) onUploadComplete();
      }`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync('src/components/CurriculumUpload.tsx', content);
