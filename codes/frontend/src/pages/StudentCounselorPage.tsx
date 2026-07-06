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
  purple:'#8B5CF6', purpleBg:'rgba(139,92,246,0.08)',
};

const COUNSELORS = [
  { name:'د. سارة الأمين', specialty:'التوجيه الأكاديمي', rating:4.9, sessions:340, available:true, emoji:'👩‍🏫', times:['10:00', '11:00', '14:00', '15:00'] },
  { name:'أ. خالد العمر', specialty:'الصحة النفسية', rating:4.8, sessions:215, available:true, emoji:'👨‍⚕️', times:['09:00', '13:00', '16:00'] },
  { name:'د. منى السالم', specialty:'تطوير المهارات', rating:4.7, sessions:178, available:false, emoji:'👩‍💼', times:['11:00', '15:00', '17:00'] },
];

const TOPICS = ['ضغط الدراسة', 'التنمر', 'صعوبة في مادة', 'علاقات اجتماعية', 'قلق الامتحانات', 'تنظيم الوقت', 'أهداف مستقبلية', 'أخرى'];

const QUICK_RESPONSES: Record<string, string> = {
  'ضغط الدراسة': 'ضغط الدراسة شعور طبيعي! جرب تقسيم المواد لأجزاء صغيرة وخذ استراحات منتظمة. هل تريد أن أقترح لك جدولاً مناسباً؟',
  'قلق الامتحانات': 'القلق من الامتحانات طبيعي ويمكن تجاوزه. أهم شيء هو التحضير المبكر والنوم الكافي. هل تريد تقنيات للاسترخاء قبل الامتحان؟',
  'تنظيم الوقت': 'تنظيم الوقت مهارة تُكتسب بالتدريب. أنصحك باستخدام مبدأ Pomodoro — 25 دقيقة دراسة ثم 5 دقائق استراحة. هل تريد المزيد؟',
};

type View = 'list' | 'book' | 'chat';

export default function StudentCounselorPage() {
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<typeof COUNSELORS[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [problem, setProblem] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState<{ from:'user'|'bot'; text:string }[]>([
    { from:'bot', text:'أهلاً! أنا مساعدك الشخصي. أخبرني بما تشعر به وسأساعدك 💙' }
  ]);
  const [booked, setBooked] = useState(false);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg;
    setChatMsg('');
    setMessages(p => [...p, { from:'user', text:userMsg }]);
    const reply = QUICK_RESPONSES[selectedTopic] ?? 'شكراً لمشاركتي. يبدو أن هذه مشكلة تستحق الاهتمام. أنصحك بحجز موعد مع أحد مرشدينا للحصول على دعم متخصص. هل تريد أن أساعدك في ذلك؟';
    setTimeout(() => setMessages(p => [...p, { from:'bot', text:reply }]), 800);
  };

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>مرشد الياقوت الطلابي 💬</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>احجز موعد مع مرشدك أو تحدث مع مساعدنا الذكي فوراً</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {([['list','احجز موعد'],['chat','تحدث الآن']] as [View,string][]).map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'8px 20px', borderRadius:10, border:`1px solid ${view===v ? C.gold : C.border}`, background: view===v ? C.goldBg : C.card, color: view===v ? C.gold : C.sub, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              {l}
            </button>
          ))}
        </div>

        {view === 'list' && !booked && (
          <div>
            {/* Counselor Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:20 }}>
              {COUNSELORS.map((c,i) => (
                <div key={i} onClick={() => { if(c.available) { setSelected(c); setView('book' as View); } }}
                  style={{ background:C.card, borderRadius:18, padding:20, border:`2px solid ${selected?.name===c.name ? C.gold : C.border}`, boxShadow:C.shadow, cursor: c.available ? 'pointer' : 'default', opacity: c.available ? 1 : 0.6, transition:'all 0.15s' }}>
                  <div style={{ textAlign:'center', marginBottom:12 }}>
                    <div style={{ fontSize:42, marginBottom:6 }}>{c.emoji}</div>
                    <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:2 }}>{c.name}</p>
                    <p style={{ color:C.sub, fontSize:12 }}>{c.specialty}</p>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-around', marginBottom:12 }}>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ color:C.gold, fontWeight:800 }}>⭐ {c.rating}</p>
                      <p style={{ color:C.dim, fontSize:10 }}>التقييم</p>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ color:C.text, fontWeight:800 }}>{c.sessions}</p>
                      <p style={{ color:C.dim, fontSize:10 }}>جلسة</p>
                    </div>
                  </div>
                  <div style={{ padding:'6px 12px', borderRadius:8, background: c.available ? C.greenBg : 'rgba(107,114,128,0.1)', textAlign:'center' }}>
                    <span style={{ color: c.available ? C.green : C.dim, fontSize:12, fontWeight:700 }}>
                      {c.available ? '● متاح الآن' : '● غير متاح'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(view as string) === 'book' && selected && !booked && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 }}>
            <div style={{ background:C.card, borderRadius:18, padding:24, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <button onClick={() => setView('list')} style={{ display:'flex', alignItems:'center', gap:6, color:C.sub, fontSize:12, background:'none', border:'none', cursor:'pointer', marginBottom:16, fontFamily:"'Cairo',sans-serif" }}>
                ← رجوع
              </button>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:50 }}>{selected.emoji}</div>
                <h3 style={{ color:C.text, fontWeight:800, fontSize:18 }}>{selected.name}</h3>
                <p style={{ color:C.sub }}>{selected.specialty}</p>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:8 }}>اختر موضوع الجلسة</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {TOPICS.map((t,i) => (
                    <button key={i} onClick={() => setSelectedTopic(t)} style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${selectedTopic===t ? C.gold : C.border}`, background: selectedTopic===t ? C.goldBg : '#fff', color: selectedTopic===t ? C.gold : C.sub, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:8 }}>اختر الوقت المناسب</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))', gap:6 }}>
                  {selected.times.map((t,i) => (
                    <button key={i} onClick={() => setSelectedTime(t)} style={{ padding:'8px', borderRadius:9, border:`1px solid ${selectedTime===t ? C.gold : C.border}`, background: selectedTime===t ? C.goldBg : '#fff', color: selectedTime===t ? C.gold : C.text, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:8 }}>صف مشكلتك باختصار (اختياري)</label>
                <textarea value={problem} onChange={e=>setProblem(e.target.value)} rows={3} placeholder="ما الذي تريد التحدث عنه؟" style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', resize:'none', boxSizing:'border-box' }} />
              </div>
              <button onClick={() => { if(selectedTime && selectedTopic) setBooked(true); }} style={{ width:'100%', padding:'11px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:800, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", opacity: selectedTime && selectedTopic ? 1 : 0.5 }}>
                تأكيد الحجز
              </button>
            </div>
            <div style={{ background:`linear-gradient(135deg,${C.navy},#162144)`, borderRadius:18, padding:24, border:`1px solid ${C.goldBdr}` }}>
              <h4 style={{ color:'#fff', fontWeight:800, fontSize:15, marginBottom:16 }}>معلومات الجلسة</h4>
              {[['المرشد', selected.name], ['التخصص', selected.specialty], ['التقييم', `⭐ ${selected.rating}`], ['الجلسات المكتملة', `${selected.sessions} جلسة`]].map(([k,v],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: i<3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{k}</span>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {booked && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
            <h2 style={{ color:C.text, fontWeight:900, fontSize:22, marginBottom:8 }}>تم حجز موعدك!</h2>
            <p style={{ color:C.sub, fontSize:14, marginBottom:4 }}>مع {selected?.name} — {selectedTopic}</p>
            <p style={{ color:C.gold, fontWeight:700, fontSize:16, marginBottom:20 }}>الساعة {selectedTime} اليوم</p>
            <button onClick={() => { setBooked(false); setView('list'); setSelectedTime(''); setSelectedTopic(''); }} style={{ padding:'10px 24px', borderRadius:12, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              العودة للقائمة
            </button>
          </div>
        )}

        {view === 'chat' && (
          <div style={{ background:C.card, borderRadius:18, border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', flexDirection:'column', height:500 }}>
            <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
              <div>
                <p style={{ color:C.text, fontWeight:700, fontSize:14 }}>مرشد الياقوت الذكي</p>
                <p style={{ color:C.green, fontSize:11 }}>● متاح الآن</p>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.from==='user' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius: m.from==='user' ? '18px 18px 18px 4px' : '18px 18px 4px 18px', background: m.from==='user' ? '#F3F4F6' : C.goldGrad, color: m.from==='user' ? C.text : '#fff', fontSize:13, lineHeight:1.7 }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:14, borderTop:`1px solid ${C.border}`, display:'flex', gap:8 }}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') sendChat(); }} placeholder="اكتب رسالتك..." style={{ flex:1, padding:'9px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }} />
              <button onClick={sendChat} style={{ padding:'9px 18px', borderRadius:10, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>إرسال</button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
