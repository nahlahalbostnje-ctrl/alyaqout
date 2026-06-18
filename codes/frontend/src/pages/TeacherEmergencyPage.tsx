import { useEffect, useState, useCallback } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import api from '../services/axios';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
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
      <div className="p-6" dir="rtl" style={font}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <div>
              <h2 className="text-xl font-bold text-white">طلبات الطوارئ الدراسية</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
                تتحدث الصفحة تلقائياً كل 30 ثانية
                {pending.length > 0 && (
                  <span className="mr-2 font-bold" style={{ color: '#f87171' }}>• {pending.length} طلب جديد</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition"
            style={{ color: DK.dimTxt, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-20 rounded-2xl" style={DK.card}>
            <p className="text-5xl mb-4">✅</p>
            <p className="font-bold text-base text-white">لا توجد طلبات طوارئ حالياً</p>
            <p className="text-sm mt-1" style={{ color: DK.dimTxt }}>ستظهر هنا طلبات الطلاب الذين يحتاجون مساعدة</p>
          </div>
        )}

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#f87171' }} />
              <h3 className="text-sm font-bold" style={{ color: '#f87171' }}>طلبات تنتظر الرد ({pending.length})</h3>
            </div>
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl"
                  style={{ background: '#070e22', border: '1.5px solid rgba(239,68,68,0.3)', boxShadow: '0 0 20px rgba(239,68,68,0.05)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                          🚨 {req.subject}
                        </span>
                        <span className="text-xs" style={{ color: DK.dimTxt }}>{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="font-bold text-white text-sm mb-1">{req.student.name}</p>
                      {req.message && (
                        <p className="text-sm px-3 py-2 rounded-xl" style={{ color: DK.dimTxt, background: 'rgba(255,255,255,0.04)' }}>
                          "{req.message}"
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleAccept(req.id)} disabled={acting === req.id}
                      className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
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
            <h3 className="text-sm font-bold mb-3" style={{ color: '#fbbf24' }}>
              طلبات قبلتها ({accepted.length})
            </h3>
            <div className="space-y-3">
              {accepted.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl"
                  style={{ background: '#070e22', border: '1.5px solid rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.04)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                          ⏳ {req.subject}
                        </span>
                        <span className="text-xs" style={{ color: DK.dimTxt }}>{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="font-bold text-white text-sm mb-1">
                        {req.student.name}
                        <span className="text-xs font-normal mr-2" style={{ color: DK.dimTxt }}>
                          {req.student.phone}
                        </span>
                      </p>
                      {req.message && (
                        <p className="text-sm px-3 py-2 rounded-xl" style={{ color: DK.dimTxt, background: 'rgba(255,255,255,0.04)' }}>
                          "{req.message}"
                        </p>
                      )}
                      <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>
                        تواصل مع الطالب عبر غرفة الواجبات أو عبر رقمه
                      </p>
                    </div>
                    <button onClick={() => handleResolve(req.id)} disabled={acting === req.id}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
                      style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
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
