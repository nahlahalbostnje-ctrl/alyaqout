import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherLiveClasses, updateTeacherClassStatus } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';
import type { TeacherLiveClass } from '../features/teacher/teacherSlice';

const TH = {
  pageBg:     '#F5EDD8',
  card:       { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  cardEnded:  { background: '#FAFAFA', border: '1px solid #EDE3CE', opacity: 0.7 },
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
  blue:       '#3B82F6',
  blueBg:     'rgba(59,130,246,0.08)',
  blueBorder: 'rgba(59,130,246,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
  redBorder:  'rgba(239,68,68,0.2)',
  navy:       '#0D1E3A',
};

interface NewClassForm {
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  course_title: string;
}

const EMPTY_FORM: NewClassForm = {
  title: '', description: '', scheduled_at: '', duration_minutes: 60, course_title: '',
};

function statusBadge(status: TeacherLiveClass['status']) {
  if (status === 'live') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: TH.green }} />
      جارية الآن
    </span>
  );
  if (status === 'scheduled') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: TH.blueBg, color: TH.blue, border: `1px solid ${TH.blueBorder}` }}>مجدولة</span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: '#F3F4F6', color: TH.textDim, border: '1px solid #E5E7EB' }}>منتهية</span>
  );
}

// ─── Interactive Whiteboard ────────────────────────────────────────────────────
type WBTool = 'pen' | 'eraser' | 'text' | 'shape';
const WB_COLORS = ['#1B2038','#C59341','#EF4444','#10B981','#3B82F6','#8B5CF6','#F59E0B','#FFFFFF'];

function InteractiveWhiteboard({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<WBTool>('pen');
  const [color, setColor] = useState('#1B2038');
  const [size, setSize] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPos = useRef<{x:number,y:number}|null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    setHistory(h => [...h.slice(-19), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const undo = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    setHistory(h => {
      if (h.length === 0) return h;
      const next = [...h]; const prev = next.pop()!;
      ctx.putImageData(prev, 0, 0);
      return next;
    });
  };

  const clearBoard = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    saveHistory();
    ctx.fillStyle = '#F8F9FA'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    saveHistory();
    const pos = getPos(e);
    lastPos.current = pos;
    setDrawing(true);
    if (tool === 'eraser') { ctx.clearRect(pos.x - size*3, pos.y - size*3, size*6, size*6); }
    else { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); }
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    if (tool === 'eraser') {
      ctx.clearRect(pos.x - size*4, pos.y - size*4, size*8, size*8);
    } else {
      ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.strokeStyle = color;
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
    }
    lastPos.current = pos;
  };

  const onEnd = () => { setDrawing(false); lastPos.current = null; };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#F8F9FA'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const downloadImg = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement('a'); a.download = 'whiteboard.png'; a.href = canvas.toDataURL(); a.click();
  };

  const gold = '#C59341';

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:3000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', width:'95vw', maxWidth:960, maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.4)' }}>
        {/* Toolbar */}
        <div style={{ background:'#0D1E3A', padding:'10px 16px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ color:'#fff', fontWeight:800, fontSize:14, marginLeft:8 }}>🖊️ السبورة التفاعلية</span>
          <div style={{ flex:1 }} />

          {/* Tools */}
          {(['pen','eraser'] as WBTool[]).map(t => (
            <button key={t} onClick={() => setTool(t)}
              style={{ padding:'6px 14px', borderRadius:8, background:tool===t?gold:'rgba(255,255,255,0.1)', color:tool===t?'#1B2038':'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:"'Cairo',sans-serif" }}>
              {t==='pen'?'✏️ قلم':'🔲 ممحاة'}
            </button>
          ))}

          {/* Sizes */}
          {[2,4,8,14].map(s => (
            <button key={s} onClick={() => setSize(s)}
              style={{ width:28, height:28, borderRadius:'50%', background:size===s?gold:'rgba(255,255,255,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:s*1.5, height:s*1.5, borderRadius:'50%', background: size===s?'#1B2038':'#fff' }} />
            </button>
          ))}

          {/* Colors */}
          <div style={{ display:'flex', gap:4 }}>
            {WB_COLORS.map(c => (
              <button key={c} onClick={() => { setTool('pen'); setColor(c); }}
                style={{ width:22, height:22, borderRadius:'50%', background:c, border: color===c&&tool==='pen'?'3px solid #C59341':'2px solid rgba(255,255,255,0.3)', cursor:'pointer' }} />
            ))}
          </div>

          {/* Actions */}
          <button onClick={undo} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(255,255,255,0.1)', color:'#fff', border:'none', cursor:'pointer', fontSize:12, fontFamily:"'Cairo',sans-serif" }}>↩ تراجع</button>
          <button onClick={clearBoard} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(239,68,68,0.2)', color:'#EF4444', border:'none', cursor:'pointer', fontSize:12, fontFamily:"'Cairo',sans-serif" }}>🗑️ مسح الكل</button>
          <button onClick={downloadImg} style={{ padding:'6px 12px', borderRadius:8, background:`rgba(197,147,65,0.2)`, color:gold, border:'none', cursor:'pointer', fontSize:12, fontFamily:"'Cairo',sans-serif" }}>⬇️ حفظ</button>
          <button onClick={onClose} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(255,255,255,0.1)', color:'#fff', border:'none', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>

        {/* Canvas */}
        <canvas ref={canvasRef} width={1200} height={700}
          style={{ width:'100%', flex:1, cursor: tool==='eraser' ? 'cell' : 'crosshair', display:'block', touchAction:'none' }}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} />
      </div>
    </div>
  );
}

export default function TeacherLiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { liveClasses, loading, error } = useAppSelector((s) => s.teacher);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewClassForm>(EMPTY_FORM);
  const [localClasses, setLocalClasses] = useState<TeacherLiveClass[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  useEffect(() => { dispatch(fetchTeacherLiveClasses()); }, [dispatch]);

  const allClasses = [...liveClasses, ...localClasses];
  const active = allClasses.filter((c) => c.status !== 'ended');
  const ended  = allClasses.filter((c) => c.status === 'ended');

  const handleStart = async (cls: TeacherLiveClass) => {
    if (!cls.agora_channel) return;
    await dispatch(updateTeacherClassStatus(cls.id)).unwrap();
    navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
  };

  const handleJoin = (cls: TeacherLiveClass) => {
    if (!cls.agora_channel) return;
    navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
  };

  const handleCreateClass = async () => {
    if (!form.title.trim() || !form.scheduled_at || !form.course_title.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    const newCls: TeacherLiveClass = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      scheduled_at: form.scheduled_at,
      duration_minutes: form.duration_minutes,
      status: 'scheduled',
      agora_channel: null,
      course: { id: 0, title: form.course_title },
    };

    setLocalClasses(p => [newCls, ...p]);
    setSubmitting(false);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSuccessMsg('✅ تم جدولة الحصة بنجاح! سيتم إشعار الطلاب.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <TeacherLayout>
      {showWhiteboard && <InteractiveWhiteboard onClose={() => setShowWhiteboard(false)} />}

      <div className="p-6 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: TH.pageBg }}>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
              <h2 className="text-xl font-bold" style={{ color: TH.text }}>حصصي المباشرة</h2>
            </div>
            <p className="text-xs mr-4" style={{ color: TH.textSub }}>إدارة حصصك المجدولة والجارية</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button onClick={() => setShowWhiteboard(true)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:12, background:'rgba(13,30,58,0.08)', color:'#0D1E3A', fontWeight:700, fontSize:13, border:'1px solid rgba(13,30,58,0.15)', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              🖊️ السبورة التفاعلية
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                background: TH.goldGrad, color: '#fff',
                fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(201,149,42,0.4)',
                fontFamily: "'Cairo',sans-serif",
              }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              إضافة حصة جديدة
            </button>
          </div>
        </div>

        {/* Success */}
        {successMsg && (
          <div style={{
            background: TH.greenBg, border: `1px solid ${TH.greenBorder}`,
            color: TH.green, padding: '12px 16px', borderRadius: 12, marginBottom: 16,
            fontWeight: 600, fontSize: 13,
          }}>
            {successMsg}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${TH.goldBorder}`, borderTopColor: TH.gold }} />
          </div>
        )}
        {error && (
          <p className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ color: TH.red, background: TH.redBg, border: `1px solid ${TH.redBorder}` }}>
            {error}
          </p>
        )}

        {!loading && allClasses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: TH.textDim }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>لا توجد حصص بعد</p>
            <p style={{ fontSize: 13 }}>اضغط "إضافة حصة جديدة" لجدولة أول حصة مباشرة</p>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: TH.textSub }}>المجدولة والجارية</h3>
            <div className="space-y-3">
              {active.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl" style={TH.card}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(cls.status)}
                        <p className="font-semibold" style={{ color: TH.text }}>{cls.title}</p>
                      </div>
                      {cls.description && (
                        <p className="text-xs mb-2" style={{ color: TH.textSub }}>{cls.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: TH.textSub }}>
                        <span>📚 {cls.course.title}</span>
                        <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                        <span>⏱ {cls.duration_minutes} دقيقة</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 mr-4">
                      {cls.status === 'scheduled' && cls.agora_channel && (
                        <button onClick={() => handleStart(cls)}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition"
                          style={{ background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                          بدء الحصة
                        </button>
                      )}
                      {cls.status === 'scheduled' && !cls.agora_channel && (
                        <span style={{ fontSize: 11, color: TH.textDim, background: '#F3F4F6', padding: '4px 10px', borderRadius: 8 }}>
                          ⏳ بانتظار الرابط
                        </span>
                      )}
                      {cls.status === 'live' && cls.agora_channel && (
                        <button onClick={() => handleJoin(cls)}
                          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition"
                          style={{ background: TH.goldGrad, color: '#fff' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                          </svg>
                          الدخول للحصة
                        </button>
                      )}
                      {cls.status === 'live' && (
                        <button onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                          className="text-xs transition"
                          style={{ color: TH.red }}>
                          إنهاء الحصة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ended.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: TH.textSub }}>المنتهية</h3>
            <div className="space-y-2">
              {ended.map((cls) => (
                <div key={cls.id} className="p-4 rounded-xl" style={TH.cardEnded}>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(cls.status)}
                    <p className="font-medium" style={{ color: TH.textSub }}>{cls.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: TH.textDim }}>
                    <span>📚 {cls.course.title}</span>
                    <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                    <span>⏱ {cls.duration_minutes} دقيقة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODAL: إضافة حصة ═══ */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
            width: '100%', maxWidth: 460,
            fontFamily: "'Cairo',sans-serif", direction: 'rtl',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ color: TH.navy, fontWeight: 800, fontSize: 18 }}>إضافة حصة مباشرة</h3>
                <p style={{ color: TH.textSub, fontSize: 12, marginTop: 2 }}>سيتم إشعار الطلاب تلقائياً بعد الجدولة</p>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TH.textSub }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { label: 'عنوان الحصة *', key: 'title', placeholder: 'مثال: شرح الفصل الثالث — التوابع الرياضية', type: 'text' },
                { label: 'المادة / الدورة *', key: 'course_title', placeholder: 'مثال: الرياضيات — الصف الثاني الثانوي', type: 'text' },
                { label: 'تاريخ ووقت الحصة *', key: 'scheduled_at', placeholder: '', type: 'datetime-local' },
              ] as { label: string; key: keyof NewClassForm; placeholder: string; type: string }[]).map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: TH.text, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key] as string}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 12,
                      border: '1px solid #E2E8F0', fontSize: 13,
                      fontFamily: "'Cairo',sans-serif", background: '#F8FAFC',
                      outline: 'none', color: TH.text,
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', color: TH.text, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  مدة الحصة (دقيقة)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[30, 45, 60, 90].map(d => (
                    <button key={d} onClick={() => setForm(p => ({ ...p, duration_minutes: d }))}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10,
                        border: `1px solid ${form.duration_minutes === d ? TH.gold : '#E2E8F0'}`,
                        background: form.duration_minutes === d ? TH.goldBg : '#F8FAFC',
                        color: form.duration_minutes === d ? TH.gold : TH.textSub,
                        fontWeight: form.duration_minutes === d ? 700 : 500,
                        fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: TH.text, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>ملاحظات (اختياري)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="أي تعليمات خاصة للطلاب..."
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '1px solid #E2E8F0', fontSize: 13, resize: 'none',
                    fontFamily: "'Cairo',sans-serif", background: '#F8FAFC', outline: 'none', color: TH.text,
                  }}
                />
              </div>

              <button
                onClick={handleCreateClass}
                disabled={submitting || !form.title.trim() || !form.scheduled_at || !form.course_title.trim()}
                style={{
                  width: '100%', padding: '13px', borderRadius: 14,
                  background: TH.goldGrad, color: '#fff',
                  fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
                  opacity: submitting || !form.title.trim() || !form.scheduled_at || !form.course_title.trim() ? 0.6 : 1,
                  fontFamily: "'Cairo',sans-serif",
                  boxShadow: '0 4px 14px rgba(201,149,42,0.4)',
                  transition: 'opacity 0.2s',
                }}>
                {submitting ? '⏳ جاري الجدولة...' : '📅 جدولة الحصة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
