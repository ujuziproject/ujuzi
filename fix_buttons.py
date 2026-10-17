import re
import glob

files = glob.glob('src/components/Step*.tsx')

for filepath in files:
    if 'Step0' in filepath or 'Step1' in filepath:
        continue
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        content = re.sub(r'<div className="mt-8 flex justify-center.*?<button[^>]*onClick=\{onNext\}[^>]*>.*?</button>.*?</div>', 
                         r'<div className="mt-12 flex justify-start"><button onClick={onNext} className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all">Next Step</button></div>', 
                         content, flags=re.DOTALL)
        
        content = re.sub(r'<div className="mt-8">.*?<button[^>]*onClick=\{onNext\}[^>]*>.*?</button>.*?</div>', 
                         r'<div className="mt-12 flex justify-start"><button onClick={onNext} className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all">Next Step</button></div>', 
                         content, flags=re.DOTALL)
                         
        content = re.sub(r'<div className="mt-8 flex justify-end">.*?<button[^>]*onClick=\{onNext\}[^>]*>.*?</button>.*?</div>', 
                         r'<div className="mt-12 flex justify-start"><button onClick={onNext} className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all">Next Step</button></div>', 
                         content, flags=re.DOTALL)
                         
        content = re.sub(r'<div className="mt-8 flex justify-end">.*?<button[^>]*onClick=\{handleComplete\}[^>]*>.*?</button>.*?</div>', 
                         r'<div className="mt-12 flex justify-start"><button onClick={handleComplete} disabled={!style} className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all">{isSubmitting ? "Building Plan..." : "Complete Setup"}</button></div>', 
                         content, flags=re.DOTALL)
        
        with open(filepath, 'w') as f:
            f.write(content)
            print(f"Fixed buttons {filepath}")
    except Exception as e:
        print(f"Error modifying {filepath}: {e}")

