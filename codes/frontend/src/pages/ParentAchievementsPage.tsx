import { useState } from 'react';
import ParentLayout from '../components/ParentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
  purple:'#8B5CF6', purpleBg:'rgba(139,92,246,0.08)',
  amber:'#F59E0B', amberBg:'rgba(245,158,11,0.08)',
};

const CHILDREN_DATA = [
  {
    id: 1, name: 'محمد أحمد', initials: 'مأ', color: '#C59341', grade: 'الصف الخامس',
    earned: [
      { emoji:'🎯', name:'متفوق في الرياضيات',   desc:'حصل على 90%+ في 5 اختبارات',           date:'2025-05-10', pts:300 },
      { emoji:'📚', name:'قارئ نهم',               desc:'أكمل 10 فيديوهات تعليمية',             date:'2025-04-22', pts:150 },
      { emoji:'🏆', name:'متصدر الدوري',          desc:'وصل للمركز الأول في دوري الصف',        date:'2025-03-15', pts:500 },
      { emoji:'⭐', name:'ملتزم الحضور',          desc:'حضر 20 حصة متتالية',                   date:'2025-02-28', pts:200 },
    ],
    locked: [
      { emoji:'💎', name:'نجم المنصة',    desc:'أكمل جميع مواد الفصل',           pts:500 },
      { emoji:'🌟', name:'مبدع الفصل',   desc:'احصل على 100% في اختبار',         pts:300 },
      { emoji:'🎓', name:'خريج ممتاز',   desc:'أكمل 3 دورات في موسم واحد',      pts:750 },
      { emoji:'🚀', name:'صاروخ المعرفة', desc:'أكمل 50 فيديو تعليمي',           pts:400 },
    ],
  },
  {
    id: 2, name: 'سارة أحمد', initials: 'سأ', color: '#3B82F6', grade: 'الصف السادس',
    earned: [
      { emoji:'🌸', name:'مبدعة اللغة العربية', desc:'95%+ في اختبارات العربية',   date:'2025-05-18', pts:280 },
      { emoji:'📖', name:'حافظة متميزة',         desc:'حفظت 10 نصوص أدبية',        date:'2025-04-05', pts:220 },
      { emoji:'🎵', name:'ناجحة بامتياز',        desc:'اجتازت جميع اختبارات الفصل', date:'2025-03-20', pts:350 },
    ],
    locked: [
      { emoji:'🔬', name:'عالمة الفصل',  desc:'100% في اختبارات العلوم',  pts:400 },
      { emoji:'🏅', name:'سفيرة التميز', desc:'5 شارات في فصل واحد',     pts:600 },
      { emoji:'💡', name:'مبتكرة',       desc:'قدمي 3 مشاريع إبداعية',   pts:350 },
      { emoji:'🌍', name:'لغوية موهوبة', desc:'90%+ في 3 لغات مختلفة',  pts:450 },
    ],
  },
  {
    id: 3, name: 'علي أحمد', initials: 'عأ', color: '#10B981', grade: 'الصف الثالث',
    earned: [
      { emoji:'🌱', name:'بداية موهوبة', desc:'أكمل أول 5 دروس بنجاح', date:'2025-05-01', pts:100 },
      { emoji:'😊', name:'طالب منتظم',   desc:'حضر 10 حصص متتالية',    date:'2025-04-15', pts:150 },
    ],
    locked: [
      { emoji:'🎯', name:'متفوق في مادة',  desc:'90%+ في اختبارين متتاليين', pts:200 },
      { emoji:'📚', name:'محب الكتب',      desc:'أكمل 5 فيديوهات تعليمية',  pts:120 },
      { emoji:'🏆', name:'نجم الفصل',     desc:'أعلى درجة في الصف',         pts:300 },
      { emoji:'⚡', name:'سريع التعلم',    desc:'أكمل 3 دروس في يوم واحد',  pts:180 },
    ],
  },
];

const MY_BADGES = [
  { emoji:'👁️', name:'ولي أمر متابع',  pts:100,  earned:true,  desc:'تتبعت نتائج 10 اختبارات' },
  { emoji:'💡', name:'داعم التعلم',    pts:250,  earned:true,  desc:'شاهدت 5 توصيات ذكية' },
  { emoji:'⭐', name:'شريك النجاح',   pts:500,  earned:true,  desc:'حضرت جلسة إرشاد واحدة' },
  { emoji:'📚', name:'أكاديمي الأسرة', pts:750,  earned:false, desc:'أكمل 3 دورات في الأكاديمية' },
  { emoji:'🏅', name:'قائد الأسرة',   pts:1000, earned:false, desc:'حقق أهداف 3 أشهر متتالية' },
  { emoji:'💎', name:'سفير الياقوت',  pts:2000, earned:false, desc:'بلغ 10,000 نقطة في الدوري' },
];

const FAMILY_GOALS = [
  { label:'رفع المتوسط العام فوق 90%', progress:78, color:'#C59341' },
  { label:'حضور جميع الحصص المباشرة',  progress:94, color:'#10B981' },
  { label:'إكمال 10 دورات عائلية',      progress:40, color:'#3B82F6' },
  { label:'الوصول لـ 8,000 نقطة دوري', progress:67, color:'#8B5CF6' },
];

export default function ParentAchievementsPage() {
  const [selectedChild, setSelectedChild] = useState(0);
  const child = CHILDREN_DATA[selectedChild];
  const totalEarned = CHILDREN_DATA.reduce((s, c) => s + c.earned.length, 0);
  const totalPts = CHILDREN_DATA.reduce((s, c) => s + c.earned.reduce((sp, b) => sp + b.pts, 0), 0);
  const myEarned = MY_BADGES.filter(b => b.earned).length;
  const myPts = MY_BADGES.filter(b => b.earned).reduce((s, b) => s + b.pts, 0);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif", minHeight: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>الإنجازات والشارات 🏅</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>معرض الأوسمة والشارات التقديرية لأبنائك</p>
        </div>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'شارات الأبناء', value: totalEarned, icon:'🏆', color:C.gold, bg:C.goldBg },
            { label:'شاراتي كولي أمر', value: myEarned, icon:'👑', color:C.purple, bg:C.purpleBg },
            { label:'نقاط الأبناء', value: totalPts.toLocaleString('ar-EG'), icon:'⭐', color:C.blue, bg:C.blueBg },
            { label:'نقاطي', value: myPts.toLocaleString('ar-EG'), icon:'💎', color:C.green, bg:C.greenBg },
          ].map((s, i) => (
            <div key={i} style={{ background:C.card, borderRadius:16, padding:20, boxShadow:C.shadow, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ color:C.sub, fontSize:11.5, marginBottom:2 }}>{s.label}</p>
                <p style={{ color:C.text, fontSize:26, fontWeight:900, lineHeight:1 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My badges as parent */}
        <div style={{ background:C.card, borderRadius:16, padding:20, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:C.goldGrad }} />
            <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>شاراتي — ولي الأمر</span>
            <span style={{ background:C.goldBg, color:C.gold, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, border:`1px solid ${C.goldBdr}` }}>{myEarned} مكتسبة</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
            {MY_BADGES.map((b, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, textAlign:'center' }}>
                <div style={{
                  width:66, height:66, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
                  background: b.earned ? `linear-gradient(135deg,rgba(197,147,65,0.15),rgba(212,166,90,0.08))` : '#F3F4F6',
                  border: b.earned ? `2px solid ${C.goldBdr}` : '2px solid #E5E7EB',
                  boxShadow: b.earned ? `0 4px 14px rgba(197,147,65,0.2)` : 'none',
                  filter: b.earned ? 'none' : 'grayscale(1)',
                  opacity: b.earned ? 1 : 0.5,
                  position:'relative',
                }}>
                  {b.emoji}
                  {!b.earned && (
                    <div style={{ position:'absolute', bottom:-2, right:-2, width:20, height:20, borderRadius:'50%', background:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>🔒</div>
                  )}
                </div>
                <p style={{ color: b.earned ? C.text : C.dim, fontSize:11, fontWeight:700, lineHeight:1.3 }}>{b.name}</p>
                <p style={{ color: b.earned ? C.gold : C.dim, fontSize:10.5, fontWeight:600 }}>{b.pts} نقطة</p>
                {!b.earned && <p style={{ color:C.dim, fontSize:9.5, lineHeight:1.4 }}>{b.desc}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Children badges */}
        <div style={{ background:C.card, borderRadius:16, padding:20, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:C.goldGrad }} />
            <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>شارات الأبناء</span>
          </div>

          {/* Child selector */}
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {CHILDREN_DATA.map((c, i) => (
              <button key={c.id} onClick={() => setSelectedChild(i)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'9px 18px',
                borderRadius:12, border: selectedChild === i ? 'none' : `1px solid ${C.border}`,
                background: selectedChild === i ? c.color : C.card,
                color: selectedChild === i ? '#fff' : C.text,
                fontWeight:700, fontSize:13, cursor:'pointer',
                boxShadow: selectedChild === i ? `0 4px 14px ${c.color}40` : 'none',
                fontFamily:"'Cairo',sans-serif",
              }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background: selectedChild === i ? 'rgba(255,255,255,0.25)' : `${c.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color: selectedChild === i ? '#fff' : c.color }}>
                  {c.initials}
                </div>
                {c.name}
              </button>
            ))}
          </div>

          {/* Earned */}
          <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:12 }}>✅ الشارات المكتسبة ({child.earned.length})</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
            {child.earned.map((b, i) => (
              <div key={i} style={{ background:`linear-gradient(160deg,#FFFDF7,${C.goldBg})`, borderRadius:14, padding:16, border:`1px solid ${C.goldBdr}`, textAlign:'center', boxShadow:'0 2px 10px rgba(197,147,65,0.12)' }}>
                <div style={{ fontSize:38, marginBottom:8 }}>{b.emoji}</div>
                <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:4 }}>{b.name}</p>
                <p style={{ color:C.sub, fontSize:10.5, marginBottom:8, lineHeight:1.5 }}>{b.desc}</p>
                <span style={{ background:C.goldBg, color:C.gold, fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:20, border:`1px solid ${C.goldBdr}` }}>+{b.pts} نقطة</span>
                <p style={{ color:C.dim, fontSize:9.5, marginTop:6 }}>{b.date}</p>
              </div>
            ))}
          </div>

          {/* Locked */}
          <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:12 }}>🔒 الشارات المقفلة ({child.locked.length})</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {child.locked.map((b, i) => (
              <div key={i} style={{ background:'#F9FAFB', borderRadius:14, padding:16, border:'1px solid #E5E7EB', textAlign:'center', opacity:0.75 }}>
                <div style={{ fontSize:38, marginBottom:8, filter:'grayscale(1)', position:'relative', display:'inline-block' }}>
                  {b.emoji}
                  <span style={{ position:'absolute', bottom:-4, right:-6, fontSize:14 }}>🔒</span>
                </div>
                <p style={{ color:C.sub, fontWeight:700, fontSize:13, marginBottom:4 }}>{b.name}</p>
                <p style={{ color:C.dim, fontSize:10.5, marginBottom:8, lineHeight:1.5 }}>{b.desc}</p>
                <span style={{ background:'#F3F4F6', color:C.dim, fontSize:10, fontWeight:600, padding:'2px 10px', borderRadius:20 }}>{b.pts} نقطة</span>
              </div>
            ))}
          </div>
        </div>

        {/* Family goals */}
        <div style={{ background:C.card, borderRadius:16, padding:20, boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:C.goldGrad }} />
            <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>الأهداف العائلية</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {FAMILY_GOALS.map((g, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ color:C.text, fontSize:13, fontWeight:600 }}>{g.label}</span>
                  <span style={{ color:g.color, fontSize:13, fontWeight:800 }}>{g.progress}%</span>
                </div>
                <div style={{ height:8, borderRadius:4, background:`${g.color}18` }}>
                  <div style={{ height:'100%', width:`${g.progress}%`, borderRadius:4, background:`linear-gradient(90deg,${g.color},${g.color}bb)`, transition:'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ParentLayout>
  );
}
