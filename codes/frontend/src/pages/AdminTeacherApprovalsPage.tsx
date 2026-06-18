import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
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
        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
        {busy ? '...' : 'قبول'}
      </button>
      <button onClick={onReject} disabled={busy}
        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
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
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">موافقات المعلمين</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>مراجعة وقبول أو رفض محتوى المعلمين قبل نشره للطلاب</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2"
              style={tab === t.key
                ? { background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }
                : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(245,166,35,0.15)' }}>
              {t.label}
              {t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={tab === t.key
                    ? { background: 'rgba(4,10,24,0.25)', color: '#040a18' }
                    : { background: 'rgba(245,166,35,0.15)', color: DK.gold }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {/* Exams Tab */}
        {!loading && tab === 'exams' && (
          exams.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={DK.card}>
              <p className="font-semibold text-white">لا توجد امتحانات بانتظار الموافقة</p>
            </div>
          ) : (
            <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead style={{ background: 'rgba(245,166,35,0.04)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                  <tr>
                    {['الامتحان', 'المعلم', 'الكورس', 'المدة', 'التاريخ', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                        style={{ color: 'rgba(245,166,35,0.55)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id} className="transition"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3 font-semibold text-white">{exam.title}</td>
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
              <p className="font-semibold text-white">لا توجد واجبات بانتظار الموافقة</p>
            </div>
          ) : (
            <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead style={{ background: 'rgba(245,166,35,0.04)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                  <tr>
                    {['الواجب', 'المعلم', 'الكورس', 'تاريخ التسليم', 'أُضيف في', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                        style={{ color: 'rgba(245,166,35,0.55)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {homeworks.map((hw) => (
                    <tr key={hw.id} className="transition"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3 font-semibold text-white">{hw.title}</td>
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
