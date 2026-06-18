import { useEffect, useState, useCallback } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import api from '../services/axios';

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleAccept = async (id: number) => {
    setActing(id);
    try {
      await api.post(`/teacher/emergency/${id}/accept`);
      await load();
    } finally {
      setActing(null);
    }
  };

  const handleResolve = async (id: number) => {
    setActing(id);
    try {
      await api.post(`/teacher/emergency/${id}/resolve`);
      await load();
    } finally {
      setActing(null);
    }
  };

  const pending  = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');

  return (
    <TeacherLayout>
      <div className="p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800" style={font}>طلبات الطوارئ الدراسية</h2>
            <p className="text-sm text-gray-400 mt-1" style={font}>
              تتحدث الصفحة تلقائياً كل 30 ثانية
              {pending.length > 0 && (
                <span className="mr-2 text-red-500 font-bold">• {pending.length} طلب جديد</span>
              )}
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
            style={font}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>

        {loading && <p className="text-gray-400 text-sm" style={font}>جاري التحميل...</p>}

        {!loading && requests.length === 0 && (
          <div className="text-center py-20 rounded-2xl bg-white border border-gray-100">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-gray-600 font-bold text-base" style={font}>لا توجد طلبات طوارئ حالياً</p>
            <p className="text-gray-400 text-sm mt-1" style={font}>ستظهر هنا طلبات الطلاب الذين يحتاجون مساعدة</p>
          </div>
        )}

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-bold text-red-600" style={font}>طلبات تنتظر الرد ({pending.length})</h3>
            </div>
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id}
                  className="bg-white rounded-2xl p-5 shadow-sm"
                  style={{ border: '1.5px solid #fecaca' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold" style={font}>
                          🚨 {req.subject}
                        </span>
                        <span className="text-xs text-gray-400" style={font}>{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm mb-1" style={font}>
                        {req.student.name}
                      </p>
                      {req.message && (
                        <p className="text-sm text-slate-500 bg-gray-50 rounded-xl px-3 py-2" style={font}>
                          "{req.message}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={acting === req.id}
                      className="flex-shrink-0 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
                      style={font}
                    >
                      {acting === req.id ? 'جاري...' : 'قبول الطلب'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted (my active requests) */}
        {accepted.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-orange-600 mb-3" style={font}>
              طلبات قبلتها ({accepted.length})
            </h3>
            <div className="space-y-3">
              {accepted.map((req) => (
                <div key={req.id}
                  className="bg-white rounded-2xl p-5 shadow-sm"
                  style={{ border: '1.5px solid #fed7aa' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold" style={font}>
                          ⏳ {req.subject}
                        </span>
                        <span className="text-xs text-gray-400" style={font}>{timeAgo(req.created_at)}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm mb-1" style={font}>
                        {req.student.name}
                        <span className="text-xs text-gray-400 font-normal mr-2" style={font}>
                          {req.student.phone}
                        </span>
                      </p>
                      {req.message && (
                        <p className="text-sm text-slate-500 bg-gray-50 rounded-xl px-3 py-2" style={font}>
                          "{req.message}"
                        </p>
                      )}
                      <p className="text-xs text-orange-500 mt-2" style={font}>
                        تواصل مع الطالب عبر غرفة الواجبات أو عبر رقمه
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolve(req.id)}
                      disabled={acting === req.id}
                      className="flex-shrink-0 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
                      style={font}
                    >
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
