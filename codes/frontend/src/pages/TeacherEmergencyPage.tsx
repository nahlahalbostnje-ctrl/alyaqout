import { useEffect, useState, useCallback } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import api from '../services/axios';

const TH = {
  pageBg:     '#F5EDD8',
  card:       { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:       '#C9952A',
  goldGrad:   'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:     'rgba(201,149,42,0.08)',
  goldBorder: 'rgba(201,149,42,0.2)',
  text:       '#1B2038',
  textSub:    '#6B7280',
  textDim:    '#9CA3AF',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.08)',
  greenBorder:'rgba(16,185,129,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
  redBorder:  'rgba(239,68,68,0.25)',
  amber:      '#F59E0B',
  amberBg:    'rgba(245,158,11,0.08)',
  amberBorder:'rgba(245,158,11,0.25)',
};

const font = { fontFamily: "'Cairo', sans-serif" };

interface EmergencyRequest {
  id:          number;
  subject:     string;
  message:     string | null;
  status:      'pending' | 'accepted' | 'resolved';
  teacher_id:  number | null;
  student:     { id: number; name: string; phone: string };
  accepted_at: string | null;
  created_at:  string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

export default function TeacherEmergencyPage() {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/teacher/emergency');
      setRequests(data.requests);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleAccept = async (id: number) => {
    setActing(id);
    try { await api.post(`/teacher/emergency/${id}/accept`); await load(); }
    finally { setActing(null); }
  };

  const handleResolve = async (id: number) => {
    setActing(id);
    try { await api.post(`/teacher/emergency/${id}/resolve`); await load(); }
    finally { setActing(null); }
  };

  const pending  = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');

  return (
    <TeacherLayout>
      <div className="p-6 min-h-screen" dir="rtl" style={{ ...font, background: TH.pageBg }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: TH.text }}>طلبات الطوارئ الدراسية</h2>
              <p className="text-xs mt-0.5" style={{ color: TH.textSub }}>
                تتحدث الصفحة تلقائياً كل 30 ثانية
                {pending.length > 0 && (
                  <span className="mr-2 font-bold" style={{ color: TH.red }}>• {pending.length} طلب جديد</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition"
            style={{ color: TH.textSub, background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${TH.goldBorder}`, borderTopColor: TH.gold }} />
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-20 rounded-2xl" style={TH.card}>
            <p className="text-5xl mb-4">✅</p>
            <p className="font-bold text-base" style={{ color: TH.text }}>لا توجد طلبات طوارئ حالياً</p>
            <p className="text-sm mt-1" style={{ color: TH.textSub }}>ستظهر هنا طلبات الطلاب الذين يحتاجون مساعدة</p>
          </div>
        )}

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: TH.red }} />
              <h3 className="text-sm font-bold" style={{ color: TH.red }}>طلبات تنتظر الرد ({pending.length})</h3>
            </div>
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl"
                  style={{ background: '#FFFFFF', border: `1.5px solid ${TH.redBorder}`, boxShadow: '0 2px 16px rgba(239,68,68,0.06)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: TH.redBg, color: TH.red, border: `1px solid ${TH.redBorder}` }}>
                          🚨 {req.subject}
                        </span>
                        <span className="text-xs" style={{ color: TH.textDim }}>{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="font-bold text-sm mb-1" style={{ color: TH.text }}>{req.student.name}</p>
                      {req.message && (
                        <p className="text-sm px-3 py-2 rounded-xl" style={{ color: TH.textSub, background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                          "{req.message}"
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleAccept(req.id)} disabled={acting === req.id}
                      className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
                      style={{ background: TH.redBg, color: TH.red, border: `1px solid ${TH.redBorder}` }}>
                      {acting === req.id ? 'جاري...' : 'قبول الطلب'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Requests */}
        {accepted.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: TH.amber }}>
              طلبات قبلتها ({accepted.length})
            </h3>
            <div className="space-y-3">
              {accepted.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl"
                  style={{ background: '#FFFFFF', border: `1.5px solid ${TH.amberBorder}`, boxShadow: '0 2px 16px rgba(245,158,11,0.06)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: TH.amberBg, color: TH.amber, border: `1px solid ${TH.amberBorder}` }}>
                          ⏳ {req.subject}
                        </span>
                        <span className="text-xs" style={{ color: TH.textDim }}>{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="font-bold text-sm mb-1" style={{ color: TH.text }}>
                        {req.student.name}
                        <span className="text-xs font-normal mr-2" style={{ color: TH.textSub }}>
                          {req.student.phone}
                        </span>
                      </p>
                      {req.message && (
                        <p className="text-sm px-3 py-2 rounded-xl" style={{ color: TH.textSub, background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                          "{req.message}"
                        </p>
                      )}
                      <p className="text-xs mt-2" style={{ color: TH.amber }}>
                        تواصل مع الطالب عبر غرفة الواجبات أو عبر رقمه
                      </p>
                    </div>
                    <button onClick={() => handleResolve(req.id)} disabled={acting === req.id}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
                      style={{ background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` }}>
                      {acting === req.id ? 'جاري...' : 'تم الحل ✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
