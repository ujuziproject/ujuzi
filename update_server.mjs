import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('express-rate-limit')) {
  content = content.replace("import express from 'express';", "import express from 'express';\nimport rateLimit from 'express-rate-limit';");
}

const rateLimitCode = `
  const publicApiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after an hour' }
  });

  app.post("/api/public/extract-topics", publicApiLimiter, async (req, res) => {
    try {
      const { text, fileData } = req.body;
      let response;

      const prompt = \`Extract a list of topics from this curriculum document. Return an array of objects, where each object has { subject_name, title, description }. The subject_name should be a broad category, title should be the specific topic, and description should be a 1-2 sentence summary of what to study.\`;

      if (fileData) {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              inlineData: {
                mimeType: fileData.mimeType,
                data: fileData.data
              }
            },
            { text: prompt }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject_name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['subject_name', 'title', 'description']
              }
            }
          }
        });
      } else {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: \`Here is the curriculum text: \${text}\\n\\n\${prompt}\`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject_name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['subject_name', 'title', 'description']
              }
            }
          }
        });
      }

      if (response.text) {
        let jsonStr = response.text;
        if (jsonStr.startsWith('\`\`\`')) {
          jsonStr = jsonStr.replace(/^\`\`\`(?:json)?\\n?/, '').replace(/\\n?\`\`\`$/, '');
        }
        res.json({ result: JSON.parse(jsonStr) });
      } else {
        res.status(500).json({ error: 'Failed to generate content' });
      }
    } catch (error: any) {
      console.error('Error extracting public topics:', error);
      res.status(500).json({ error: error.message });
    }
  });
`;

if (!content.includes('/api/public/extract-topics')) {
  content = content.replace("// API Routes", "// API Routes\n" + rateLimitCode);
}

fs.writeFileSync('server.ts', content);
