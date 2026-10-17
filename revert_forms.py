import re
import glob

files = glob.glob('src/components/*.tsx')

new_input_class = 'className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-ink placeholder:text-slate-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"'
new_select_class = 'className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-ink focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all appearance-none bg-no-repeat bg-[url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\')] bg-[length:12px_auto] bg-[position:right_16px_center]"'
new_btn_class = 'className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px]"'
new_btn_class_auto = 'className="min-w-[200px] bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-[0.98] text-[15px]"'
new_label_class = 'className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"'

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Target old bulky input class
        content = re.sub(r'className="block w-full px-5 py-\[18px\] bg-\[#fdfdfd\] border-2 border-slate-100/80 rounded-2xl text-\[15px\] font-medium text-ink placeholder:text-slate-400 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-\[0_2px_10px_rgba\(0,0,0,0\.02\)\] hover:border-slate-200"', new_input_class, content)
        
        # Target old bulky select class
        content = re.sub(r'className="block w-full px-5 py-\[18px\] bg-\[#fdfdfd\] border-2 border-slate-100/80 rounded-2xl text-\[15px\] font-medium text-ink focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-\[0_2px_10px_rgba\(0,0,0,0\.02\)\] hover:border-slate-200[^"]*"', new_select_class, content)

        # Target old button classes
        content = re.sub(r'className="w-full mt-8 bg-accent hover:bg-accent/90 text-white font-bold py-\[18px\] px-8 rounded-2xl transition-all hover:-translate-y-1 shadow-\[0_8px_20px_rgba\(239,68,68,0\.25\)\] active:translate-y-0 text-\[15px\] tracking-wide"', new_btn_class, content)
        content = re.sub(r'className="min-w-\[220px\] mt-8 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white font-bold py-\[18px\] px-8 rounded-2xl transition-all hover:-translate-y-1 shadow-\[0_8px_20px_rgba\(239,68,68,0\.25\)\] active:translate-y-0 text-\[15px\] tracking-wide"', new_btn_class_auto, content)
        
        # Labels
        content = re.sub(r'className="block text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mb-3"', new_label_class, content)

        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error {filepath}: {e}")

