/** شبكة الوصول السريع للطالب */

export type HomeGridItem = {
  to: string;
  title: string;
  emoji: string;
};

export const STUDENT_HOME_GRID: HomeGridItem[] = [
  // صف 1 — دوراتي = المسجّل + الجدول (مركز واحد)
  { to: '/student/courses', title: 'دوراتي', emoji: '📚' },
  { to: '/student/homework', title: 'الواجبات', emoji: '📝' },
  { to: '/student/exams', title: 'الامتحانات', emoji: '📋' },
  { to: '/student/library', title: 'المكتبة', emoji: '📖' },
  { to: '/student/messages', title: 'الرسائل', emoji: '💬' },
  // صف 2
  { to: '/student/league', title: 'لوحة المتصدرين', emoji: '🏆' },
  { to: '/student/study-24', title: 'غرفة المذاكرة', emoji: '🧠' },
  { to: '/student/study-room', title: 'المعلم المناوب 24/7', emoji: '👨‍🏫' },
  { to: '/student/review-videos', title: 'تسجيل المحاضرات', emoji: '🎬' },
  { to: '/student/certificates', title: 'الشهادات', emoji: '🎓' },
  { to: '/student/challenges', title: 'التحديات', emoji: '🎯' },
  { to: '/student/points', title: 'الجوائز', emoji: '🎁' },
  // صف 3
  { to: '/student/report', title: 'التقارير', emoji: '📊' },
  { to: '/student/teacher-contact', title: 'حجز جلسة', emoji: '🗓️' },
  { to: '/student/peer-league', title: 'مجموعات الدراسة', emoji: '👥' },
  { to: '/student/notifications', title: 'الإشعارات', emoji: '🔔' },
  { to: '/student/emergency', title: 'الدعم الفني', emoji: '☎️' },
];
