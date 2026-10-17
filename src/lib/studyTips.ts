// Short, well-established findings from learning science, shown while students wait
// and during onboarding. Keep these accurate: no made-up statistics.

export interface StudyTip {
  emoji: string;
  title: string;
  body: string;
}

export const STUDY_TIPS: StudyTip[] = [
  {
    emoji: '🧠',
    title: 'Test yourself, don’t just reread',
    body: 'Trying to recall an answer (like with flashcards and quizzes) strengthens memory far more than reading your notes again. Researchers call this the testing effect.',
  },
  {
    emoji: '📅',
    title: 'Spread it out',
    body: 'Studying a topic a little over several days beats one long cram session. That’s why your Planner schedules flashcards a day later and the quiz a few days after.',
  },
  {
    emoji: '📉',
    title: 'The forgetting curve',
    body: 'We forget much of what we learn within days unless we review it. Each well-timed review flattens the curve, so the memory lasts longer.',
  },
  {
    emoji: '🔀',
    title: 'Mix your practice',
    body: 'Switching between different types of questions (interleaving) feels harder, but it trains you to pick the right method — exactly what exams demand.',
  },
  {
    emoji: '💬',
    title: 'Explain it in your own words',
    body: 'Asking yourself “why?” and “how?” and explaining the answer out loud connects new ideas to what you already know.',
  },
  {
    emoji: '😴',
    title: 'Sleep is study time too',
    body: 'Your brain consolidates new memories while you sleep. A good night’s rest before an exam is worth more than an all-nighter.',
  },
  {
    emoji: '⏱️',
    title: 'Short, focused blocks',
    body: 'Many students study in 25-minute blocks with 5-minute breaks. Putting your phone in another room for each block makes a real difference.',
  },
  {
    emoji: '🎯',
    title: 'Start with what you don’t know',
    body: 'It’s tempting to revise your favourite topics. Spending time on the hard ones first is where the biggest gains are.',
  },
];
