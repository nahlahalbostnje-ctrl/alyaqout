import { useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppSelector } from '../app/hooks';

const C = {
  gold:'#C59341', goldL:'#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{
      width:44, height:24, borderRadius:12, cursor:'pointer', flexShrink:0,
      background: on ? C.gold : '#D1D5DB', position:'relative', transition:'background 0.2s',
    }}>
      <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, right: on ? 22 : 4, transition:'right 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

function Input({ label, value, onChange, type='text', placeholder='' }: { label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:'block', color:C.sub, fontSize:11.5, fontWeight:700, marginBottom:5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:'100%', padding:'10px 14px', borderRadius:12, outline:'none',
          border:`1.5px solid ${focused ? C.gold : C.border}`, background:'#fff',
          color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif",
          boxSizing:'border-box', transition:'border-color 0.2s',
        }} />
    </div>
  );
}

function SectionCard({ title, icon, children }: { title:string; icon:string; children:React.ReactNode }) {
  return (
    <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:16, overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>{title}</span>
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

export default function ParentSettingsPage() {
  const user = useAppSelector(s => s.auth.user);
  const initials = user?.name ? user.name.split(' ').slice(0,2).map((w:string) => w[0]).join('') : 'و';

  const [profile, setProfile] = useState({
    name: user?.name ?? 'ولي الأمر', phone: '0512345678',
    email: 'parent@example.com', whatsapp: '0512345678',
    city: 'الرياض', lang: 'ar',
  });
  const [password, setPassword] = useState({ current:'', newPass:'', confirm:'' });
  const [notifs, setNotifs] = useState({
    homeworkReminder:true, examAlert:true, attendanceAlert:true,
    invoiceAlert:true, weeklyReport:true, promotions:false,
    whatsappNotif:true, emailNotif:true, smsNotif:false,
  });
  const [parental, setParental] = useState([
    { label:'تحديد وقت استخدام المنصة', enabled:true,  detail:'السماح فقط من 3 م إلى 9 م' },
    { label:'تفعيل وضع التركيز',         enabled:false, detail:'إخفاء المحتوى الترفيهي' },
    { label:'منع الرسائل بين الطلاب',    enabled:true,  detail:'التواصل مع المعلمين فقط' },
  ]);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passSaved, setPassSaved]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const saveProfile = () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500); };
  const savePass    = () => { setPassSaved(true); setPassword({ current:'', newPass:'', confirm:'' }); setTimeout(() => setPassSaved(false), 2500); };

  const passStrength = (): { label:string; color:string; width:string } => {
    const p = password.newPass;
    if (!p) return { label:'', color:'#E5E7EB', width:'0%' };
    if (p.length < 6) return { label:'ضعيفة', color:C.red, width:'25%' };
    if (p.length < 10) return { label:'متوسطة', color:'#F59E0B', width:'55%' };
    return { label:'قوية', color:C.green, width:'100%' };
  };
  const ps = passStrength();

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", maxWidth:760, minHeight:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>الإعدادات ⚙️</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>إدارة حسابك وتفضيلاتك الشخصية</p>
        </div>

        {/* Profile */}
        <SectionCard title="الملف الشخصي" icon="👤">
          {profileSaved && <div style={{ background:C.greenBg, border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:C.green, fontSize:13, fontWeight:700 }}>✅ تم حفظ التغييرات بنجاح</div>}

          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, padding:'0 0 20px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:28, boxShadow:'0 4px 16px rgba(197,147,65,0.4)' }}>
              {initials}
            </div>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:4 }}>أ. {profile.name}</p>
              <button onClick={()=>alert('رفع صورة شخصية جديدة قيد التطوير.')} style={{ padding:'6px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.sub, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تغيير الصورة</button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:20 }}>
            <Input label="الاسم الكامل" value={profile.name} onChange={v => setProfile(p => ({...p, name:v}))} />
            <Input label="رقم الهاتف" value={profile.phone} onChange={v => setProfile(p => ({...p, phone:v}))} />
            <Input label="البريد الإلكتروني" type="email" value={profile.email} onChange={v => setProfile(p => ({...p, email:v}))} />
            <Input label="رقم الواتساب" value={profile.whatsapp} onChange={v => setProfile(p => ({...p, whatsapp:v}))} />
            <Input label="المدينة" value={profile.city} onChange={v => setProfile(p => ({...p, city:v}))} />
            <div>
              <label style={{ display:'block', color:C.sub, fontSize:11.5, fontWeight:700, marginBottom:5 }}>اللغة المفضلة</label>
              <select value={profile.lang} onChange={e => setProfile(p => ({...p, lang:e.target.value}))} style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:'#fff', color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }}>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <button onClick={saveProfile} style={{ padding:'11px 28px', borderRadius:12, background:C.goldGrad, border:'none', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 14px rgba(197,147,65,0.35)', fontFamily:"'Cairo',sans-serif" }}>
            حفظ التغييرات
          </button>
        </SectionCard>

        {/* Password */}
        <SectionCard title="تغيير كلمة المرور" icon="🔐">
          {passSaved && <div style={{ background:C.greenBg, border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:C.green, fontSize:13, fontWeight:700 }}>✅ تم تحديث كلمة المرور بنجاح</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:16 }}>
            <Input label="كلمة المرور الحالية" type="password" value={password.current} onChange={v => setPassword(p => ({...p, current:v}))} />
            <div>
              <Input label="كلمة المرور الجديدة" type="password" value={password.newPass} onChange={v => setPassword(p => ({...p, newPass:v}))} />
              {password.newPass && (
                <div style={{ marginTop:6 }}>
                  <div style={{ height:4, borderRadius:2, background:'#E5E7EB', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:ps.width, background:ps.color, transition:'width 0.3s, background 0.3s', borderRadius:2 }} />
                  </div>
                  <p style={{ color:ps.color, fontSize:11, marginTop:3, fontWeight:600 }}>{ps.label}</p>
                </div>
              )}
            </div>
            <Input label="تأكيد كلمة المرور" type="password" value={password.confirm} onChange={v => setPassword(p => ({...p, confirm:v}))}
              placeholder={password.newPass && password.confirm && password.newPass !== password.confirm ? '⚠️ كلمتا المرور غير متطابقتان' : ''} />
          </div>
          <button onClick={savePass} disabled={!password.current || !password.newPass || password.newPass !== password.confirm} style={{
            padding:'11px 28px', borderRadius:12, border:`1.5px solid ${C.gold}`,
            background:'transparent', color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer',
            opacity: (!password.current || !password.newPass || password.newPass !== password.confirm) ? 0.5 : 1,
            fontFamily:"'Cairo',sans-serif",
          }}>تحديث كلمة المرور</button>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="إعدادات الإشعارات" icon="🔔">
          <p style={{ color:C.sub, fontSize:11.5, fontWeight:700, marginBottom:12 }}>إشعارات التعلم</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
            {([
              { key:'homeworkReminder', label:'تذكير بالواجبات المنزلية' },
              { key:'examAlert',        label:'تنبيهات مواعيد الاختبارات' },
              { key:'attendanceAlert',  label:'تنبيهات الحضور والغياب' },
              { key:'invoiceAlert',     label:'تنبيهات الفواتير والمدفوعات' },
              { key:'weeklyReport',     label:'التقرير الأسبوعي للأداء' },
              { key:'promotions',       label:'العروض والتخفيضات' },
            ] as { key: keyof typeof notifs; label: string }[]).map(({ key, label }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color:C.text, fontSize:13 }}>{label}</span>
                <Toggle on={notifs[key]} onChange={() => setNotifs(n => ({...n, [key]:!n[key]}))} />
              </div>
            ))}
          </div>
          <p style={{ color:C.sub, fontSize:11.5, fontWeight:700, marginBottom:12, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>قنوات التواصل</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {([
              { key:'whatsappNotif', label:'إشعارات الواتساب 📱' },
              { key:'emailNotif',    label:'إشعارات البريد الإلكتروني 📧' },
              { key:'smsNotif',      label:'رسائل SMS 💬' },
            ] as { key: keyof typeof notifs; label: string }[]).map(({ key, label }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color:C.text, fontSize:13 }}>{label}</span>
                <Toggle on={notifs[key]} onChange={() => setNotifs(n => ({...n, [key]:!n[key]}))} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Parental controls */}
        <SectionCard title="الرقابة الأبوية" icon="🛡️">
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
            {parental.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}` }}>
                <div>
                  <p style={{ color:C.text, fontSize:13, fontWeight:600, marginBottom:2 }}>{item.label}</p>
                  <p style={{ color:C.dim, fontSize:11 }}>{item.detail}</p>
                </div>
                <Toggle on={item.enabled} onChange={() => setParental(p => p.map((x,j) => j===i ? {...x, enabled:!x.enabled} : x))} />
              </div>
            ))}
          </div>
          <button onClick={()=>alert('تم حفظ إعدادات الرقابة الأبوية محلياً — الحفظ الدائم على الخادم قيد التطوير.')} style={{ padding:'11px 24px', borderRadius:12, background:C.goldGrad, border:'none', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            حفظ إعدادات الرقابة
          </button>
        </SectionCard>

        {/* Delete account */}
        <SectionCard title="حذف الحساب" icon="⚠️">
          <div style={{ background:C.redBg, border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
            <p style={{ color:C.red, fontSize:13, fontWeight:700, marginBottom:6 }}>تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
            <p style={{ color:C.text, fontSize:12.5, lineHeight:1.7 }}>سيؤدي حذف حسابك إلى فقدان جميع بياناتك وبيانات أبنائك المرتبطين بالمنصة، بما في ذلك التقارير والنتائج والإنجازات. يرجى التأكد من هذا القرار قبل المتابعة.</p>
          </div>
          <button onClick={() => setShowDeleteModal(true)} style={{ padding:'11px 24px', borderRadius:12, border:`1.5px solid ${C.red}`, background:'transparent', color:C.red, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            طلب حذف الحساب
          </button>
        </SectionCard>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowDeleteModal(false)}>
            <div style={{ background:'#fff', borderRadius:20, padding:28, width:420, maxWidth:'95vw' }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
                <h2 style={{ color:C.red, fontWeight:900, fontSize:18, marginBottom:8 }}>تأكيد حذف الحساب</h2>
                <p style={{ color:C.sub, fontSize:13, lineHeight:1.7 }}>هل أنت متأكد من رغبتك في حذف حسابك؟ سيتم إرسال طلب الحذف إلى إدارة المنصة.</p>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ flex:1, padding:'11px', borderRadius:12, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>إلغاء</button>
                <button onClick={() => { setShowDeleteModal(false); alert('إرسال طلب حذف الحساب لإدارة المنصة قيد التطوير — يرجى التواصل مع الدعم الفني حالياً.'); }} style={{ flex:1, padding:'11px', borderRadius:12, border:'none', background:C.red, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تأكيد الحذف</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ParentLayout>
  );
}
