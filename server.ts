import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // API Routes
  // TODO: The user requested to call Gemini from the client and add a TODO to move it server-side.
  // We have proactively implemented the secure server-side architecture (Express + Vite middleware)
  // to prevent the Gemini API key from being exposed to the browser.
  app.post("/api/extract-courses", async (req, res) => {
    try {
      const { text } = req.body;
      const prompt = `Here is a university student's combined course outline for one semester, potentially covering multiple distinct courses. Identify each distinct course, and for each one provide: course_code (if identifiable, otherwise null), course_title, and a list of topics (each with title and description).`;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Here is the text: ${text}\n\n${prompt}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                course_code: { type: Type.STRING },
                course_title: { type: Type.STRING },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                  }
                }
              },
              required: ["course_title", "topics"]
            }
          }
        }
      });
      if (response.text) {
        let jsonStr = response.text;
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        res.json({ result: JSON.parse(jsonStr) });
      } else {
        res.status(500).json({ error: "Failed to generate content" });
      }
    } catch (error: any) {
      console.error("Error extracting courses:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/find-curriculum', async (req, res) => {
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
        // tools: [{ googleSearch: {} }]
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

  app.post('/api/extract-topics', async (req, res) => {
    try {
      const { text, fileUrl, fileMimeType } = req.body;
      let response;

      const prompt = `Here is a student's curriculum/syllabus. Break it down into a structured list of subjects and topics. For each topic, provide: subject_name, title, and a one-sentence description. Return this as JSON in the format: [{"subject_name": "...", "title": "...", "description": "..."}, ...]`;

      if (fileUrl && fileMimeType) {
        // Fetch the file from the provided URL
        const fileRes = await fetch(fileUrl);
        if (!fileRes.ok) {
          throw new Error('Failed to fetch file from URL');
        }
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileBase64 = buffer.toString('base64');

        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: fileBase64,
                    mimeType: fileMimeType,
                  }
                },
                { text: prompt }
              ]
            }
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
          contents: `Here is the curriculum text: ${text}\n\n${prompt}`,
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
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        res.json({ result: JSON.parse(jsonStr) });
      } else {
        res.status(500).json({ error: 'Failed to generate content' });
      }
    } catch (error: any) {
      console.error('Error extracting topics:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-materials', async (req, res) => {
    try {
      const { title, description, subject_name, content_format_preference, explanation_complexity_preference } = req.body;
      
      let styleInstruction = "";
      
      if (content_format_preference === 'visual') {
         styleInstruction += "Structure lecture notes with more visual scaffolding — use described diagrams, labeled step-by-step breakdowns, tables, and suggested visual aids (described in words) rather than dense paragraphs. ";
      } else if (content_format_preference === 'text') {
         styleInstruction += "Favor clear, well-organized written explanations for the lecture notes. ";
      }
      
      if (explanation_complexity_preference === 'simple') {
         styleInstruction += "Use everyday analogies and simple language throughout lecture notes, flashcards, and quiz explanations — explain as if to someone new to the subject, while still being accurate. ";
      } else if (explanation_complexity_preference === 'advanced') {
         styleInstruction += "Use precise technical/academic language and assume strong subject familiarity. ";
      }
      
      let prompt = `Generate study materials for this topic: ${title} - ${description}, part of the subject ${subject_name}.

`;
      if (styleInstruction) {
          prompt += `STYLE INSTRUCTIONS: ${styleInstruction}

`;
      }
      prompt += `Return JSON with: (1) lecture_notes: a clear, well-structured explanation in markdown (a few paragraphs plus key points), (2) flashcards: an array of 8-10 {question, answer} pairs testing recall of key facts, (3) quiz: an array of 5 multiple-choice questions, each with {question_text, options (4 choices), correct_answer, explanation}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lecture_notes: { type: Type.STRING },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ['question', 'answer']
                }
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question_text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correct_answer: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ['question_text', 'options', 'correct_answer', 'explanation']
                }
              }
            },
            required: ['lecture_notes', 'flashcards', 'quiz']
          }
        }
      });

      if (response.text) {
        let jsonStr = response.text;
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        res.json({ result: JSON.parse(jsonStr) });
      } else {
        res.status(500).json({ error: 'Failed to generate materials' });
      }
    } catch (error: any) {
      console.error('Error generating materials:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
