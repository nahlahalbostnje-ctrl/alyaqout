import { useState } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';
import { useAppSelector } from '../app/hooks';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
};

function Toggle({ on, onChange }: { on:boolean; onChange:()=>void }) {
  return (
    <div onClick={onChange} style={{ width:44,height:24,borderRadius:12,cursor:'pointer',flexShrink:0, background:on?C.gold:'#D1D5DB',position:'relative',transition:'background 0.2s' }}>
      <div style={{ width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3, right:on?22:4,transition:'right 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title:string; icon:string; children:React.ReactNode }) {
  return (
    <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>{title}</span>
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const HOURS = Array.from({length:12},(_,i)=>`${i+8}:00 ${i+8<12?'ص':'م'}`);

export default function SupervisorSettingsPage() {
  const user = useAppSelector(s=>s.auth.user);
  const initials = user?.name?.split(' ').slice(0,2).map((w:string)=>w[0]).join('') ?? 'م';

  const [profile, setProfile] = useState({ name:user?.name??'ليلى المشرفة', phone:'0512345678', email:'supervisor@yaqoot.com', bio:'مشرفة أكاديمية متخصصة في تطوير مهارات الطلاب' });
  const [savedProfile, setSavedProfile] = useState(false);

  const [availability, setAvailability] = useState<Record<string,boolean>>({ 'الأحد':true,'الاثنين':true,'الثلاثاء':false,'الأربعاء':true,'الخميس':true });
  const [fromHour, setFromHour]         = useState('9:00 ص');
  const [toHour, setToHour]             = useState('3:00 م');
  const [savedAvail, setSavedAvail]     = useState(false);

  const [notifs, setNotifs] = useState({
    newAssignment:true, newEssay:true, sessionRequest:true,
    studentAlert:true, newMessage:true, weeklyReport:false,
  });
  const [savedNotifs, setSavedNotifs] = useState(false);

  const save = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true); setTimeout(()=>setter(false),2500);
  };

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", maxWidth:720, minHeight:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>الإعدادات ⚙️</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>إدارة بيانات حسابك وجداول التواجد وإشعارات النظام</p>
        </div>

        {/* Profile */}
        <SectionCard title="بيانات الحساب" icon="👤">
          {savedProfile && <div style={{ background:C.greenBg, border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:C.green, fontSize:13, fontWeight:700 }}>✅ تم حفظ التغييرات بنجاح</div>}

          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:26, boxShadow:'0 4px 16px rgba(197,147,65,0.4)' }}>{initials}</div>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:3 }}>{profile.name}</p>
              <p style={{ color:C.gold, fontSize:12, fontWeight:600 }}>مشرف أكاديمي</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:14 }}>
            {[
              { label:'الاسم الكامل', key:'name' as const },
              { label:'رقم الهاتف',   key:'phone' as const },
              { label:'البريد الإلكتروني', key:'email' as const },
            ].map(f => {
              const [focused, setFocused] = useState(false);
              return (
                <div key={f.key} style={f.key==='email'?{gridColumn:'1/-1'}:{}}>
                  <label style={{ display:'block', color:C.sub, fontSize:11.5, fontWeight:700, marginBottom:5 }}>{f.label}</label>
                  <input value={profile[f.key]} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))}
                    onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                    style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${focused?C.gold:C.border}`, background:'#fff', color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif", boxSizing:'border-box', outline:'none', transition:'border-color 0.2s' }}/>
                </div>
              );
            })}
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', color:C.sub, fontSize:11.5, fontWeight:700, marginBottom:5 }}>نبذة مختصرة</label>
            <textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} rows={2}
              style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:'#fff', color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif", boxSizing:'border-box', outline:'none', resize:'none' }}/>
          </div>
          <button onClick={()=>save(setSavedProfile)} style={{ padding:'11px 28px', borderRadius:12, background:C.goldGrad, border:'none', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 14px rgba(197,147,65,0.35)', fontFamily:"'Cairo',sans-serif" }}>
            حفظ البيانات
          </button>
        </SectionCard>

        {/* Availability */}
        <SectionCard title="أوقات التواجد لاستقبال طلبات الإرشاد" icon="📅">
          {savedAvail && <div style={{ background:C.greenBg, border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:C.green, fontSize:13, fontWeight:700 }}>✅ تم حفظ جدول التواجد</div>}

          <p style={{ color:C.sub, fontSize:12, fontWeight:600, marginBottom:10 }}>أيام التواجد</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
            {DAYS.map(d => (
              <button key={d} onClick={()=>setAvailability(a=>({...a,[d]:!a[d]}))} style={{
                padding:'7px 16px', borderRadius:10, border:`1.5px solid ${availability[d]?C.gold:C.border}`,
                background:availability[d]?C.goldBg:'transparent', color:availability[d]?C.gold:C.sub,
                fontWeight:700, fontSize:12.5, cursor:'pointer', fontFamily:"'Cairo',sans-serif", transition:'all 0.15s',
              }}>{d}</button>
            ))}
          </div>

          <p style={{ color:C.sub, fontSize:12, fontWeight:600, marginBottom:10 }}>ساعات الاستقبال</p>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
            <div>
              <label style={{ display:'block', color:C.sub, fontSize:11, marginBottom:4 }}>من</label>
              <select value={fromHour} onChange={e=>setFromHour(e.target.value)} style={{ padding:'8px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:'#fff', color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }}>
                {HOURS.map(h=><option key={h}>{h}</option>)}
              </select>
            </div>
            <span style={{ color:C.dim, fontSize:16, marginTop:16 }}>←</span>
            <div>
              <label style={{ display:'block', color:C.sub, fontSize:11, marginBottom:4 }}>إلى</label>
              <select value={toHour} onChange={e=>setToHour(e.target.value)} style={{ padding:'8px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:'#fff', color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }}>
                {HOURS.map(h=><option key={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <button onClick={()=>save(setSavedAvail)} style={{ padding:'11px 28px', borderRadius:12, background:C.goldGrad, border:'none', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            حفظ الجدول
          </button>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="إشعارات النظام" icon="🔔">
          {savedNotifs && <div style={{ background:C.greenBg, border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:C.green, fontSize:13, fontWeight:700 }}>✅ تم حفظ إعدادات الإشعارات</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:18 }}>
            {([
              { key:'newAssignment', label:'واجب جديد يحتاج مراجعة' },
              { key:'newEssay',      label:'سؤال مقالي ينتظر التصحيح' },
              { key:'sessionRequest',label:'طلب حجز جلسة إرشاد' },
              { key:'studentAlert',  label:'تنبيه طالب متعثر' },
              { key:'newMessage',    label:'رسالة جديدة في مركز التواصل' },
              { key:'weeklyReport',  label:'التقرير الأسبوعي الموجز' },
            ] as { key: keyof typeof notifs; label:string }[]).map(({ key, label }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color:C.text, fontSize:13 }}>{label}</span>
                <Toggle on={notifs[key]} onChange={()=>setNotifs(n=>({...n,[key]:!n[key]}))}/>
              </div>
            ))}
          </div>
          <button onClick={()=>save(setSavedNotifs)} style={{ padding:'11px 28px', borderRadius:12, border:`1.5px solid ${C.gold}`, background:'transparent', color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            حفظ الإشعارات
          </button>
        </SectionCard>

      </div>
    </SupervisorLayout>
  );
}
