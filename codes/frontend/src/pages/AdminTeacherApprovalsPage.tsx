import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

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
      <button
        onClick={onApprove}
        disabled={busy}
        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
      >
        {busy ? '...' : 'قبول'}
      </button>
      <button
        onClick={onReject}
        disabled={busy}
        className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50"
      >
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
    try {
      await Promise.all([loadExams(), loadHomeworks()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExamDecision = async (exam: PendingExam, status: 'approved' | 'rejected') => {
    setBusyId(exam.id);
    try {
      await api.patch(`/admin/approvals/exams/${exam.id}`, { status });
      setExams((prev) => prev.filter((e) => e.id !== exam.id));
    } finally {
      setBusyId(null);
    }
  };

  const handleHomeworkDecision = async (hw: PendingHomework, status: 'approved' | 'rejected') => {
    setBusyId(hw.id);
    try {
      await api.patch(`/admin/approvals/homeworks/${hw.id}`, { status });
      setHomeworks((prev) => prev.filter((h) => h.id !== hw.id));
    } finally {
      setBusyId(null);
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'exams',     label: 'الامتحانات', count: exams.length    },
    { key: 'homeworks', label: 'الواجبات',   count: homeworks.length },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">موافقات المعلمين</h2>
          <p className="text-sm text-gray-400 mt-1">مراجعة وقبول أو رفض محتوى المعلمين قبل نشره للطلاب</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${tab === t.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

        {/* Exams Tab */}
        {!loading && tab === 'exams' && (
          <>
            {exams.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-gray-500 font-semibold">لا توجد امتحانات بانتظار الموافقة</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">الامتحان</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">المعلم</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">الكورس</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">المدة</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">التاريخ</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800">{exam.title}</td>
                        <td className="px-4 py-3 text-gray-600">{exam.teacher.name}</td>
                        <td className="px-4 py-3 text-gray-500">{exam.course.title}</td>
                        <td className="px-4 py-3 text-gray-500">{exam.duration_minutes} دقيقة</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(exam.created_at)}</td>
                        <td className="px-4 py-3">
                          <ApprovalBadge
                            busy={busyId === exam.id}
                            onApprove={() => handleExamDecision(exam, 'approved')}
                            onReject={() => handleExamDecision(exam, 'rejected')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Homeworks Tab */}
        {!loading && tab === 'homeworks' && (
          <>
            {homeworks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-gray-500 font-semibold">لا توجد واجبات بانتظار الموافقة</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">الواجب</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">المعلم</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">الكورس</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">تاريخ التسليم</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-semibold">أُضيف في</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {homeworks.map((hw) => (
                      <tr key={hw.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800">{hw.title}</td>
                        <td className="px-4 py-3 text-gray-600">{hw.teacher.name}</td>
                        <td className="px-4 py-3 text-gray-500">{hw.course.title}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(hw.due_date)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(hw.created_at)}</td>
                        <td className="px-4 py-3">
                          <ApprovalBadge
                            busy={busyId === hw.id}
                            onApprove={() => handleHomeworkDecision(hw, 'approved')}
                            onReject={() => handleHomeworkDecision(hw, 'rejected')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
