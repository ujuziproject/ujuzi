import re
import glob

files = glob.glob('src/components/Step*.tsx')

for filepath in files:
    if 'Step0' in filepath or 'Step1' in filepath:
        continue
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        # Replace text-center mb-10 with mb-10 (and h1/h2 with the new style)
        if 'Step2' in filepath:
            title = "Choose Your Path"
            content = re.sub(r'<div className="text-center mb-10">.*?</div>', f'<div className="mb-10"><h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">{title}</h2></div>', content, flags=re.DOTALL)
        elif 'Step3' in filepath:
            title = "Academic Profile"
            content = re.sub(r'<div className="text-center mb-10">.*?</div>', f'<div className="mb-10"><h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">{title}</h2></div>', content, flags=re.DOTALL)
        elif 'Step4' in filepath:
            title = "Interests"
            content = re.sub(r'<div className="text-center mb-10">.*?</div>', f'<div className="mb-10"><h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">{title}</h2></div>', content, flags=re.DOTALL)
        elif 'Step5' in filepath:
            title = "Learning Style"
            content = re.sub(r'<div className="text-center mb-10">.*?</div>', f'<div className="mb-10"><h2 className="text-[1.75rem] font-black tracking-tighter text-ink mb-1 font-display uppercase">{title}</h2></div>', content, flags=re.DOTALL)

        # Remove max-w-md mx-auto from the top div
        content = content.replace('w-full max-w-md mx-auto', 'w-full')
        
        with open(filepath, 'w') as f:
            f.write(content)
            print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error modifying {filepath}: {e}")

