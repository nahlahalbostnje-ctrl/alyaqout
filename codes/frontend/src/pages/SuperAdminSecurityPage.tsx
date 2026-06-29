import { useState, useEffect } from 'react';
import AppLayout, { Icons } from '../components/AppLayout';
import { useAppSelector } from '../app/hooks';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
};

const navItems = [
  { to:'/dashboard',                label:'الرئيسية',         icon:Icons.home,         end:true },
  { to:'/dashboard/analytics',      label:'التحليلات',        icon:Icons.chart              },
  { to:'/dashboard/settings',       label:'الإعدادات',        icon:Icons.settings          },
  { to:'/super-admin/security',     label:'مركز الأمان',      icon:Icons.shield            },
];

interface LoginAttempt {
  id: number; phone: string; ip_address: string | null;
  device_info: string | null; success: boolean; created_at: string;
  user?: { name: string; role: string } | null;
}

const MOCK_ATTEMPTS: LoginAttempt[] = [
  { id:1, phone:'00962200000000', ip_address:'192.168.1.1', device_info:'Chrome/Windows', success:true, created_at:'2026-06-30T09:00:00Z', user:{ name:'الأدمن الرئيسي', role:'admin' } },
  { id:2, phone:'00962999999999', ip_address:'10.0.0.5', device_info:'Firefox/Linux', success:false, created_at:'2026-06-30T09:05:00Z', user:null },
  { id:3, phone:'00962300000000', ip_address:'192.168.1.2', device_info:'Safari/iOS', success:true, created_at:'2026-06-30T09:30:00Z', user:{ name:'المعلم أحمد', role:'teacher' } },
  { id:4, phone:'00962111111111', ip_address:'10.0.0.99', device_info:'Chrome/Android', success:false, created_at:'2026-06-30T10:00:00Z', user:null },
  { id:5, phone:'00962400000000', ip_address:'192.168.1.3', device_info:'Chrome/Windows', success:true, created_at:'2026-06-30T10:15:00Z', user:{ name:'الطالب محمد', role:'student' } },
  { id:6, phone:'00962777777777', ip_address:'185.220.101.5', device_info:'Python-requests', success:false, created_at:'2026-06-30T10:20:00Z', user:null },
];

export default function SuperAdminSecurityPage() {
  const token = useAppSelector(s => s.auth.token) ?? '';
  const [attempts, setAttempts] = useState<LoginAttempt[]>(MOCK_ATTEMPTS);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const param = filter !== 'all' ? `?success=${filter === 'success' ? 1 : 0}` : '';
    fetch(`http://localhost:8000/api/super-admin/security/login-attempts${param}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => { if (j.data?.data) setAttempts(j.data.data); })
      .catch(() => {});
  }, [token, filter]);

  const filtered = attempts.filter(a =>
    (filter === 'all' || (filter === 'success' ? a.success : !a.success)) &&
    (!search || a.phone.includes(search) || (a.ip_address ?? '').includes(search))
  );

  const total   = attempts.length;
  const success = attempts.filter(a => a.success).length;
  const failed  = attempts.filter(a => !a.success).length;
  const today   = attempts.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <AppLayout navItems={navItems} roleLabel="السوبر أدمن">
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Header */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>مركز الأمان 🔐</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>مراقبة محاولات تسجيل الدخول والنشاط المشبوه</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'إجمالي المحاولات', value:total, icon:'🔑', color:C.gold },
            { label:'ناجحة', value:success, icon:'✅', color:C.green },
            { label:'فاشلة', value:failed, icon:'❌', color:C.red },
            { label:'اليوم', value:today, icon:'📅', color:'#3B82F6' },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'12px 16px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:22, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11, marginTop:1 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6 }}>
            {(['all','success','failed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:'7px 14px', borderRadius:9, border:`1px solid ${filter===f ? C.gold : C.border}`, background: filter===f ? C.goldBg : C.card, color: filter===f ? C.gold : C.sub, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                {f === 'all' ? 'الكل' : f === 'success' ? '✅ ناجحة' : '❌ فاشلة'}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ابحث برقم الهاتف أو IP..."
            style={{ flex:1, padding:'8px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', minWidth:200 }}
          />
        </div>

        {/* Table */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 120px 1fr 130px 90px', padding:'11px 20px', background:C.goldBg, borderBottom:`1px solid ${C.border}` }}>
            {['الحالة','رقم الهاتف','IP','المستخدم','الجهاز','الوقت'].map((h,i) => (
              <span key={i} style={{ color:C.gold, fontSize:11, fontWeight:800 }}>{h}</span>
            ))}
          </div>

          {filtered.map((attempt, idx) => (
            <div key={attempt.id} style={{ display:'grid', gridTemplateColumns:'80px 1fr 120px 1fr 130px 90px', padding:'12px 20px', borderBottom: idx < filtered.length-1 ? `1px solid ${C.border}` : 'none', alignItems:'center' }}>
              <span style={{ padding:'3px 10px', borderRadius:8, background: attempt.success ? C.greenBg : C.redBg, color: attempt.success ? C.green : C.red, fontSize:11, fontWeight:700 }}>
                {attempt.success ? '✅ نجحت' : '❌ فشلت'}
              </span>
              <span style={{ color:C.text, fontSize:13, fontWeight:600, direction:'ltr', display:'block' }}>{attempt.phone}</span>
              <span style={{ color:C.sub, fontSize:12, direction:'ltr', display:'block' }}>{attempt.ip_address ?? '—'}</span>
              <div>
                {attempt.user ? (
                  <span style={{ color:C.text, fontSize:12 }}>{attempt.user.name} <span style={{ color:C.sub, fontSize:11 }}>({attempt.user.role})</span></span>
                ) : (
                  <span style={{ color:C.red, fontSize:12 }}>مجهول ⚠️</span>
                )}
              </div>
              <span style={{ color:C.dim, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{attempt.device_info ?? '—'}</span>
              <span style={{ color:C.dim, fontSize:11 }}>{new Date(attempt.created_at).toLocaleTimeString('ar-EG', { hour12:false, hour:'2-digit', minute:'2-digit' })}</span>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
