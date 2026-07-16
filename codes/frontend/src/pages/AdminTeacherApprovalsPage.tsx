import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';
import { useCurrency } from '../hooks/useCurrency';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6', orange: '#F59E0B', purple: '#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});

interface PendingExam {
  id: number;
  title: string;
  duration_minutes: number;
  created_at: string;
  course: { id: number; title: string };
  teacher: { id: number; name: string };
}

interface PendingHomework {
  id: number;
  title: string;
  due_date: string | null;
  created_at: string;
  course: { id: number; title: string };
  teacher: { id: number; name: string };
}

interface PendingLiveClass {
  id: number;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  created_at: string;
  course: { id: number; title: string };
  teacher: { id: number; name: string };
}

interface PendingCourse {
  id: number;
  title: string;
  description?: string | null;
  price?: string | number;
  is_free?: boolean;
  created_at: string;
  subject?: { id: number; name: string } | null;
  grade?: { id: number; name: string } | null;
  teacher?: { id: number; name: string } | null;
}

type Tab = 'exams' | 'homeworks' | 'live_classes' | 'courses';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-EG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function TeacherAvatar({ name }: { name: string }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, background: 'rgba(197,147,65,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, color: DK.gold, flexShrink: 0,
    }}>
      {name[0]}
    </div>
  );
}

export default function AdminTeacherApprovalsPage() {
  const { formatMoney } = useCurrency();
  const [tab, setTab] = useState<Tab>('exams');
  const [exams, setExams] = useState<PendingExam[]>([]);
  const [homeworks, setHomeworks] = useState<PendingHomework[]>([]);
  const [liveClasses, setLiveClasses] = useState<PendingLiveClass[]>([]);
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [countryError, setCountryError] = useState<string | null>(null);

  const loadExams = async () => {
    const { data } = await api.get('/admin/approvals/exams');
    setExams(data.exams);
  };

  const loadHomeworks = async () => {
    const { data } = await api.get('/admin/approvals/homeworks');
    setHomeworks(data.homeworks);
  };

  const loadLiveClasses = async () => {
    const { data } = await api.get('/admin/approvals/live-classes');
    setLiveClasses(data.live_classes);
  };

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/admin/approvals/courses');
      setCourses(data.courses);
      setCountryError(null);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 422) {
        setCountryError(err.response.data?.message ?? 'حساب الأدمن غير مرتبط بدولة.');
      }
      setCourses([]);
    }
  };

  const load = async () => {
    setLoading(true);
    try { await Promise.all([loadExams(), loadHomeworks(), loadLiveClasses(), loadCourses()]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleExamDecision = async (exam: PendingExam, status: 'approved' | 'rejected') => {
    setBusyId(exam.id);
    try {
      await api.patch(`/admin/approvals/exams/${exam.id}`, { status });
      setExams((prev) => prev.filter((e) => e.id !== exam.id));
    } finally { setBusyId(null); }
  };

  const handleHomeworkDecision = async (hw: PendingHomework, status: 'approved' | 'rejected') => {
    setBusyId(hw.id);
    try {
      await api.patch(`/admin/approvals/homeworks/${hw.id}`, { status });
      setHomeworks((prev) => prev.filter((h) => h.id !== hw.id));
    } finally { setBusyId(null); }
  };

  const handleLiveClassDecision = async (cls: PendingLiveClass, status: 'approved' | 'rejected') => {
    setBusyId(cls.id);
    try {
      await api.patch(`/admin/approvals/live-classes/${cls.id}`, { status });
      setLiveClasses((prev) => prev.filter((c) => c.id !== cls.id));
    } finally { setBusyId(null); }
  };

  const handleCourseDecision = async (course: PendingCourse, status: 'approved' | 'rejected') => {
    setBusyId(course.id);
    try {
      await api.patch(`/admin/approvals/courses/${course.id}`, { status });
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } finally { setBusyId(null); }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'courses', label: 'الدورات', count: courses.length },
    { key: 'exams', label: 'الاختبارات', count: exams.length },
    { key: 'homeworks', label: 'الواجبات', count: homeworks.length },
    { key: 'live_classes', label: 'حصص مباشرة', count: liveClasses.length },
  ];

  return (
    <AdminLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 24, borderRadius: 4, background: DK.goldGrad }} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: DK.text, margin: 0 }}>اعتمادات المعلمين</h1>
          </div>
          <p style={{ color: DK.sub, fontSize: 13, marginRight: 14 }}>مراجعة وقبول أو رفض محتوى المعلمين قبل نشره للطلاب</p>
        </div>

        {countryError && (
          <div style={card({ marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' })}>
            <p style={{ color: DK.red, fontWeight: 700, fontSize: 13, margin: 0 }}>{countryError}</p>
          </div>
        )}

        {/* Pill Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  padding: '9px 22px', borderRadius: 40, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 700,
                  background: active ? DK.goldGrad : '#FFFFFF',
                  color: active ? '#fff' : DK.sub,
                  boxShadow: active ? '0 4px 14px rgba(197,147,65,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                  border: active ? 'none' : '1px solid #EDE3CE',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{
                    padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(197,147,65,0.12)',
                    color: active ? '#fff' : DK.gold,
                  }}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading — skeleton cards */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={card({ padding: 20 })}>
                <div style={{ height: 16, background: '#F0EBE0', borderRadius: 8, marginBottom: 12, animation: 'pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 12, background: '#F5F1EA', borderRadius: 6, width: '60%', marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 12, background: '#F5F1EA', borderRadius: 6, width: '40%', animation: 'pulse 1.4s ease-in-out infinite' }} />
              </div>
            ))}
          </div>
        )}

        {/* Exams Tab */}
        {!loading && tab === 'exams' && (
          exams.length === 0 ? (
            <div style={card({ padding: '48px 0', textAlign: 'center' })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: DK.text, margin: '0 0 6px' }}>لا توجد اختبارات بانتظار الاعتماد</p>
              <p style={{ color: DK.sub, fontSize: 13 }}>جميع الاختبارات تمت معالجتها</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              {exams.map((exam) => (
                <div key={exam.id} style={card({ padding: 18, display: 'flex', flexDirection: 'column', gap: 0 })}>
                  {/* Course badge */}
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(59,130,246,0.1)', color: DK.blue,
                    }}>
                      {exam.course.title}
                    </span>
                  </div>
                  {/* Title */}
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: '0 0 6px', lineHeight: 1.4 }}>
                    {exam.title}
                  </p>
                  {/* Duration */}
                  <p style={{ fontSize: 12, color: DK.sub, margin: '0 0 12px' }}>
                    ⏱ {exam.duration_minutes} دقيقة
                  </p>
                  {/* Teacher & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <TeacherAvatar name={exam.teacher.name} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: DK.text, margin: 0 }}>{exam.teacher.name}</p>
                      <p style={{ fontSize: 11, color: DK.dim, margin: 0 }}>{formatDate(exam.created_at)}</p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      onClick={() => handleExamDecision(exam, 'approved')}
                      disabled={busyId === exam.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(16,185,129,0.1)', color: DK.green, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === exam.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === exam.id ? '...' : '✓ قبول'}
                    </button>
                    <button
                      onClick={() => handleExamDecision(exam, 'rejected')}
                      disabled={busyId === exam.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.08)', color: DK.red, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === exam.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === exam.id ? '...' : '✕ رفض'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Homeworks Tab */}
        {!loading && tab === 'homeworks' && (
          homeworks.length === 0 ? (
            <div style={card({ padding: '48px 0', textAlign: 'center' })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: DK.text, margin: '0 0 6px' }}>لا توجد واجبات بانتظار الاعتماد</p>
              <p style={{ color: DK.sub, fontSize: 13 }}>جميع الواجبات تمت معالجتها</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              {homeworks.map((hw) => (
                <div key={hw.id} style={card({ padding: 18, display: 'flex', flexDirection: 'column', gap: 0 })}>
                  {/* Course badge */}
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(139,92,246,0.1)', color: DK.purple,
                    }}>
                      {hw.course.title}
                    </span>
                  </div>
                  {/* Title */}
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: '0 0 6px', lineHeight: 1.4 }}>
                    {hw.title}
                  </p>
                  {/* Due date */}
                  {hw.due_date && (
                    <p style={{ fontSize: 12, color: DK.orange, margin: '0 0 12px', fontWeight: 600 }}>
                      📅 تسليم: {formatDate(hw.due_date)}
                    </p>
                  )}
                  {/* Teacher & Created */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <TeacherAvatar name={hw.teacher.name} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: DK.text, margin: 0 }}>{hw.teacher.name}</p>
                      <p style={{ fontSize: 11, color: DK.dim, margin: 0 }}>{formatDate(hw.created_at)}</p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      onClick={() => handleHomeworkDecision(hw, 'approved')}
                      disabled={busyId === hw.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(16,185,129,0.1)', color: DK.green, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === hw.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === hw.id ? '...' : '✓ قبول'}
                    </button>
                    <button
                      onClick={() => handleHomeworkDecision(hw, 'rejected')}
                      disabled={busyId === hw.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.08)', color: DK.red, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === hw.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === hw.id ? '...' : '✕ رفض'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Live Classes Tab */}
        {!loading && tab === 'live_classes' && (
          liveClasses.length === 0 ? (
            <div style={card({ padding: '48px 0', textAlign: 'center' })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📹</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: DK.text, margin: '0 0 6px' }}>لا توجد حصص بانتظار الاعتماد</p>
              <p style={{ color: DK.sub, fontSize: 13 }}>جميع الحصص المباشرة تمت معالجتها</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              {liveClasses.map((cls) => (
                <div key={cls.id} style={card({ padding: 18, display: 'flex', flexDirection: 'column', gap: 0 })}>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(16,185,129,0.1)', color: DK.green,
                    }}>
                      {cls.course?.title ?? '—'}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: '0 0 6px', lineHeight: 1.4 }}>
                    {cls.title}
                  </p>
                  <p style={{ fontSize: 12, color: DK.sub, margin: '0 0 4px' }}>
                    🕐 {formatDateTime(cls.scheduled_at)}
                  </p>
                  <p style={{ fontSize: 12, color: DK.sub, margin: '0 0 12px' }}>
                    ⏱ {cls.duration_minutes} دقيقة
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <TeacherAvatar name={cls.teacher?.name ?? '?'} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: DK.text, margin: 0 }}>{cls.teacher?.name ?? '—'}</p>
                      <p style={{ fontSize: 11, color: DK.dim, margin: 0 }}>{formatDate(cls.created_at)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      onClick={() => handleLiveClassDecision(cls, 'approved')}
                      disabled={busyId === cls.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(16,185,129,0.1)', color: DK.green, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === cls.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === cls.id ? '...' : '✓ قبول'}
                    </button>
                    <button
                      onClick={() => handleLiveClassDecision(cls, 'rejected')}
                      disabled={busyId === cls.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.08)', color: DK.red, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === cls.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === cls.id ? '...' : '✕ رفض'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Courses Tab */}
        {!loading && tab === 'courses' && (
          courses.length === 0 ? (
            <div style={card({ padding: '48px 0', textAlign: 'center' })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: DK.text, margin: '0 0 6px' }}>لا توجد دورات بانتظار الاعتماد</p>
              <p style={{ color: DK.sub, fontSize: 13 }}>جميع طلبات الدورات تمت معالجتها</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              {courses.map((course) => (
                <div key={course.id} style={card({ padding: 18, display: 'flex', flexDirection: 'column', gap: 0 })}>
                  <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(59,130,246,0.1)', color: DK.blue,
                    }}>
                      {course.subject?.name ?? '—'}
                    </span>
                    {course.grade?.name && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(139,92,246,0.1)', color: DK.purple,
                      }}>
                        {course.grade.name}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: '0 0 6px', lineHeight: 1.4 }}>
                    {course.title}
                  </p>
                  {course.description && (
                    <p style={{
                      fontSize: 12, color: DK.sub, margin: '0 0 8px', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {course.description}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: DK.sub, margin: '0 0 12px' }}>
                    {course.is_free ? 'مجانية' : formatMoney(course.price || 0)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <TeacherAvatar name={course.teacher?.name ?? '?'} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: DK.text, margin: 0 }}>{course.teacher?.name ?? '—'}</p>
                      <p style={{ fontSize: 11, color: DK.dim, margin: 0 }}>{formatDate(course.created_at)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      onClick={() => handleCourseDecision(course, 'approved')}
                      disabled={busyId === course.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(16,185,129,0.1)', color: DK.green, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === course.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === course.id ? '...' : '✓ قبول'}
                    </button>
                    <button
                      onClick={() => handleCourseDecision(course, 'rejected')}
                      disabled={busyId === course.id}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.08)', color: DK.red, fontSize: 13, fontWeight: 700,
                        fontFamily: "'Cairo',sans-serif", opacity: busyId === course.id ? 0.5 : 1, transition: 'all 0.15s',
                      }}>
                      {busyId === course.id ? '...' : '✕ رفض'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </AdminLayout>
  );
}
