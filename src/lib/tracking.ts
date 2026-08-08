import { supabase } from './supabase';

// In-memory registry to handle beforeunload events
const activeSessions = new Set<string>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Attempt to end all active sessions when the window is closed
    // Note: beacon API would be better here, but fire-and-forget fetch to Supabase is a best effort
    activeSessions.forEach(sessionId => {
      // Fire and forget using navigator.sendBeacon if possible, or standard fetch
      const body = JSON.stringify({ ended_at: new Date().toISOString() });
      
      try {
        // Supabase REST endpoint for update
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
            fetch(`${supabaseUrl}/rest/v1/study_sessions?id=eq.${sessionId}`, {
                method: 'PATCH',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: body
            });
        }
      } catch (e) {
          // fallback ignores
      }
    });
  });
}

export async function recordStudySession(studentId: string, topicId: string, screenType: 'notes' | 'flashcards' | 'quiz'): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        student_id: studentId,
        topic_id: topicId,
        screen_type: screenType,
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (data) {
      activeSessions.add(data.id);
      return data.id;
    }
    return null;
  } catch (err) {
    console.error('Failed to record study session', err);
    return null;
  }
}

export async function endStudySession(sessionId: string): Promise<void> {
  activeSessions.delete(sessionId);
  try {
    // get current started_at to calculate duration
    const { data: session } = await supabase
      .from('study_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();
      
    if (session) {
      const startedAt = new Date(session.started_at).getTime();
      const endedAt = Date.now();
      let durationSeconds = Math.round((endedAt - startedAt) / 1000);
      
      // Cap at 30 minutes if it feels suspiciously long or no activity
      // Wait, 30 min is 1800 seconds.
      // If we cap it here, we ensure it's saved capped.
      if (durationSeconds > 1800) {
        durationSeconds = 1800;
      }
      
      await supabase
        .from('study_sessions')
        .update({
          ended_at: new Date(endedAt).toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', sessionId);
    }
  } catch (err) {
    console.error('Failed to end study session', err);
  }
}

export async function saveSessionReflection(sessionId: string, reflection: string): Promise<void> {
  try {
    await supabase.from('study_sessions').update({ reflection }).eq('id', sessionId);
  } catch (err) {
    console.error('Failed to save reflection', err);
  }
}
