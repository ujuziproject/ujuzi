import fs from 'fs';
let content = fs.readFileSync('src/components/CurriculumUpload.tsx', 'utf-8');

const targetStr = `      // 6. Update Curriculum Status
      await supabase
        .from('curricula')
        .update({ status: 'parsed' })
        .eq('id', curriculumId);

      await recordActivity(userId, 'curriculum_uploaded', { curriculumId });

      if (onUploadComplete) {
        onUploadComplete();
      } else {
        setCompletedCurriculumId(curriculumId);
      }`;

const replStr = `      // 6. Update Curriculum Status
      const curriculumId = topicsWithDepth[0]?.curriculum_id;
      if (curriculumId) {
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

content = content.replace(targetStr, replStr);
fs.writeFileSync('src/components/CurriculumUpload.tsx', content);
