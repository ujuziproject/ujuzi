import re

with open('server.ts', 'r') as f:
    content = f.read()

target = """  app.post('/api/generate-materials', async (req, res) => {
    try {
      const { title, description, subject_name } = req.body;
      const prompt = `Generate study materials for this topic: ${title} - ${description}, part of the subject ${subject_name}. Return JSON with: (1) lecture_notes: a clear, well-structured explanation in markdown (a few paragraphs plus key points), (2) flashcards: an array of 8-10 {question, answer} pairs testing recall of key facts, (3) quiz: an array of 5 multiple-choice questions, each with {question_text, options (4 choices), correct_answer, explanation}.`;"""

replacement = """  app.post('/api/generate-materials', async (req, res) => {
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
      
      let prompt = `Generate study materials for this topic: ${title} - ${description}, part of the subject ${subject_name}.\n\n`;
      if (styleInstruction) {
          prompt += `STYLE INSTRUCTIONS: ${styleInstruction}\n\n`;
      }
      prompt += `Return JSON with: (1) lecture_notes: a clear, well-structured explanation in markdown (a few paragraphs plus key points), (2) flashcards: an array of 8-10 {question, answer} pairs testing recall of key facts, (3) quiz: an array of 5 multiple-choice questions, each with {question_text, options (4 choices), correct_answer, explanation}.`;"""

content = content.replace(target, replacement)

with open('server.ts', 'w') as f:
    f.write(content)

