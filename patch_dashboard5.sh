#!/bin/bash
python3 -c '
with open("src/components/Dashboard.tsx", "r") as f:
    text = f.read()

bad_suffix = "        )}\n      </div>\n        )}\n      </div>\n    </div>\n  );\n}"
good_suffix = "        )}\n      </div>\n    </div>\n  );\n}"

text = text.replace(bad_suffix, good_suffix)

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(text)
'
