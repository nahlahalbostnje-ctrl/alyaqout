/** شبكة الوصول السريع — صفّان × 7 · أيقونة + عنوان فقط */

export type HomeGridItem = {
  to: string;
  title: string;
  emoji: string;
};

export const STUDENT_HOME_GRID: HomeGridItem[] = [
  // صف 1
  { to: '/student/courses', title: 'دوراتي', emoji: '📚' },
  { to: '/student/homework', title: 'الواجبات', emoji: '📝' },
  { to: '/student/exams', title: 'الامتحانات', emoji: '📋' },
  { to: '/student/live-classes', title: 'الجدول', emoji: '📅' },
  { to: '/student/library', title: 'المكتبة', emoji: '📖' },
  { to: '/student/messages', title: 'الرسائل', emoji: '💬' },
  { to: '/student/live-classes', title: 'الحصص المباشرة', emoji: '🎥' },
  // صف 2
  { to: '/student/league', title: 'لوحة المتصدرين', emoji: '🏆' },
  { to: '/student/exams', title: 'بنك الامتحانات', emoji: '🏦' },
  { to: '/student/study-24', title: 'غرفة المذاكرة', emoji: '🧠' },
  { to: '/student/study-room', title: 'المعلم الذكي', emoji: '🤖' },
  { to: '/student/review-videos', title: 'التسجيلات', emoji: '🎙️' },
  { to: '/student/certificates', title: 'الشهادات', emoji: '🎓' },
  { to: '/student/report', title: 'الإعدادات', emoji: '⚙️' },
];
