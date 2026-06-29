import { useState } from 'react';
import StudentLayout from '../components/StudentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
};

interface ReviewVideo {
  id: number; subject: string; title: string; teacher: string;
  duration: string; grade: string; watched: boolean;
}

const MOCK_VIDEOS: ReviewVideo[] = [
  { id:1, subject:'رياضيات', title:'مراجعة نهائية — المعادلات التربيعية', teacher:'أ. محمد', duration:'45 دقيقة', grade:'الصف العاشر', watched:false },
  { id:2, subject:'فيزياء', title:'مراجعة شاملة — الحركة والقوى', teacher:'أ. سارة', duration:'38 دقيقة', grade:'الصف العاشر', watched:true },
  { id:3, subject:'كيمياء', title:'مراجعة التفاعلات الكيميائية', teacher:'أ. خالد', duration:'52 دقيقة', grade:'الصف العاشر', watched:false },
  { id:4, subject:'عربي', title:'مراجعة النحو والصرف', teacher:'أ. منى', duration:'40 دقيقة', grade:'الصف العاشر', watched:false },
  { id:5, subject:'إنجليزي', title:'Final Review — Grammar & Vocabulary', teacher:'أ. أحمد', duration:'35 دقيقة', grade:'الصف العاشر', watched:true },
  { id:6, subject:'رياضيات', title:'مراجعة الهندسة التحليلية', teacher:'أ. محمد', duration:'48 دقيقة', grade:'الصف العاشر', watched:false },
];

const SUBJECT_COLOR: Record<string, string> = {
  'رياضيات':'#3B82F6', 'فيزياء':'#8B5CF6', 'كيمياء':'#EC4899',
  'عربي':'#F59E0B', 'إنجليزي':'#10B981',
};

type WatchingState = { videoId: number; title: string } | null;

export default function StudentReviewVideosPage() {
  const [videos, setVideos] = useState<ReviewVideo[]>(MOCK_VIDEOS);
  const [filter, setFilter] = useState('all');
  const [watching, setWatching] = useState<WatchingState>(null);

  const subjects = ['all', ...Array.from(new Set(MOCK_VIDEOS.map(v => v.subject)))];

  const filtered = videos.filter(v =>
    filter === 'all' || v.subject === filter
  );

  const handleWatch = (v: ReviewVideo) => {
    setWatching({ videoId: v.id, title: v.title });
    setVideos(prev => prev.map(x => x.id === v.id ? { ...x, watched: true } : x));
  };

  const watched = videos.filter(v => v.watched).length;

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Header */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>فيديوهات المراجعة النهائية 📹</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>فيديوهات خاصة للمراجعة — بدون إمكانية تحميل أو تسجيل</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'إجمالي الفيديوهات', value:videos.length, icon:'🎬', color:C.gold },
            { label:'شاهدتها', value:watched, icon:'✅', color:C.green },
            { label:'لم تشاهدها', value:videos.length - watched, icon:'⏳', color:'#F59E0B' },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'14px 18px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:24, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11.5, marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subject filters */}
        <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${filter===s ? C.gold : C.border}`, background: filter===s ? C.goldBg : C.card, color: filter===s ? C.gold : C.sub, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              {s === 'all' ? '📚 الكل' : s}
            </button>
          ))}
        </div>

        {/* DRM notice */}
        <div style={{ background:'rgba(13,30,58,0.05)', borderRadius:12, padding:'10px 16px', border:`1px solid rgba(13,30,58,0.12)`, marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>🔒</span>
          <p style={{ color:C.sub, fontSize:12, margin:0 }}>هذه الفيديوهات محمية — التحميل والتسجيل غير متاحَين. للمشاهدة فقط.</p>
        </div>

        {/* Video Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
          {filtered.map(v => (
            <div key={v.id} style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'hidden' }}>
              {/* Thumbnail */}
              <div style={{ height:140, background:`linear-gradient(135deg, ${SUBJECT_COLOR[v.subject] ?? C.navy}22, ${SUBJECT_COLOR[v.subject] ?? C.navy}44)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                  onClick={() => handleWatch(v)}>
                  <span style={{ fontSize:28, marginRight:-4 }}>▶</span>
                </div>
                <span style={{ position:'absolute', top:10, right:10, background: SUBJECT_COLOR[v.subject] ?? C.navy, color:'#fff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700 }}>{v.subject}</span>
                {v.watched && <span style={{ position:'absolute', top:10, left:10, background:C.green, color:'#fff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700 }}>✓ شوهد</span>}
                <span style={{ position:'absolute', bottom:10, left:10, background:'rgba(0,0,0,0.6)', color:'#fff', padding:'2px 8px', borderRadius:6, fontSize:11 }}>🕐 {v.duration}</span>
              </div>

              <div style={{ padding:16 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:6, lineHeight:1.4 }}>{v.title}</p>
                <p style={{ color:C.sub, fontSize:12, marginBottom:4 }}>👨‍🏫 {v.teacher} · {v.grade}</p>
                <button onClick={() => handleWatch(v)}
                  style={{ marginTop:10, width:'100%', padding:'9px', borderRadius:10, background: v.watched ? C.greenBg : C.goldGrad, color: v.watched ? C.green : '#fff', fontSize:13, fontWeight:700, border: v.watched ? `1px solid ${C.green}30` : 'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                  {v.watched ? '🔄 مشاهدة مرة أخرى' : '▶ مشاهدة الآن'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Video Player Modal */}
        {watching && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, flexDirection:'column', gap:16 }}>
            <div style={{ width:'80%', maxWidth:800, background:'#000', borderRadius:16, aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', userSelect:'none' }}
              onContextMenu={e => e.preventDefault()}>
              <p style={{ color:'#fff', fontSize:16, fontWeight:700, textAlign:'center', padding:20 }}>
                🎬 {watching.title}<br/>
                <span style={{ color:'#aaa', fontSize:13, fontWeight:400 }}>وضع المشاهدة الآمن — محتوى محمي</span>
              </p>
              <div style={{ position:'absolute', inset:0, background:'transparent', zIndex:10 }} onContextMenu={e => e.preventDefault()} />
            </div>
            <button onClick={() => setWatching(null)}
              style={{ padding:'10px 28px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              إغلاق
            </button>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
