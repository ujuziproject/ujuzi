import fs from 'fs';
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

d = d.replace(
  "let topicQuery = supabase.from('topics').select('id').order('order_index', { ascending: true });",
  "let topicQuery = supabase.from('topics').select('id, title').order('order_index', { ascending: true });"
);

fs.writeFileSync('src/components/Dashboard.tsx', d);
