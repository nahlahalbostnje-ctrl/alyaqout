import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
};

interface PendingExam {
  id:               number;
  title:            string;
  duration_minutes: number;
  created_at:       string;
  course:           { id: number; title: string };
  teacher:          { id: number; name: string };
}

interface PendingHomework {
  id:         number;
  title:      string;
  due_date:   string | null;
  created_at: string;
  course:     { id: number; title: string };
  teacher:    { id: number; name: string };
}

type Tab = 'exams' | 'homeworks';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ApprovalBadge({ onApprove, onReject, busy }: {
  onApprove: () => void;
  onReject:  () => void;
  busy:      boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onApprove} disabled={busy}
        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
        style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
        {busy ? '...' : 'قبول'}
      </button>
      <button onClick={onReject} disabled={busy}
        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
        {busy ? '...' : 'رفض'}
      </button>
    </div>
  );
}

export default function AdminTeacherApprovalsPage() {
  const [tab, setTab]             = useState<Tab>('exams');
  const [exams, setExams]         = useState<PendingExam[]>([]);
  const [homeworks, setHomeworks] = useState<PendingHomework[]>([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState<number | null>(null);

  const loadExams = async () => {
    const { data } = await api.get('/admin/approvals/exams');
    setExams(data.exams);
  };

  const loadHomeworks = async () => {
    const { data } = await api.get('/admin/approvals/homeworks');
    setHomeworks(data.homeworks);
  };

  const load = async () => {
    setLoading(true);
    try { await Promise.all([loadExams(), loadHomeworks()]); }
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'exams',     label: 'الامتحانات', count: exams.length    },
    { key: 'homeworks', label: 'الواجبات',   count: homeworks.length },
  ];

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>موافقات المعلمين</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>مراجعة وقبول أو رفض محتوى المعلمين قبل نشره للطلاب</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2"
              style={tab === t.key
                ? { background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }
                : { background: '#FFFFFF', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
              {t.label}
              {t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={tab === t.key
                    ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                    : { background: 'rgba(201,149,42,0.08)', color: DK.gold }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        )}

        {/* Exams Tab */}
        {!loading && tab === 'exams' && (
          exams.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={DK.card}>
              <p className="font-semibold" style={{ color: '#1B2038' }}>لا توجد امتحانات بانتظار الموافقة</p>
            </div>
          ) : (
            <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                  <tr>
                    {['الامتحان', 'المعلم', 'الكورس', 'المدة', 'التاريخ', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                        style={{ color: DK.gold }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id} className="transition"
                      style={{ borderBottom: '1px solid #EDE3CE' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#1B2038' }}>{exam.title}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{exam.teacher.name}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{exam.course.title}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{exam.duration_minutes} دقيقة</td>
                      <td className="px-4 py-3 text-xs" style={{ color: DK.dimTxt }}>{formatDate(exam.created_at)}</td>
                      <td className="px-4 py-3">
                        <ApprovalBadge busy={busyId === exam.id}
                          onApprove={() => handleExamDecision(exam, 'approved')}
                          onReject={() => handleExamDecision(exam, 'rejected')} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Homeworks Tab */}
        {!loading && tab === 'homeworks' && (
          homeworks.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={DK.card}>
              <p className="font-semibold" style={{ color: '#1B2038' }}>لا توجد واجبات بانتظار الموافقة</p>
            </div>
          ) : (
            <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                  <tr>
                    {['الواجب', 'المعلم', 'الكورس', 'تاريخ التسليم', 'أُضيف في', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                        style={{ color: DK.gold }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {homeworks.map((hw) => (
                    <tr key={hw.id} className="transition"
                      style={{ borderBottom: '1px solid #EDE3CE' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#1B2038' }}>{hw.title}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{hw.teacher.name}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{hw.course.title}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{formatDate(hw.due_date)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: DK.dimTxt }}>{formatDate(hw.created_at)}</td>
                      <td className="px-4 py-3">
                        <ApprovalBadge busy={busyId === hw.id}
                          onApprove={() => handleHomeworkDecision(hw, 'approved')}
                          onReject={() => handleHomeworkDecision(hw, 'rejected')} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
}
