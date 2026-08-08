#!/bin/bash
sed -i -e "s/import { MyCurricula } from '.\/MyCurricula';/import { MyCurricula } from '.\/MyCurricula';\nimport { MySemesters } from '.\/MySemesters';/" src/components/MainApp.tsx
sed -i -e "s/{currentView === 'curricula' && <MyCurricula userId={userId} \/>}/{currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} \/>}\n          {currentView === 'curricula' && track !== 'university' && <MyCurricula userId={userId} \/>}/" src/components/MainApp.tsx
