#!/bin/bash
sed -i -e '/app.post('"'"'\/api\/extract-topics'"'"', async (req, res) => {/i \
  app.post("/api/extract-courses", async (req, res) => {\
    try {\
      const { text } = req.body;\
      const prompt = `Here is a university student'"'"'s combined course outline for one semester, potentially covering multiple distinct courses. Identify each distinct course, and for each one provide: course_code (if identifiable, otherwise null), course_title, and a list of topics (each with title and description).`;\
      const response = await ai.models.generateContent({\
        model: "gemini-3.6-flash",\
        contents: `Here is the text: ${text}\\n\\n${prompt}`,\
        config: {\
          responseMimeType: "application/json",\
          responseSchema: {\
            type: Type.ARRAY,\
            items: {\
              type: Type.OBJECT,\
              properties: {\
                course_code: { type: Type.STRING },\
                course_title: { type: Type.STRING },\
                topics: {\
                  type: Type.ARRAY,\
                  items: {\
                    type: Type.OBJECT,\
                    properties: {\
                      title: { type: Type.STRING },\
                      description: { type: Type.STRING }\
                    },\
                    required: ["title", "description"]\
                  }\
                }\
              },\
              required: ["course_title", "topics"]\
            }\
          }\
        }\
      });\
      if (response.text) {\
        let jsonStr = response.text;\
        if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\\n?/, "").replace(/\\n?```$/, "");\
        res.json({ result: JSON.parse(jsonStr) });\
      } else {\
        res.status(500).json({ error: "Failed to generate content" });\
      }\
    } catch (error: any) {\
      console.error("Error extracting courses:", error);\
      res.status(500).json({ error: error.message });\
    }\
  });\
' server.ts
