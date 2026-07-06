import { useState } from 'react';
import StudentLayout from '../components/StudentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  purple:'#8B5CF6',
};

const PAST_CAPSULES = [
  { month:'مايو 2026', goal:'أن أحصل على 90% في الرياضيات', reminder:'2026-05-31', done:true, note:'حققت 92%! فخور بنفسي' },
  { month:'أبريل 2026', goal:'إنهاء قراءة كتاب في الأسبوع', reminder:'2026-04-30', done:true, note:'أنهيت كتابين 🎉' },
  { month:'مارس 2026', goal:'تحسين مهارات الكتابة', reminder:'2026-03-31', done:false, note:'' },
];

const TIPS = [
  'اكتب هدفاً واقعياً وقابلاً للقياس',
  'حدد خطوات صغيرة لتحقيق هدفك',
  'راجع هدفك كل أسبوع وتتبع تقدمك',
  'شارك هدفك مع شخص يحفزك',
];

export default function StudentTimeCapsulePage() {
  const [goal, setGoal] = useState('');
  const [message, setMessage] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [capsules, setCapsules] = useState(PAST_CAPSULES);

  const currentMonth = new Date().toLocaleDateString('ar-EG', { month:'long', year:'numeric' });

  const handleSubmit = () => {
    if (!goal.trim()) return;
    setCapsules(p => [{ month: currentMonth, goal, reminder: reminderDate, done:false, note:'' }, ...p]);
    setGoal('');
    setMessage('');
    setReminderDate('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>الكبسولة الزمنية 🎯</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>اكتب رسالة/هدفاً لنفسك في بداية كل شهر، سنذكّرك بها قبل نهايته</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>

          {/* New Capsule Form */}
          <div>
            <div style={{ background:`linear-gradient(135deg,${C.navy},#162144)`, borderRadius:20, padding:24, marginBottom:16, border:`1px solid ${C.goldBdr}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:28 }}>📬</span>
                <div>
                  <h3 style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>كبسولة {currentMonth}</h3>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, margin:0 }}>رسالة لنفسك في نهاية الشهر</p>
                </div>
              </div>

              {submitted ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:15 }}>تم حفظ كبسولتك!</p>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>سنذكّرك بها في نهاية الشهر</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>هدفي هذا الشهر *</label>
                    <textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={3} placeholder="اكتب هدفك بوضوح... (مثال: أحصل على 85% في الرياضيات)" style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', resize:'none', boxSizing:'border-box' }} />
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>رسالة لنفسي</label>
                    <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2} placeholder="اكتب رسالة لنفسك ستقرأها في نهاية الشهر..." style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', resize:'none', boxSizing:'border-box' }} />
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, display:'block', marginBottom:6 }}>تاريخ التذكير</label>
                    <input type="date" value={reminderDate} onChange={e=>setReminderDate(e.target.value)} style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box', colorScheme:'dark' }} />
                  </div>
                  <button onClick={handleSubmit} style={{ width:'100%', padding:'11px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:800, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    أغلق الكبسولة الزمنية 🔐
                  </button>
                </>
              )}
            </div>

            {/* Tips */}
            <div style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <h4 style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:12 }}>نصائح لتحقيق أهدافك 💡</h4>
              {TIPS.map((t,i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:800, flexShrink:0, marginTop:1 }}>{i+1}</div>
                  <p style={{ color:C.sub, fontSize:12, lineHeight:1.6 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Past Capsules */}
          <div>
            <h3 style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:14 }}>كبسولاتي السابقة 📦</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {capsules.map((cap,i) => (
                <div key={i} style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${cap.done ? 'rgba(16,185,129,0.3)' : C.border}`, boxShadow:C.shadow, position:'relative', overflow:'hidden' }}>
                  {cap.done && <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderStyle:'solid', borderWidth:'0 30px 30px 0', borderColor:`transparent ${C.green} transparent transparent` }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:20 }}>{cap.done ? '✅' : '⏳'}</span>
                      <p style={{ color:C.gold, fontWeight:700, fontSize:13 }}>{cap.month}</p>
                    </div>
                    <span style={{ padding:'3px 8px', borderRadius:6, background: cap.done ? C.greenBg : C.goldBg, color: cap.done ? C.green : C.gold, fontSize:10, fontWeight:700 }}>
                      {cap.done ? 'مكتمل' : 'قيد التنفيذ'}
                    </span>
                  </div>
                  <p style={{ color:C.text, fontSize:13, fontWeight:600, marginBottom:6, lineHeight:1.6 }}>{cap.goal}</p>
                  {cap.note && (
                    <div style={{ background:C.greenBg, borderRadius:8, padding:'8px 12px', marginTop:8 }}>
                      <p style={{ color:C.green, fontSize:12 }}>ملاحظتي: {cap.note}</p>
                    </div>
                  )}
                  <p style={{ color:C.dim, fontSize:10, marginTop:8 }}>تذكير: {cap.reminder}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
