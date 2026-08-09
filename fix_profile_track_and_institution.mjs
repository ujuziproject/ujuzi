import fs from 'fs';
let p = fs.readFileSync('src/components/Profile.tsx', 'utf-8');

p = p.replace(
  ">              Post-Development            </button>",
  ">              Independent            </button>"
);

// Look at institution fetching
if (!p.includes("institution_name: profile.institution_name || '',")) {
  p = p.replace(
    "year_level: profile.year_level || '',",
    "year_level: profile.year_level || '', institution_name: profile.institution_name || '',"
  );
}

fs.writeFileSync('src/components/Profile.tsx', p);
