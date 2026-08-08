import glob
import re

files = glob.glob('src/components/Step*.tsx')

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Common animate-in classes
        content = content.replace('animate-in fade-in slide-in-from-bottom-4 duration-500', '')
        content = content.replace('animate-in fade-in slide-in-from-bottom-2 duration-500', '')
        content = content.replace('animate-in fade-in duration-500', '')
        
        # In Step6 we might have added `animate-in fade-in slide-in-from-bottom-4 duration-500`
        
        # In Step4 we have `className="w-full animate-in fade-in duration-500"`
        
        # To be safe, just remove any `animate-in` and related classes
        content = re.sub(r'\banimate-in\b', '', content)
        content = re.sub(r'\bfade-in\b', '', content)
        content = re.sub(r'\bslide-in-from-bottom-[0-9]+\b', '', content)
        content = re.sub(r'\bduration-[0-9]+\b', '', content)

        # Fix multiple spaces left over
        content = re.sub(r' +', ' ', content)
        content = content.replace(' className=" "', '')
        content = content.replace(' className=""', '')

        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error {filepath}: {e}")

