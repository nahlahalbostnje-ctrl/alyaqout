import { useState } from 'react';
import StudentLayout from '../components/StudentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  blue:'#2563EB', blueBg:'rgba(37,99,235,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.08)',
};

const INDIVIDUAL_CHALLENGES = [
  { id:1, title:'100 سؤال في الرياضيات', desc:'أكمل 100 سؤال رياضيات خلال الأسبوع', reward:500, progress:62, total:100, days:3, difficulty:'متوسط', badge:'🧮' },
  { id:2, title:'قارئ الأسبوع', desc:'اقرأ 3 فصول من كتاب هذا الأسبوع', reward:300, progress:2, total:3, days:5, difficulty:'سهل', badge:'📖' },
  { id:3, title:'حضور كامل', desc:'احضر جميع الحصص لمدة أسبوعين', reward:800, progress:9, total:14, days:5, difficulty:'صعب', badge:'✅' },
];

const FAMILY_CHALLENGES = [
  { id:1, title:'عائلة القراءة', desc:'الطالب وولي الأمر يقرأان كتاباً واحداً معاً', studentProgress:60, parentProgress:40, reward:1000, daysLeft:7, badge:'📚' },
  { id:2, title:'تحدي الرياضة العائلية', desc:'ممارسة رياضة مشتركة 3 مرات هذا الأسبوع', studentProgress:100, parentProgress:66, reward:600, daysLeft:2, badge:'⚽' },
];

type Tab = 'individual' | 'family';

const DIFF_COLOR: Record<string, string> = {
  'سهل': '#10B981', 'متوسط': '#D97706', 'صعب': '#EF4444'
};
const DIFF_BG: Record<string, string> = {
  'سهل': 'rgba(16,185,129,0.1)', 'متوسط': 'rgba(217,119,6,0.1)', 'صعب': 'rgba(239,68,68,0.1)'
};

function ProgressBar({ value, max, color = C.gold }: { value:number; max:number; color?:string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ color:C.sub, fontSize:11 }}>{value}/{max}</span>
        <span style={{ color, fontSize:11, fontWeight:700 }}>{pct}%</span>
      </div>
      <div style={{ height:8, borderRadius:4, background:'#EDE3CE', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 0.4s ease' }} />
      </div>
    </div>
  );
}

export default function StudentChallengesPage() {
  const [tab, setTab] = useState<Tab>('individual');
  const [parentCode, setParentCode] = useState('');
  const [linked, setLinked] = useState(false);

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>نظام التحديات 🏆</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>تحديات فردية وعائلية مشتركة مع ولي الأمر</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:22 }}>
          {[
            { label:'تحدي نشط', value:'3', icon:'⚡', color:C.gold, bg:C.goldBg },
            { label:'تحديات مكتملة', value:'12', icon:'✅', color:C.green, bg:C.greenBg },
            { label:'نقاط مكتسبة', value:'4,200', icon:'💎', color:C.blue, bg:C.blueBg },
            { label:'تحدي عائلي', value:'2', icon:'👨‍👩‍👦', color:C.amber, bg:C.amberBg },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'14px 16px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:20, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11, marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div style={{ display:'flex', gap:6, marginBottom:20, background:C.card, padding:5, borderRadius:12, border:`1px solid ${C.border}`, width:'fit-content' }}>
          {([['individual','تحديات فردية ⚡'],['family','تحديات عائلية 👨‍👩‍👦']] as [Tab,string][]).map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ padding:'7px 18px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700, background: tab===v ? C.goldGrad : 'transparent', color: tab===v ? '#fff' : C.sub, transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'individual' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {INDIVIDUAL_CHALLENGES.map(ch => (
              <div key={ch.id} style={{ background:C.card, borderRadius:18, padding:22, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{ch.badge}</div>
                    <div>
                      <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:3 }}>{ch.title}</p>
                      <p style={{ color:C.sub, fontSize:12 }}>{ch.desc}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                    <span style={{ padding:'3px 10px', borderRadius:8, background:DIFF_BG[ch.difficulty], color:DIFF_COLOR[ch.difficulty], fontSize:11, fontWeight:700 }}>{ch.difficulty}</span>
                    <span style={{ color:C.dim, fontSize:11 }}>{ch.days} أيام متبقية</span>
                  </div>
                </div>
                <ProgressBar value={ch.progress} max={ch.total} color={C.gold} />
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:16 }}>💎</span>
                    <span style={{ color:C.gold, fontWeight:800, fontSize:14 }}>{ch.reward.toLocaleString()} نقطة</span>
                  </div>
                  <button onClick={()=>ch.progress<ch.total && alert('تحديث تقدم التحدي تلقائياً من نشاطك الفعلي قيد التطوير.')} style={{ padding:'8px 20px', borderRadius:10, background: ch.progress >= ch.total ? C.greenBg : C.goldGrad, border: ch.progress >= ch.total ? `1px solid ${C.green}` : 'none', color: ch.progress >= ch.total ? C.green : '#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    {ch.progress >= ch.total ? '✅ مكتمل' : 'تحديث التقدم'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'family' && (
          <div>
            {!linked && (
              <div style={{ background:`linear-gradient(135deg,${C.navy},#162144)`, borderRadius:18, padding:22, marginBottom:18, border:`1px solid ${C.goldBdr}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <span style={{ fontSize:28 }}>👨‍👩‍👦</span>
                  <div>
                    <p style={{ color:'#fff', fontWeight:800, fontSize:15 }}>ربط حساب ولي الأمر</p>
                    <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>أدخل كود ولي الأمر لتفعيل التحديات العائلية</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={parentCode} onChange={e=>setParentCode(e.target.value)} placeholder="أدخل الكود (مثال: P-12345)" style={{ flex:1, padding:'9px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }} />
                  <button onClick={() => { if(parentCode) setLinked(true); }} style={{ padding:'9px 18px', borderRadius:10, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>ربط</button>
                </div>
              </div>
            )}

            {linked && (
              <div style={{ background:C.greenBg, borderRadius:12, padding:'12px 16px', marginBottom:16, border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>✅</span>
                <p style={{ color:C.green, fontSize:13, fontWeight:700 }}>تم الربط بحساب ولي الأمر — كود: {parentCode}</p>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {FAMILY_CHALLENGES.map(ch => (
                <div key={ch.id} style={{ background:C.card, borderRadius:18, padding:22, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:C.amberBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{ch.badge}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:3 }}>{ch.title}</p>
                      <p style={{ color:C.sub, fontSize:12 }}>{ch.desc}</p>
                      <p style={{ color:C.dim, fontSize:11, marginTop:3 }}>{ch.daysLeft} أيام متبقية</p>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ color:C.gold, fontWeight:900, fontSize:18 }}>{ch.reward.toLocaleString()}</p>
                      <p style={{ color:C.dim, fontSize:10 }}>نقطة</p>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                    <div>
                      <p style={{ color:C.sub, fontSize:11, fontWeight:600, marginBottom:4 }}>أنت (الطالب)</p>
                      <ProgressBar value={ch.studentProgress} max={100} color={C.blue} />
                    </div>
                    <div>
                      <p style={{ color:C.sub, fontSize:11, fontWeight:600, marginBottom:4 }}>ولي الأمر</p>
                      <ProgressBar value={ch.parentProgress} max={100} color={C.amber} />
                    </div>
                  </div>
                  <div style={{ marginTop:14, display:'flex', gap:8 }}>
                    <button onClick={()=>alert('تحديث تقدم التحدي العائلي تلقائياً من نشاطك الفعلي قيد التطوير.')} style={{ flex:1, padding:'9px', borderRadius:10, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>تحديث تقدمي</button>
                    <button onClick={()=>alert('إرسال رسالة تشجيع لولي الأمر عبر واتساب قيد التطوير.')} style={{ padding:'9px 16px', borderRadius:10, background:'#F3F4F6', color:C.sub, fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>تشجيع ولي الأمر 💌</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
