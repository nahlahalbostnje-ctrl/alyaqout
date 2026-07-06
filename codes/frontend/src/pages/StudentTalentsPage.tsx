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

const TALENT_CATEGORIES = [
  { emoji:'🎨', label:'فنون إبداعية', desc:'رسم، تصميم، خط' },
  { emoji:'🎵', label:'موسيقى وفنون', desc:'عزف، غناء، توليف' },
  { emoji:'💻', label:'تقنية وبرمجة', desc:'تطوير، تصميم مواقع' },
  { emoji:'📖', label:'أدب وكتابة', desc:'شعر، قصص، مقالات' },
  { emoji:'🏃', label:'رياضة وحركة', desc:'ألعاب، تمارين، رياضة' },
  { emoji:'🔬', label:'علوم واختراع', desc:'تجارب، اختراعات' },
  { emoji:'🎭', label:'تمثيل ومسرح', desc:'تمثيل، إخراج، خطابة' },
  { emoji:'📸', label:'تصوير', desc:'تصوير، مونتاج' },
];

const PROFILES = [
  { name:'سارة محمد', talent:'فنون إبداعية', level:'متقدمة', emoji:'🎨', pts:840, badge:'🥇' },
  { name:'علي خالد', talent:'برمجة', level:'متوسط', emoji:'💻', pts:620, badge:'🥈' },
  { name:'منى عمر', talent:'أدب وكتابة', level:'مبتدئة', emoji:'📖', pts:310, badge:'🥉' },
];

type Step = 'survey' | 'profile';

export default function StudentTalentsPage() {
  const [step, setStep] = useState<Step>('survey');
  const [form, setForm] = useState({ name:'', talent:'', grade:'', age:'', goal:'', dream:'' });
  const [submitted, setSubmitted] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState('');

  const handleSubmit = () => {
    if (!form.name || !selectedTalent || !form.grade) return;
    setSubmitted(true);
    setStep('profile');
  };

  if (step === 'profile' && submitted) {
    return (
      <StudentLayout>
        <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
              <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>حاضنة المواهب 💡</h1>
            </div>
          </div>
          {/* Profile Card */}
          <div style={{ background:`linear-gradient(135deg,${C.navy},#162144)`, borderRadius:20, padding:30, marginBottom:20, textAlign:'center', border:`1px solid ${C.goldBdr}` }}>
            <div style={{ fontSize:64, marginBottom:12 }}>
              {TALENT_CATEGORIES.find(t=>t.label===selectedTalent)?.emoji ?? '⭐'}
            </div>
            <h2 style={{ color:'#fff', fontWeight:900, fontSize:22, marginBottom:4 }}>{form.name}</h2>
            <p style={{ color:C.goldL, fontSize:14, marginBottom:16 }}>{selectedTalent} • الصف {form.grade}</p>
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 20px', marginBottom:12 }}>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, marginBottom:4 }}>هدفي من الموهبة</p>
              <p style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{form.goal || 'تطوير المهارات'}</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 20px' }}>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, marginBottom:4 }}>حلمي</p>
              <p style={{ color:C.goldL, fontSize:13, fontWeight:600 }}>"{form.dream || 'أن أكون الأفضل'}"</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
            <div style={{ background:C.card, borderRadius:14, padding:16, border:`1px solid ${C.border}`, textAlign:'center' }}>
              <p style={{ color:C.gold, fontWeight:900, fontSize:24 }}>0</p>
              <p style={{ color:C.sub, fontSize:12 }}>نقاط المواهب</p>
            </div>
            <div style={{ background:C.card, borderRadius:14, padding:16, border:`1px solid ${C.border}`, textAlign:'center' }}>
              <p style={{ color:C.green, fontWeight:900, fontSize:24 }}>مبتدئ</p>
              <p style={{ color:C.sub, fontSize:12 }}>المستوى الحالي</p>
            </div>
          </div>
          <button onClick={()=>setStep('survey')} style={{ padding:'9px 20px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            تعديل البيانات
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>حاضنة المواهب 💡</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>اكتشف موهبتك، طوّرها، وانضم لمجتمع المبدعين</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 }}>

          {/* Survey Form */}
          <div style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <h3 style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:18 }}>سجّل موهبتك ✨</h3>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الاسم الكامل</label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="اسمك الكامل" style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>الصف الدراسي</label>
                <select value={form.grade} onChange={e=>setForm(p=>({...p,grade:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', background:'#fff' }}>
                  <option value="">اختر صفك</option>
                  {['السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>العمر</label>
                <input type="number" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} placeholder="عمرك" style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>هدفك من الموهبة</label>
                <input value={form.goal} onChange={e=>setForm(p=>({...p,goal:e.target.value}))} placeholder="ماذا تريد أن تحقق؟" style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>حلمك المستقبلي</label>
                <textarea value={form.dream} onChange={e=>setForm(p=>({...p,dream:e.target.value}))} placeholder="ما هو حلمك؟" rows={2} style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', resize:'none', boxSizing:'border-box' }} />
              </div>
            </div>

            <div style={{ marginTop:16 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:10 }}>اختر موهبتك</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))', gap:8 }}>
                {TALENT_CATEGORIES.map((t,i) => (
                  <div key={i} onClick={() => setSelectedTalent(t.label)}
                    style={{ padding:'10px 6px', borderRadius:10, border:`1px solid ${selectedTalent===t.label ? C.gold : C.border}`, background: selectedTalent===t.label ? C.goldBg : '#fff', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{t.emoji}</div>
                    <p style={{ color: selectedTalent===t.label ? C.gold : C.text, fontSize:10, fontWeight:700, lineHeight:1.3 }}>{t.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} style={{ width:'100%', marginTop:18, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:800, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              أنشئ بروفايلي 🚀
            </button>
          </div>

          {/* Leaderboard + Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:C.card, borderRadius:18, padding:20, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <h3 style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:14 }}>أبرز المواهب 🏆</h3>
              {PROFILES.map((p,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<PROFILES.length-1 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ fontSize:20 }}>{p.badge}</span>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{p.emoji}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{p.name}</p>
                    <p style={{ color:C.sub, fontSize:11 }}>{p.talent} • {p.level}</p>
                  </div>
                  <span style={{ color:C.gold, fontWeight:800, fontSize:13 }}>{p.pts} نقطة</span>
                </div>
              ))}
            </div>

            <div style={{ background:`linear-gradient(135deg,${C.navy},#162144)`, borderRadius:18, padding:20, border:`1px solid ${C.goldBdr}` }}>
              <h3 style={{ color:'#fff', fontWeight:800, fontSize:15, marginBottom:10 }}>لماذا حاضنة المواهب؟ 🌟</h3>
              {['اكتشف موهبتك الحقيقية وطوّرها','تنافس مع أقرانك في مسابقات المواهب','احصل على شارات وجوائز خاصة','انضم لمجتمع المبدعين في المنصة'].map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:C.goldL, flexShrink:0 }} />
                  <p style={{ color:'rgba(255,255,255,0.8)', fontSize:12 }}>{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
