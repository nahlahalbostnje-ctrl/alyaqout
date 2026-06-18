import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentHomework, submitHomework } from '../features/student/examSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

const baseInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(245,166,35,0.15)',
  color: '#fff',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
};

const statusConfig: Record<string, { label: string; style: React.CSSProperties }> = {
  submitted: { label: 'مُسلَّم', style: { background: 'rgba(96,165,250,0.12)', color: '#60a5fa' } },
  graded:    { label: 'مُصحَّح', style: { background: 'rgba(52,211,153,0.12)',  color: '#34d399' } },
  late:      { label: 'متأخر',   style: { background: 'rgba(239,68,68,0.1)',    color: '#f87171' } },
};

export default function StudentHomeworkPage() {
  const dispatch = useAppDispatch();
  const { homeworks, loading, submitting } = useAppSelector((s) => s.studentExam);

  const [activeHw, setActiveHw] = useState<number | null>(null);
  const [form, setForm]         = useState({ file_url: '', notes: '' });
  const [flash, setFlash]       = useState<number | null>(null);

  useEffect(() => { dispatch(fetchStudentHomework()); }, [dispatch]);

  async function handleSubmit(hwId: number) {
    if (!form.file_url.trim()) return;
    await dispatch(submitHomework({ homeworkId: hwId, file_url: form.file_url, notes: form.notes || undefined }));
    setFlash(hwId); setActiveHw(null); setForm({ file_url: '', notes: '' });
    setTimeout(() => setFlash(null), 3000);
  }

  const now = new Date();

  return (
    <StudentLayout>
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h1 className="text-xl font-bold text-white">واجباتي</h1>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>{homeworks.length} واجب</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3" style={{ color: DK.dimTxt }}>
            <svg className="w-14 h-14 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>لا توجد واجبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {homeworks.map((hw) => {
              const dueDate  = new Date(hw.due_date);
              const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOpen   = activeHw === hw.id;
              const overdueBorder = hw.is_overdue && !hw.submitted ? 'rgba(239,68,68,0.3)' : 'rgba(245,166,35,0.1)';

              return (
                <div key={hw.id} className="rounded-2xl overflow-hidden"
                  style={{ background: '#070e22', border: `1px solid ${overdueBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-white">{hw.title}</h3>
                          {hw.submitted && hw.sub_status && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={statusConfig[hw.sub_status as keyof typeof statusConfig]?.style ?? { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                              {statusConfig[hw.sub_status as keyof typeof statusConfig]?.label ?? hw.sub_status}
                            </span>
                          )}
                          {!hw.submitted && hw.is_overdue && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>منتهي</span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: DK.dimTxt }}>{hw.course.title}</p>
                        {hw.description && (
                          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: DK.dimTxt }}>{hw.description}</p>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-left">
                        <p className="text-xs" style={{ color: DK.dimTxt }}>آخر موعد</p>
                        <p className="text-sm font-bold" style={{
                          color: hw.is_overdue ? '#f87171' : daysLeft <= 2 ? '#fbbf24' : 'rgba(255,255,255,0.8)'
                        }}>
                          {hw.due_date}
                        </p>
                        {!hw.submitted && !hw.is_overdue && (
                          <p className="text-xs" style={{ color: DK.dimTxt }}>
                            {daysLeft === 0 ? 'اليوم!' : `${daysLeft} يوم متبقي`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Grade display */}
                    {hw.grade !== undefined && hw.grade !== null && (
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#34d399' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold" style={{ color: '#34d399' }}>الدرجة: {hw.grade}/100</span>
                      </div>
                    )}

                    {/* Flash success */}
                    {flash === hw.id && (
                      <div className="mt-3 px-4 py-2 rounded-xl text-sm"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                        تم تسليم الواجب بنجاح
                      </div>
                    )}

                    {!hw.submitted && !hw.is_overdue && (
                      <button onClick={() => setActiveHw(isOpen ? null : hw.id)}
                        className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={isOpen
                          ? { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }
                          : { background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                        {isOpen ? 'إلغاء' : 'تسليم الواجب'}
                      </button>
                    )}
                  </div>

                  {/* Submit form */}
                  {isOpen && (
                    <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid rgba(245,166,35,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                      <div>
                        <label className="text-xs block mb-1" style={{ color: DK.dimTxt }}>رابط الملف / Google Drive</label>
                        <input type="url" value={form.file_url}
                          onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                          placeholder="https://drive.google.com/..." style={baseInput} />
                      </div>
                      <div>
                        <label className="text-xs block mb-1" style={{ color: DK.dimTxt }}>ملاحظة للمعلم (اختياري)</label>
                        <textarea rows={2} value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="أي تعليق تريد إرساله..."
                          style={{ ...baseInput, resize: 'none' }} />
                      </div>
                      <button onClick={() => handleSubmit(hw.id)}
                        disabled={submitting || !form.file_url.trim()}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                        {submitting ? 'جاري التسليم...' : 'إرسال'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
