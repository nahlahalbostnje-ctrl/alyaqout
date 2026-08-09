/** شبكة الرئيسية 3×7 — عناوين البرومبت مربوطة بمسارات موجودة */

export type HomeGridItem = {
  to: string;
  title: string;
  desc: string;
  emoji: string;
};

export const STUDENT_HOME_GRID: HomeGridItem[] = [
  // صف 1
  { to: '/student/courses', title: 'دوراتي', desc: 'محتواك الدراسي', emoji: '📚' },
  { to: '/student/live-classes', title: 'الحصص المباشرة', desc: 'جدول البث الحي', emoji: '🎥' },
  { to: '/student/homework', title: 'الواجبات', desc: 'تسليم ومتابعة', emoji: '📝' },
  { to: '/student/exams', title: 'الامتحانات', desc: 'اختباراتك القادمة', emoji: '📋' },
  { to: '/student/live-classes', title: 'الجدول الدراسي', desc: 'مواعيدك', emoji: '📅' },
  { to: '/student/library', title: 'المكتبة', desc: 'مصادر الياقوت', emoji: '📖' },
  { to: '/student/messages', title: 'الرسائل', desc: 'تواصل سريع', emoji: '💬' },
  // صف 2
  { to: '/student/league', title: 'ترتيبي', desc: 'ترتيبك الحالي', emoji: '🏆' },
  { to: '/student/challenges', title: 'التحديات', desc: 'مهمات تفاعلية', emoji: '🎯' },
  { to: '/student/points', title: 'الجوائز', desc: 'نقاط ومكافآت', emoji: '🎁' },
  { to: '/student/exams', title: 'بنك الامتحانات', desc: 'مراجعة وأسئلة', emoji: '🏦' },
  { to: '/student/study-room', title: 'المعلم الذكي', desc: 'مساعدة ذكية', emoji: '🤖' },
  { to: '/student/review-videos', title: 'التسجيلات', desc: 'مراجعة الحصص', emoji: '🎙️' },
  { to: '/student/report', title: 'التقارير', desc: 'مستوى التطور', emoji: '📊' },
  // صف 3
  { to: '/student/study-24', title: 'غرفة المذاكرة', desc: 'دراسة جماعية', emoji: '🧠' },
  { to: '/student/teacher-contact', title: 'حجز جلسة', desc: 'مع معلمك', emoji: '👨‍🏫' },
  { to: '/student/certificates', title: 'الشهادات', desc: 'إنجازاتك', emoji: '🎓' },
  { to: '/student/peer-league', title: 'مجموعات الدراسة', desc: 'زملاؤك', emoji: '👥' },
  { to: '/student/notifications', title: 'الإشعارات', desc: 'آخر التنبيهات', emoji: '🔔' },
  { to: '/student/report', title: 'الإعدادات', desc: 'حسابك وتطورك', emoji: '⚙️' },
  { to: '/student/emergency', title: 'الدعم الفني', desc: 'مساعدة فورية', emoji: '☎️' },
];
