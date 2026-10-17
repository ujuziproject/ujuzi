import fs from 'fs';

let content = fs.readFileSync('src/components/CurriculumUpload.tsx', 'utf-8');

const targetStr = `  if (completedCurriculumId) {
    return <CurriculumResults curriculumId={completedCurriculumId} userId={userId} />;
  }

  return (`;

const replStr = `  if (completedCurriculumId) {
    return <CurriculumResults curriculumId={completedCurriculumId} userId={userId} />;
  }

  if (status === 'diagnostic') {
    return (
      <DiagnosticFlow 
        topics={savedTopics} 
        onComplete={handleDiagnosticComplete} 
      />
    );
  }

  return (`;

content = content.replace(targetStr, replStr);
fs.writeFileSync('src/components/CurriculumUpload.tsx', content);

