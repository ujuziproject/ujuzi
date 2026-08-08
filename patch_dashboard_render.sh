#!/bin/bash
sed -i -e '/{curricula.length > 0 ? (/,/<\/div>/!b' -e '/{curricula.length > 0 ? (/i \
        {track === '"'"'university'"'"' ? (\
          <SemesterList \
            userId={userId} \
            onOpenSemester={(id) => {\
              setSelectedSemesterId(id);\
              setView('"'"'semesterDetail'"'"');\
            }} \
          />\
        ) : (\
' src/components/Dashboard.tsx
