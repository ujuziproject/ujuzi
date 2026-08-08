import re

with open('src/components/CourseUpload.tsx', 'r') as f:
    content = f.read()

# Add useEffect import and state
import_target = "import React, { useState } from 'react';"
import_new = "import React, { useState, useEffect } from 'react';"
content = content.replace(import_target, import_new)

state_target = """  const [status, setStatus] = useState<'idle' | 'parsing'>('idle');
  const [progressMsg, setProgressMsg] = useState('');"""
state_new = """  const [status, setStatus] = useState<'idle' | 'parsing'>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [prefs, setPrefs] = useState<{contentFormat?: string, explanationComplexity?: string}>({});

  useEffect(() => {
    supabase.from('student_profiles').select('content_format_preference, explanation_complexity_preference, learning_style_set_at').eq('id', userId).maybeSingle().then(({data}) => {
       if (data && data.learning_style_set_at) {
          setPrefs({
             contentFormat: data.content_format_preference,
             explanationComplexity: data.explanation_complexity_preference
          });
       }
    });
  }, [userId]);"""
content = content.replace(state_target, state_new)

body_target = """        body: JSON.stringify({
          title: topic.title,
          description: topic.description,
          subject_name: topic.subject_name
        })"""
body_new = """        body: JSON.stringify({
          title: topic.title,
          description: topic.description,
          subject_name: topic.subject_name,
          content_format_preference: prefs.contentFormat,
          explanation_complexity_preference: prefs.explanationComplexity
        })"""
content = content.replace(body_target, body_new)

with open('src/components/CourseUpload.tsx', 'w') as f:
    f.write(content)

with open('src/components/CurriculumUpload.tsx', 'r') as f:
    content2 = f.read()

import_target2 = "import React, { useState } from 'react';"
import_new2 = "import React, { useState, useEffect } from 'react';"
content2 = content2.replace(import_target2, import_new2)

state_target2 = """  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'parsing'>('idle');
  const [progressMsg, setProgressMsg] = useState('');"""
state_new2 = """  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'parsing'>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [prefs, setPrefs] = useState<{contentFormat?: string, explanationComplexity?: string}>({});

  useEffect(() => {
    supabase.from('student_profiles').select('content_format_preference, explanation_complexity_preference, learning_style_set_at').eq('id', userId).maybeSingle().then(({data}) => {
       if (data && data.learning_style_set_at) {
          setPrefs({
             contentFormat: data.content_format_preference,
             explanationComplexity: data.explanation_complexity_preference
          });
       }
    });
  }, [userId]);"""
content2 = content2.replace(state_target2, state_new2)

body_target2 = """            body: JSON.stringify({
              title: topic.title,
              description: topic.description,
              subject_name: topic.subject_name
            })"""
body_new2 = """            body: JSON.stringify({
              title: topic.title,
              description: topic.description,
              subject_name: topic.subject_name,
              content_format_preference: prefs.contentFormat,
              explanation_complexity_preference: prefs.explanationComplexity
            })"""
content2 = content2.replace(body_target2, body_new2)

with open('src/components/CurriculumUpload.tsx', 'w') as f:
    f.write(content2)

