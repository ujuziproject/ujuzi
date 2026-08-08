import re

with open('src/components/Step5LearningStyle.tsx', 'r') as f:
    content = f.read()

target = """    <div className="animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-3 font-display">How do you learn best?</h2>
        <p className="text-slate-500">Answer a few questions to personalize your experience.</p>
      </div>"""
replacement = """    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink mb-3 font-display uppercase">How do you learn best?</h2>
        <p className="text-slate-500 font-medium">Answer a few questions to personalize your experience.</p>
      </div>"""
content = content.replace(target, replacement)

button_target = """        <button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentQuestionIndex === questions.length - 1 ? 'Complete Profile' : 'Next Question')}
        </button>"""
button_replacement = """        <button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50 uppercase tracking-widest mt-10"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentQuestionIndex === questions.length - 1 ? 'Complete Profile →' : 'Continue →')}
        </button>"""
content = content.replace(button_target, button_replacement)

with open('src/components/Step5LearningStyle.tsx', 'w') as f:
    f.write(content)
