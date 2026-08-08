import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

bad_pattern = """        </div>
        
        {/* Recent Activity List */}"""

# We need to swap them. Let's find exactly the Allocation Card HTML.
