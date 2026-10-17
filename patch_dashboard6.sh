#!/bin/bash
python3 -c '
with open("src/components/Dashboard.tsx", "r") as f:
    lines = f.readlines()
# let us just write until the first "        )}\n      </div>\n    </div>\n  );\n}" we can form
# Actually, lets find where "    </div>" is and fix it
text = "".join(lines)
idx = text.rfind("        )}\n      </div>")
if idx != -1:
    idx2 = text.rfind("        )}\n      </div>", 0, idx)
    if idx2 != -1:
        text = text[:idx2] + "        )}\n      </div>\n    </div>\n  );\n}\n"
with open("src/components/Dashboard.tsx", "w") as f:
    f.write(text)
'
