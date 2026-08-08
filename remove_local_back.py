import os
import re

files = [
    'src/components/Step1SignUp.tsx',
    'src/components/Step2Track.tsx', 
    'src/components/Step3ProfileForm.tsx', 
    'src/components/Step4Interests.tsx', 
    'src/components/Step5LearningStyle.tsx'
]

for file in files:
    try:
        with open(file, 'r') as f:
            content = f.read()
        
        # Remove the back button button element exactly as we generated it. 
        # Usually it's something like <button ... onClick={onBack} ...> ... </button>
        # Let's match `<button onClick={onBack}` and anything up to `</button>`
        content = re.sub(r'<button[^>]*onClick=\{onBack\}[^>]*>.*?</button>', '', content, flags=re.DOTALL)
        
        with open(file, 'w') as f:
            f.write(content)
    except Exception as e:
        print(f"Error processing {file}: {e}")
