import { useState } from 'react';
import ParentLayout from '../components/ParentLayout';

const C = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', goldBdr: 'rgba(197,147,65,0.22)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  purple: '#8B5CF6', purpleBg: 'rgba(139,92,246,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
};

const CATEGORIES = ['الكل', 'التربية الإيجابية', 'مهارات التواصل', 'الصحة النفسية', 'التعليم الرقمي', 'إدارة الوقت', 'الذكاء الاصطناعي', 'إرشاد تربوي'];

const GRADES = ['الكل', 'المرحلة الابتدائية', 'المرحلة الإعدادية', 'المرحلة الثانوية'];

type Course = {
  id: number;
  title: string;
  cat: string;
  grade: string;
  emoji: string;
  duration: string;
  lessons: number;
  progress: number;
  rating: number;
  students: number;
  level: string;
  color: string;
  bg: string;
};

const COURSES: Course[] = [
  { id: 1, title: 'فن الحوار مع الأبناء المراهقين',      cat: 'مهارات التواصل',   grade: 'المرحلة الثانوية',  emoji: '💬', duration: '3 ساعات',   lessons: 8,  progress: 60,  rating: 4.9, students: 1240, level: 'متوسط', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
  { id: 2, title: 'التربية الإيجابية الحديثة',            cat: 'التربية الإيجابية', grade: 'المرحلة الابتدائية', emoji: '👨‍👩‍👦', duration: '4 ساعات',   lessons: 12, progress: 45,  rating: 4.8, students: 2100, level: 'مبتدئ', color: '#C59341', bg: 'rgba(197,147,65,0.06)' },
  { id: 3, title: 'حماية أطفالك في الفضاء الرقمي',        cat: 'التعليم الرقمي',    grade: 'المرحلة الإعدادية', emoji: '🛡️', duration: '2 ساعات',   lessons: 6,  progress: 80,  rating: 4.7, students: 890,  level: 'مبتدئ', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  { id: 4, title: 'التعامل مع ضغوط الاختبارات',           cat: 'الصحة النفسية',     grade: 'المرحلة الثانوية',  emoji: '🧠', duration: '2.5 ساعة', lessons: 7,  progress: 0,   rating: 4.6, students: 650,  level: 'متوسط', color: '#10B981', bg: 'rgba(16,185,129,0.06)' },
  { id: 5, title: 'إدارة وقت المذاكرة في المنزل',         cat: 'إدارة الوقت',        grade: 'المرحلة الابتدائية', emoji: '⏰', duration: '1.5 ساعة', lessons: 5,  progress: 100, rating: 4.9, students: 1800, level: 'مبتدئ', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
  { id: 6, title: 'بناء ثقة الطفل بنفسه',                 cat: 'التربية الإيجابية', grade: 'المرحلة الابتدائية', emoji: '⭐', duration: '3 ساعات',   lessons: 10, progress: 20,  rating: 4.8, students: 970,  level: 'متقدم', color: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
  { id: 7, title: 'الذكاء الاصطناعي في التعليم المنزلي',  cat: 'الذكاء الاصطناعي', grade: 'المرحلة الإعدادية', emoji: '🤖', duration: '2 ساعات',   lessons: 6,  progress: 0,   rating: 4.7, students: 540,  level: 'متوسط', color: '#06B6D4', bg: 'rgba(6,182,212,0.06)' },
  { id: 8, title: 'إرشاد تربوي — كيف تدعم ابنك عاطفياً', cat: 'إرشاد تربوي',       grade: 'المرحلة الثانوية',  emoji: '🤝', duration: '3.5 ساعة', lessons: 9,  progress: 0,   rating: 4.9, students: 1120, level: 'متوسط', color: '#EC4899', bg: 'rgba(236,72,153,0.06)' },
  { id: 9, title: 'محادثة بالإنجليزية مع أطفالك',         cat: 'مهارات التواصل',   grade: 'المرحلة الابتدائية', emoji: '🗣️', duration: '4 ساعات',   lessons: 14, progress: 0,   rating: 4.6, students: 780,  level: 'مبتدئ', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
];

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  'مبتدئ': { color: C.green, bg: C.greenBg },
  'متوسط': { color: C.amber, bg: C.amberBg },
  'متقدم': { color: C.red, bg: C.redBg },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <span style={{ color: C.amber, fontSize: 11 }}>★</span>
      <span style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{rating}</span>
    </span>
  );
}

function CourseCard({ course, compact }: { course: Course; compact?: boolean }) {
  const lvl = LEVEL_COLORS[course.level] ?? LEVEL_COLORS['مبتدئ'];
  const isComplete = course.progress === 100;
  const inProgress = course.progress > 0 && course.progress < 100;

  if (compact) {
    return (
      <div style={{
        background: C.card, borderRadius: 14, padding: 16,
        boxShadow: C.shadow, border: `1px solid ${C.border}`,
        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: course.bg, border: `1.5px solid ${course.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>{course.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 12, margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.title}</p>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: C.sub, fontSize: 11 }}>التقدم</span>
            <span style={{ color: course.color, fontSize: 11, fontWeight: 800 }}>{course.progress}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: `${course.color}15`, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${course.progress}%`, borderRadius: 3, background: course.color, transition: 'width 0.5s ease' }} />
          </div>
        </div>
        <button onClick={()=>alert(`تشغيل درس "${course.title}" قيد التطوير — سيتوفر مشغّل محتوى الأكاديمية قريباً.`)} style={{
          background: course.color, color: '#fff', border: 'none',
          borderRadius: 8, padding: '7px 0', fontFamily: "'Cairo',sans-serif",
          fontWeight: 700, fontSize: 12, cursor: 'pointer', width: '100%',
        }}>متابعة التعلم</button>
      </div>
    );
  }

  return (
    <div style={{
      background: C.card, borderRadius: 16, overflow: 'hidden',
      boxShadow: C.shadow, border: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={ev => {
        (ev.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (ev.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={ev => {
        (ev.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (ev.currentTarget as HTMLDivElement).style.boxShadow = C.shadow;
      }}
    >
      {/* Top bar */}
      <div style={{ height: 5, background: course.color }} />

      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Emoji + badges row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: course.bg, border: `1.5px solid ${course.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>{course.emoji}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <span style={{ background: `${course.color}15`, color: course.color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}>
              {course.cat}
            </span>
            <span style={{ background: lvl.bg, color: lvl.color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}>
              {course.level}
            </span>
            <span style={{ background: 'rgba(13,30,58,0.06)', color: C.navy, fontSize: 10, fontWeight: 600, borderRadius: 6, padding: '2px 8px' }}>
              🏫 {course.grade}
            </span>
          </div>
        </div>

        {/* Title */}
        <p style={{ color: C.text, fontWeight: 800, fontSize: 14, margin: '0 0 10px', lineHeight: 1.5 }}>{course.title}</p>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 10, padding: '8px 0',
          borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          marginBottom: 12,
        }}>
          {[
            { label: course.duration, icon: '⏱' },
            { label: `${course.lessons} درس`, icon: '📖' },
            { label: course.students.toLocaleString('ar-SA'), icon: '👥' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 11 }}>{s.icon}</span>
              <span style={{ color: C.sub, fontSize: 11 }}>{s.label}</span>
            </div>
          ))}
          <div style={{ marginRight: 'auto' }}>
            <StarRating rating={course.rating} />
          </div>
        </div>

        {/* Progress / CTA */}
        <div style={{ marginTop: 'auto' }}>
          {isComplete ? (
            <div style={{
              background: C.greenBg, border: `1px solid ${C.green}25`,
              borderRadius: 8, padding: '7px 12px', textAlign: 'center',
              color: C.green, fontWeight: 800, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span>✓</span> مكتمل
            </div>
          ) : inProgress ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: C.sub, fontSize: 11 }}>التقدم</span>
                <span style={{ color: course.color, fontSize: 11, fontWeight: 800 }}>{course.progress}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: `${course.color}18`, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${course.progress}%`, borderRadius: 3, background: course.color }} />
              </div>
              <button onClick={()=>alert(`تشغيل درس "${course.title}" قيد التطوير — سيتوفر مشغّل محتوى الأكاديمية قريباً.`)} style={{
                background: course.color, color: '#fff', border: 'none', width: '100%',
                borderRadius: 8, padding: '8px 0', fontFamily: "'Cairo',sans-serif",
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>متابعة التعلم</button>
            </>
          ) : (
            <button onClick={()=>alert(`بدء دورة "${course.title}" قيد التطوير — سيتوفر مشغّل محتوى الأكاديمية قريباً.`)} style={{
              background: 'transparent', color: course.color,
              border: `1.5px solid ${course.color}`, width: '100%',
              borderRadius: 8, padding: '8px 0', fontFamily: "'Cairo',sans-serif",
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={ev => {
                (ev.currentTarget as HTMLButtonElement).style.background = course.color;
                (ev.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={ev => {
                (ev.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (ev.currentTarget as HTMLButtonElement).style.color = course.color;
              }}
            >البدء الآن</button>
          )}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(135deg,#C59341,#D4A65A)' }} />
        <h1 style={{ color: '#1B2038', fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      </div>
      <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>{sub}</p>
    </div>
  );
}

export default function ParentAcademyPage() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [activeGrade, setActiveGrade]       = useState('الكل');

  const completedCount   = COURSES.filter(c => c.progress === 100).length;
  const inProgressCourses = COURSES.filter(c => c.progress > 0 && c.progress < 100);
  const filteredCourses  = COURSES.filter(c =>
    (activeCategory === 'الكل' || c.cat   === activeCategory) &&
    (activeGrade    === 'الكل' || c.grade === activeGrade)
  );

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <PageHeader title="أكاديمية ولي الأمر" sub="طوّر مهاراتك في التربية والتواصل مع أبنائك" />
          <div style={{
            background: C.greenBg, border: `1px solid ${C.green}30`,
            borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: C.green, fontWeight: 900, fontSize: 22 }}>{completedCount}</span>
            <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>دورات مكتملة</span>
          </div>
        </div>

        {/* Grade Filter */}
        <div style={{ display:'flex', gap:8, marginBottom:10, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
          {GRADES.map(g => (
            <button key={g} onClick={() => setActiveGrade(g)} style={{
              flexShrink:0, padding:'6px 14px', borderRadius:20,
              border: activeGrade===g ? 'none' : `1.5px solid ${C.border}`,
              background: activeGrade===g ? C.navy : C.card,
              color: activeGrade===g ? '#fff' : C.sub,
              fontFamily:"'Cairo',sans-serif", fontSize:11.5, fontWeight:700,
              cursor:'pointer', transition:'all 0.15s',
            }}>{g}</button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 22, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 20,
              border: activeCategory === cat ? 'none' : `1.5px solid ${C.goldBdr}`,
              background: activeCategory === cat ? C.goldGrad : C.card,
              color: activeCategory === cat ? '#fff' : C.gold,
              fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700,
              cursor: 'pointer', boxShadow: activeCategory === cat ? '0 2px 10px rgba(197,147,65,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>{cat}</button>
          ))}
        </div>

        {/* In Progress Section */}
        {inProgressCourses.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: C.goldGrad }} />
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>دوراتي الحالية</h2>
              <span style={{
                background: C.goldBg, color: C.gold, fontSize: 11, fontWeight: 800,
                borderRadius: 20, padding: '2px 10px',
              }}>{inProgressCourses.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {inProgressCourses.map(c => (
                <CourseCard key={c.id} course={c} compact />
              ))}
            </div>
          </div>
        )}

        {/* ── Extracurricular / اللامنهجية ── */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: C.goldGrad }} />
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>الأنشطة اللامنهجية لأبنائك</h2>
            <span style={{ background: C.blueBg, color: C.blue, fontSize: 11, fontWeight: 800, borderRadius: 20, padding: '2px 10px' }}>جديد</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
            {[
              { emoji: '🎨', title: 'الفن الإبداعي', sub: 'رسم، تلوين، خزف', color: '#EC4899', students: 420 },
              { emoji: '🎵', title: 'الموسيقى وفنون الأداء', sub: 'إيقاع، غناء، مسرح', color: '#8B5CF6', students: 310 },
              { emoji: '⚽', title: 'الرياضة والنشاط', sub: 'كرة، سباحة، جمناستك', color: '#10B981', students: 680 },
              { emoji: '🤖', title: 'التكنولوجيا والبرمجة', sub: 'روبوتيكس، كودنج', color: '#3B82F6', students: 250 },
            ].map((act, i) => (
              <div key={i} style={{
                background: C.card, borderRadius: 16, padding: '18px 16px', border: `1px solid ${C.border}`,
                boxShadow: C.shadow, textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${act.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 10px' }}>{act.emoji}</div>
                <p style={{ color: C.text, fontWeight: 800, fontSize: 14, margin: '0 0 4px' }}>{act.title}</p>
                <p style={{ color: C.sub, fontSize: 11, margin: '0 0 12px' }}>{act.sub}</p>
                <p style={{ color: C.dim, fontSize: 11, marginBottom: 12 }}>👥 {act.students.toLocaleString('ar-EG')} طالب مسجّل</p>
                <button onClick={()=>alert(`التسجيل في نشاط "${act.title}" قيد التطوير.`)} style={{ background: `${act.color}15`, color: act.color, border: `1px solid ${act.color}30`, borderRadius: 8, padding: '7px 0', width: '100%', fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  سجّل ابنك الآن
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* All Courses Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 4, height: 18, borderRadius: 2, background: C.goldGrad }} />
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>
              {activeCategory === 'الكل' ? 'جميع الدورات' : activeCategory}
            </h2>
            <span style={{
              background: C.goldBg, color: C.gold, fontSize: 11, fontWeight: 800,
              borderRadius: 20, padding: '2px 10px',
            }}>{filteredCourses.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {filteredCourses.map(c => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.dim, fontSize: 14 }}>
              لا توجد دورات في هذا التصنيف حالياً
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
}
