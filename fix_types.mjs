import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');

const newTypes = `
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  criteria_type: string;
  threshold: number;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}
`;

content = content + newTypes;
fs.writeFileSync('src/types.ts', content);
