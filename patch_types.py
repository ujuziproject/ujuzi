import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """export interface StudentProfile {
  id: string;
  track: Track;
  exam_type?: ExamType;
  exam_year?: number;
  institution_name?: string;
  course_of_study?: string;
  level_year?: number;
}"""

replacement = """export interface StudentProfile {
  id: string;
  track: Track;
  exam_type?: ExamType;
  exam_year?: number;
  university_id?: string;
  institution_name?: string;
  faculty?: string;
  course_of_study?: string;
  level_year?: number;
}"""

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
