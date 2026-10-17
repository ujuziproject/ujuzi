import re

with open('server.ts', 'r') as f:
    content = f.read()

target = """  app.post('/api/extract-topics', async (req, res) => {"""

replacement = """  app.post('/api/find-curriculum', async (req, res) => {
    try {
      const { courseName, university, faculty, courseOfStudy } = req.body;
      
      let contextStr = "";
      if (university) {
         contextStr = `This is for a university student at ${university}, Faculty of ${faculty}, studying ${courseOfStudy}.`;
      }
      
      const searchPrompt = `Find the official course outline or curriculum for the course "${courseName}"${university ? ` at ${university}` : ''}. ${contextStr} If you find a reliable real curriculum, summarize it into a structured text syllabus. If you cannot find a specific one for this university, generate a high-quality standard syllabus for this course at this level. Make sure to return a clear text block representing the syllabus.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: searchPrompt,
        tools: [{ googleSearch: {} }]
      });

      if (response.text) {
         // Determine if search was used by checking grounding metadata or we can just assume based on the output.
         // Actually, let's ask the model to prefix the response with [REAL] or [FALLBACK]
         // Actually, we can check groundingMetadata, but let's just ask the model in prompt.
      }
    } catch (error: any) {
    }
  });

  app.post('/api/extract-topics', async (req, res) => {"""

# Let's improve the endpoint definition
better_replacement = """  app.post('/api/find-curriculum', async (req, res) => {
    try {
      const { courseName, university, faculty, courseOfStudy } = req.body;
      
      let contextStr = "";
      if (university) {
         contextStr = `This is for a university student at ${university}, Faculty of ${faculty}, studying ${courseOfStudy}.`;
      }
      
      const searchPrompt = `Find the official course outline or curriculum for the course "${courseName}"${university ? ` at ${university}` : ''}. ${contextStr} If you find a reliable real curriculum, summarize it into a structured text syllabus. If you cannot find a specific one for this university, generate a high-quality standard syllabus for this course at this level. 
      IMPORTANT: Your response MUST start with either [REAL] if you found and are summarizing an actual curriculum from search, or [FALLBACK] if you are generating a general one. Following that tag, provide the full text of the curriculum/syllabus.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: searchPrompt,
        tools: [{ googleSearch: {} }]
      });

      if (response.text) {
         let text = response.text.trim();
         let isReal = false;
         if (text.startsWith('[REAL]')) {
             isReal = true;
             text = text.replace('[REAL]', '').trim();
         } else if (text.startsWith('[FALLBACK]')) {
             isReal = false;
             text = text.replace('[FALLBACK]', '').trim();
         } else {
             // Fallback if tag is missing
             isReal = !!(response.candidates?.[0]?.groundingMetadata?.searchEntryPoint);
         }
         res.json({ text, isReal });
      } else {
        res.status(500).json({ error: 'Failed to generate curriculum' });
      }
    } catch (error: any) {
      console.error('Error finding curriculum:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/extract-topics', async (req, res) => {"""

content = content.replace(target, better_replacement)

with open('server.ts', 'w') as f:
    f.write(content)
