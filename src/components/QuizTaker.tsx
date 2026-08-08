import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QuizQuestion } from '../types';
import { recordActivity } from '../lib/activity';
import { cn } from '../lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizTakerProps {
  userId: string;
  quizId: string;
  questions: QuizQuestion[];
}

export function QuizTaker({ userId, quizId, questions }: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBestScore() {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('student_id', userId)
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setBestScore(data.score);
      }
    }
    fetchBestScore();
  }, [quizId, userId]);

  const handleSubmit = async () => {
    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);

    try {
      await supabase.from('quiz_attempts').insert({
        student_id: userId,
        quiz_id: quizId,
        score: calculatedScore,
        total_questions: questions.length
      });

      await recordActivity(userId, 'quiz_completed', { quizId, score: calculatedScore });
    } catch (err) {
      console.error('Failed to record quiz attempt:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {submitted && (
        <div className="bg-surface-alt/50 border border-accent/20 rounded-2xl p-6 text-center">
          <h3 className="text-2xl font-bold text-ink mb-2">Quiz Completed!</h3>
          <p className="text-lg text-accent font-medium">You scored <span className="font-mono">{score}</span> out of <span className="font-mono">{questions.length}</span></p>
          {bestScore !== null && (
            <p className="text-sm text-accent mt-2">Previous best: <span className="font-mono">{bestScore}</span> / <span className="font-mono">{questions.length}</span></p>
          )}
        </div>
      )}

      {questions.map((q, i) => {
        const selected = answers[q.id];
        return (
          <div key={q.id} className="p-6 bg-surface rounded-2xl border border-border">
            <h4 className="font-bold text-ink mb-4">{i + 1}. {q.question_text}</h4>
            <div className="space-y-3">
              {q.options.map((opt, optIdx) => {
                const isSelected = selected === opt;
                const isCorrect = opt === q.correct_answer;
                const showCorrect = submitted && isCorrect;
                const showIncorrect = submitted && isSelected && !isCorrect;
                
                return (
                  <button
                    key={optIdx}
                    onClick={() => { if (!submitted) setAnswers(prev => ({ ...prev, [q.id]: opt })) }}
                    disabled={submitted}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border font-medium text-sm transition-all flex items-center justify-between",
                      !submitted && !isSelected ? "bg-surface-alt border-border hover:border-accent/50 hover:bg-surface" : "",
                      !submitted && isSelected ? "bg-surface-alt/50 border-accent text-accent" : "",
                      showCorrect ? "bg-green-50 border-green-500 text-green-900" : "",
                      showIncorrect ? "bg-red-50 border-red-500 text-red-900" : "",
                      submitted && !isCorrect && !isSelected ? "bg-surface-alt border-border opacity-50" : ""
                    )}
                  >
                    <span>{opt}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </button>
                )
              })}
            </div>
            
            {submitted && q.explanation && (
              <div className="mt-4 p-4 bg-surface-alt border border-border rounded-xl">
                <p className="text-sm text-ink/80"><span className="font-bold">Explanation:</span> {q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full shadow-sm transition-all"
          >
            Submit Answers
          </button>
        </div>
      )}
    </div>
  );
}
