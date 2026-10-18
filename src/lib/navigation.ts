// Shared helpers for jumping to a course or topic from anywhere in the app
// (search, notifications, planner, overview). Course and topic pages live inside
// the Overview screen, so we always switch to it as well.

export interface NavStore {
  setCurrentView: (v: any) => void;
  setDashboardView: (v: any) => void;
  setDashboardCourseId: (id: string | null) => void;
  setDashboardCurriculumId: (id: string | null) => void;
  setDashboardTopicId: (id: string | undefined) => void;
}

export function openCourse(nav: NavStore, target: { courseId?: string | null; curriculumId?: string | null }) {
  nav.setDashboardCourseId(target.courseId || null);
  nav.setDashboardCurriculumId(target.courseId ? null : target.curriculumId || null);
  nav.setDashboardTopicId(undefined);
  nav.setDashboardView('courseDetail');
  nav.setCurrentView('dashboard');
}

export function openTopic(nav: NavStore, topic: { id: string; course_id?: string | null; curriculum_id?: string | null }) {
  nav.setDashboardCourseId(topic.course_id || null);
  nav.setDashboardCurriculumId(topic.course_id ? null : topic.curriculum_id || null);
  nav.setDashboardTopicId(topic.id);
  nav.setDashboardView('curriculum');
  nav.setCurrentView('dashboard');
}
