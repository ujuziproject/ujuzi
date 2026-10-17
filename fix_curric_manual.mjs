import fs from 'fs';
let content = fs.readFileSync('src/components/CurriculumUpload.tsx', 'utf-8');

const targetStr = `      const { data: savedTopics, error: topicsError } = await supabase
        .from('topics')
        .insert(topicInserts)
        .select();
        
      if (topicsError) throw topicsError;

      // 5. Generate Materials per Topic
      // We process them sequentially or in small batches to avoid timeouts.
      let completedTopics = 0;
      for (const topic of savedTopics) {`;

const replStr = `      const { data: savedTopics, error: topicsError } = await supabase
        .from('topics')
        .insert(topicInserts)
        .select();
        
      if (topicsError) throw topicsError;

      setSavedTopics(savedTopics);
      setStatus('diagnostic');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDiagnosticComplete = async (topicsWithDepth: any[]) => {
    setStatus('generating');
    setLoading(true);

    try {
      const prefs = JSON.parse(localStorage.getItem('study_preferences') || '{}');
      let completedTopics = 0;
      for (const topic of topicsWithDepth) {`;

content = content.replace(targetStr, replStr);
fs.writeFileSync('src/components/CurriculumUpload.tsx', content);
