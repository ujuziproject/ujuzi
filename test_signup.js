import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const email = `testuser_${Date.now()}@example.com`;
  console.log(`Signing up with ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
  });
  
  if (error) {
    console.error('Signup error:', error.message);
    return;
  }
  
  console.log('Signup success:', data.user.id);
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: data.user.id, full_name: 'Test User', role: 'student' });
    
  if (profileError) {
    console.error('Profile creation error:', profileError.message);
  } else {
    console.log('Profile created');
  }
}

testSignup();
