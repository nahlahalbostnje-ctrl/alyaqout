import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentBottomNav, { C, BH } from '../components/StudentBottomNav';

interface ReviewVideo {
  id: number; subject: string; title: string; teacher: string;
  duration: string; grade: string; watched: boolean; url?: string;
}

const MOCK_VIDEOS: ReviewVideo[] = [
  { id:1, subject:'رياضيات',  title:'مراجعة نهائية — المعادلات التربيعية',    teacher:'أ. محمد السالم',  duration:'45:00', grade:'الصف العاشر',  watched:false },
  { id:2, subject:'فيزياء',   title:'مراجعة شاملة — الحركة والقوى',           teacher:'أ. سارة العمر',   duration:'38:22', grade:'الصف العاشر',  watched:true  },
  { id:3, subject:'كيمياء',   title:'مراجعة التفاعلات الكيميائية',             teacher:'أ. خالد النجار',  duration:'52:14', grade:'الصف العاشر',  watched:false },
  { id:4, subject:'عربي',     title:'مراجعة النحو والصرف الكاملة',             teacher:'أ. فاطمة علي',    duration:'40:07', grade:'الصف العاشر',  watched:false },
  { id:5, subject:'إنجليزي', title:'Final Review — Grammar & Vocabulary',    teacher:'أ. أحمد الرشيد',  duration:'35:50', grade:'الصف العاشر',  watched:true  },
  { id:6, subject:'رياضيات', title:'مراجعة الهندسة التحليلية',               teacher:'أ. محمد السالم',  duration:'48:33', grade:'الصف العاشر',  watched:false },
];

const SUBJ_COLOR: Record<string, string> = {
  'رياضيات':'#3B82F6','فيزياء':'#8B5CF6','كيمياء':'#EC4899',
  'عربي':'#D97706','إنجليزي':'#10B981',
};

interface QuickQuestion { id: number; text: string; ts: number; answer?: string; }

export default function StudentReviewVideosPage() {
  const navigate  = useNavigate();
  const videoRef  = useRef<HTMLVideoElement>(null);

  const [videos, setVideos]       = useState<ReviewVideo[]>(MOCK_VIDEOS);
  const [filter, setFilter]       = useState('all');
  const [watching, setWatching]   = useState<ReviewVideo | null>(null);

  // أسئلة عائمة
  const [showQPanel, setShowQPanel] = useState(false);
  const [qText, setQText]           = useState('');
  const [questions, setQuestions]   = useState<QuickQuestion[]>([]);
  const [qSent, setQSent]           = useState(false);

  const subjects = ['all', ...Array.from(new Set(MOCK_VIDEOS.map(v => v.subject)))];
  const filtered = videos.filter(v => filter === 'all' || v.subject === filter);
  const watched  = videos.filter(v => v.watched).length;

  const openVideo = (v: ReviewVideo) => {
    setWatching(v);
    setShowQPanel(false);
    setQText('');
    setQuestions([]);
    setQSent(false);
    setVideos(p => p.map(x => x.id === v.id ? { ...x, watched:true } : x));
  };

  const sendQuestion = () => {
    if (!qText.trim()) return;
    setQuestions(p => [...p, { id: Date.now(), text: qText.trim(), ts: Date.now() }]);
    setQText('');
    setQSent(true);
    setTimeout(() => setQSent(false), 1500);
  };

  const drmHandlers = {
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onDragStart:   (e: React.DragEvent)  => e.preventDefault(),
  };

  return (
    <div dir="rtl" style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Cairo',sans-serif", paddingBottom:BH+16 }}>

      {/* Status */}
      <div style={{ background:C.card, padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:C.navy2 }}>
        <span>9:41</span><span>▶▶ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <button onClick={() => navigate(-1)} style={{ width:36, height:36, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>‹</button>
        <h1 style={{ color:C.navy2, fontWeight:800, fontSize:18, flex:1, textAlign:'center' }}>فيديوهات المراجعة 📹</h1>
        <div style={{ width:36 }} />
      </div>

      <div style={{ padding:'14px 16px 0' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:16 }}>
          {[
            { icon:'🎬', val:videos.length, label:'إجمالي',      color:C.gold  },
            { icon:'✅', val:watched,        label:'شاهدتها',    color:'#10B981'},
            { icon:'⏳', val:videos.length-watched, label:'متبقية', color:'#D97706'},
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'12px 10px', textAlign:'center', boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{s.icon}</div>
              <p style={{ color:s.color, fontWeight:900, fontSize:20, lineHeight:1 }}>{s.val}</p>
              <p style={{ color:C.sub, fontSize:10.5, marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* DRM Notice */}
        <div style={{ background:`${C.navy2}08`, borderRadius:12, padding:'10px 14px', border:`1px solid ${C.navy2}18`, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:15 }}>🔒</span>
          <p style={{ color:C.sub, fontSize:12 }}>هذه الفيديوهات محمية — التحميل والتسجيل غير متاحَين. للمشاهدة فقط.</p>
        </div>

        {/* Subject Filters */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none', marginBottom:16, paddingBottom:2 }}>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ flexShrink:0, padding:'7px 16px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:12.5, fontWeight:filter===s?700:500, background:filter===s?C.goldGrad:'rgba(0,0,0,0.05)', color:filter===s?'#1B2038':C.sub, boxShadow:filter===s?'0 3px 10px rgba(201,149,42,0.35)':'none' }}>
              {s === 'all' ? '📚 الكل' : s}
            </button>
          ))}
        </div>

        {/* Video Cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(v => {
            const col = SUBJ_COLOR[v.subject] ?? C.navy2;
            return (
              <div key={v.id} style={{ background:C.card, borderRadius:18, overflow:'hidden', boxShadow:C.shadow, border:`1px solid ${v.watched ? 'rgba(16,185,129,0.25)' : C.border}` }}>
                {/* Thumbnail */}
                <div style={{ height:150, background:`linear-gradient(135deg,${col}22,${col}44)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', userSelect:'none' }}
                  {...drmHandlers}>
                  <button onClick={() => openVideo(v)}
                    style={{ width:58, height:58, borderRadius:'50%', background:'rgba(0,0,0,0.45)', border:'3px solid rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(4px)' }}>
                    <span style={{ fontSize:26, color:'#fff', marginRight:-4 }}>▶</span>
                  </button>
                  <span style={{ position:'absolute', top:10, right:10, background:col, color:'#fff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700 }}>{v.subject}</span>
                  {v.watched && (
                    <span style={{ position:'absolute', top:10, left:10, background:'#10B981', color:'#fff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700 }}>✓ شوهد</span>
                  )}
                  <span style={{ position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.6)', color:'#fff', padding:'2px 8px', borderRadius:6, fontSize:11 }}>🕐 {v.duration}</span>
                  {/* DRM overlay — blocks right-click drag on thumbnail */}
                  <div style={{ position:'absolute', inset:0, zIndex:2 }} onContextMenu={e=>e.preventDefault()} onDragStart={e=>e.preventDefault()} />
                </div>

                <div style={{ padding:'14px 16px' }}>
                  <p style={{ color:C.navy2, fontWeight:800, fontSize:14, marginBottom:5, lineHeight:1.4 }}>{v.title}</p>
                  <p style={{ color:C.sub, fontSize:12, marginBottom:10 }}>👨‍🏫 {v.teacher} · {v.grade}</p>
                  <button onClick={() => openVideo(v)}
                    style={{ width:'100%', padding:'10px', borderRadius:12, background:v.watched ? 'rgba(16,185,129,0.1)' : C.goldGrad, color:v.watched ? '#10B981' : '#1B2038', fontSize:13, fontWeight:700, border:v.watched ? '1px solid rgba(16,185,129,0.25)' : 'none', cursor:'pointer', boxShadow:v.watched?'none':'0 3px 12px rgba(201,149,42,0.35)' }}>
                    {v.watched ? '🔄 مشاهدة مرة أخرى' : '▶ مشاهدة الآن'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Player Modal ── */}
      {watching && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:1000, display:'flex', flexDirection:'column' }}
          onContextMenu={e=>e.preventDefault()}>

          {/* Top Bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', flexShrink:0 }}>
            <p style={{ color:'#fff', fontWeight:700, fontSize:14, flex:1, userSelect:'none' }} {...drmHandlers}>{watching.title}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowQPanel(p=>!p)}
                style={{ padding:'7px 14px', borderRadius:10, background: showQPanel ? C.goldGrad : 'rgba(197,147,65,0.2)', color: showQPanel ? '#1B2038' : C.goldL, fontWeight:700, fontSize:12.5, border:`1px solid ${C.goldBdr}`, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                ❓ أسئلة
              </button>
              <button onClick={() => setWatching(null)}
                style={{ width:34, height:34, borderRadius:8, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:18, cursor:'pointer' }}>✕</button>
            </div>
          </div>

          {/* Player Area */}
          <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>

            {/* Video + DRM Overlay */}
            <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', background:'#000', userSelect:'none' }}
              {...drmHandlers}>
              {watching.url ? (
                <video
                  ref={videoRef}
                  src={watching.url}
                  controls
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  style={{ width:'100%', maxHeight:'100%', outline:'none' }}
                  onContextMenu={e=>e.preventDefault()}
                />
              ) : (
                <div style={{ textAlign:'center', padding:24, userSelect:'none' }}>
                  <div style={{ fontSize:60, marginBottom:16 }}>🎬</div>
                  <p style={{ color:'#fff', fontSize:17, fontWeight:700, marginBottom:8 }}>{watching.title}</p>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>🔒 وضع المشاهدة الآمن — محتوى محمي</p>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:6 }}>سيُعرض الفيديو هنا عند ربطه من لوحة الأدمن</p>
                </div>
              )}
              {/* Invisible DRM shield over controls */}
              <div
                style={{ position:'absolute', top:0, left:0, right:0, bottom:48, zIndex:5 }}
                onContextMenu={e=>e.preventDefault()}
                onDragStart={e=>e.preventDefault()}
              />
            </div>

            {/* Questions Sidebar */}
            {showQPanel && (
              <div style={{ width:280, background:'rgba(13,21,53,0.95)', borderRight:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', flexShrink:0 }}>
                <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:14 }}>❓ أسئلة سريعة</p>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:2 }}>اكتب سؤالك وسيُرسَل للمعلم</p>
                </div>

                {/* Questions List */}
                <div style={{ flex:1, overflowY:'auto', padding:'10px 14px' }}>
                  {questions.length === 0 ? (
                    <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, textAlign:'center', marginTop:30 }}>لا توجد أسئلة بعد</p>
                  ) : questions.map(q => (
                    <div key={q.id} style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                      <p style={{ color:'rgba(255,255,255,0.9)', fontSize:12.5, lineHeight:1.4 }}>{q.text}</p>
                      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:10.5, marginTop:5 }}>
                        {new Date(q.ts).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div style={{ padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                  {qSent && (
                    <p style={{ color:'#10B981', fontSize:11.5, textAlign:'center', marginBottom:6 }}>✅ تم إرسال سؤالك للمعلم</p>
                  )}
                  <textarea
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    placeholder="اكتب سؤالك هنا..."
                    rows={3}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:12.5, fontFamily:"'Cairo',sans-serif", resize:'none', outline:'none', boxSizing:'border-box' }}
                  />
                  <button onClick={sendQuestion} disabled={!qText.trim()}
                    style={{ marginTop:8, width:'100%', padding:'9px', borderRadius:10, background: qText.trim() ? C.goldGrad : 'rgba(255,255,255,0.1)', color: qText.trim() ? '#1B2038' : 'rgba(255,255,255,0.3)', fontWeight:700, fontSize:13, border:'none', cursor: qText.trim() ? 'pointer' : 'not-allowed', fontFamily:"'Cairo',sans-serif" }}>
                    إرسال السؤال
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom hint */}
          <div style={{ padding:'8px 16px', display:'flex', justifyContent:'center', gap:20, flexShrink:0 }}>
            {[
              'لا تحميل','لا تسجيل شاشة','لا نسخ'
            ].map((t,i) => (
              <span key={i} style={{ color:'rgba(255,255,255,0.3)', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ color:'rgba(255,255,255,0.15)', fontSize:14 }}>🔒</span>{t}
              </span>
            ))}
          </div>
        </div>
      )}

      <StudentBottomNav cur="/student/review-videos" />
      <style>{`
        * { -webkit-user-select: none; }
        input, textarea { -webkit-user-select: text !important; }
      `}</style>
    </div>
  );
}
