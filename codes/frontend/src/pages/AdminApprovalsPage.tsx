import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  blue:'#2563EB', blueBg:'rgba(37,99,235,0.08)',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.08)',
};

type Status = 'pending' | 'approved' | 'rejected';
type Category = 'content' | 'account' | 'financial' | 'system';

interface ApprovalRequest {
  id: number;
  title: string;
  description: string;
  requestedBy: string;
  role: string;
  category: Category;
  priority: 'high' | 'medium' | 'low';
  date: string;
  status: Status;
}

const MOCK_REQUESTS: ApprovalRequest[] = [
  { id:1, title:'إضافة دورة رياضيات جديدة', description:'طلب إضافة دورة رياضيات متقدمة للصف العاشر مع 24 درس فيديو', requestedBy:'أ. محمد السالم', role:'معلم', category:'content', priority:'medium', date:'2026-06-28', status:'pending' },
  { id:2, title:'رفع سعر باقة الرياضيات', description:'تغيير سعر باقة الرياضيات الشهرية من 50 إلى 65 دينار', requestedBy:'أ. سارة الأمين', role:'أدمن', category:'financial', priority:'high', date:'2026-06-27', status:'pending' },
  { id:3, title:'إعادة ضبط كلمة مرور طالب', description:'طلب إعادة ضبط حساب الطالب: أحمد علي (رقم: 10452)', requestedBy:'أ. خالد العمر', role:'مشرف', category:'account', priority:'low', date:'2026-06-26', status:'pending' },
  { id:4, title:'حذف محتوى مخالف', description:'حذف تعليقات غير لائقة في غرفة الدراسة — تم الإبلاغ 3 مرات', requestedBy:'أ. منى النور', role:'مشرف', category:'content', priority:'high', date:'2026-06-25', status:'approved' },
  { id:5, title:'تفعيل ميزة الدردشة الجماعية', description:'تفعيل ميزة الدردشة في غرف الدراسة للصف التاسع', requestedBy:'أ. فيصل الغامدي', role:'أدمن', category:'system', priority:'medium', date:'2026-06-24', status:'rejected' },
];

const PRIORITY_COLOR: Record<string, string> = { high: C.red, medium: C.amber, low: C.green };
const PRIORITY_BG: Record<string, string> = { high: C.redBg, medium: C.amberBg, low: C.greenBg };
const PRIORITY_LABEL: Record<string, string> = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
const CAT_EMOJI: Record<Category, string> = { content:'📚', account:'👤', financial:'💰', system:'⚙️' };
const CAT_LABEL: Record<Category, string> = { content:'محتوى', account:'حساب', financial:'مالي', system:'نظام' };

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(MOCK_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('pending');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const filtered = requests.filter(r =>
    (filterStatus === 'all' || r.status === filterStatus) &&
    (filterCat === 'all' || r.category === filterCat)
  );

  const handleApprove = (id: number) => {
    setRequests(p => p.map(r => r.id === id ? { ...r, status:'approved' } : r));
  };

  const handleReject = (id: number) => {
    setRequests(p => p.map(r => r.id === id ? { ...r, status:'rejected' } : r));
    setRejectingId(null);
    setRejectionNote('');
  };

  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  return (
    <AdminLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Header */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>مركز الموافقات ✅</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>الطلبات المرسلة للموافقة من الأدمن إلى السوبر أدمن</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'بانتظار الموافقة', value:pending, color:C.amber, bg:C.amberBg, icon:'⏳' },
            { label:'تمت الموافقة', value:approved, color:C.green, bg:C.greenBg, icon:'✅' },
            { label:'مرفوضة', value:rejected, color:C.red, bg:C.redBg, icon:'❌' },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'14px 18px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:26, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11.5, marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:5 }}>
            {(['all','pending','approved','rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding:'7px 14px', borderRadius:9, border:`1px solid ${filterStatus===s ? C.gold : C.border}`, background: filterStatus===s ? C.goldBg : C.card, color: filterStatus===s ? C.gold : C.sub, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                {s==='all' ? 'الكل' : s==='pending' ? 'معلقة' : s==='approved' ? 'موافق' : 'مرفوضة'}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:5 }}>
            {(['all','content','account','financial','system'] as const).map(c => (
              <button key={c} onClick={() => setFilterCat(c)} style={{ padding:'7px 12px', borderRadius:9, border:`1px solid ${filterCat===c ? C.gold : C.border}`, background: filterCat===c ? C.goldBg : C.card, color: filterCat===c ? C.gold : C.sub, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                {c==='all' ? 'كل الفئات' : `${CAT_EMOJI[c]} ${CAT_LABEL[c]}`}
              </button>
            ))}
          </div>
        </div>

        {/* Rejection Modal */}
        {rejectingId && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'#fff', borderRadius:18, padding:24, width:400, maxWidth:'92vw', fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>
              <h3 style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:12 }}>سبب الرفض</h3>
              <textarea value={rejectionNote} onChange={e => setRejectionNote(e.target.value)} rows={3} placeholder="اكتب سبب الرفض ليصل للطالب..." style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', resize:'none', boxSizing:'border-box', marginBottom:12 }} />
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => handleReject(rejectingId)} style={{ flex:1, padding:'9px', borderRadius:10, background:C.red, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>تأكيد الرفض</button>
                <button onClick={() => setRejectingId(null)} style={{ padding:'9px 16px', borderRadius:10, background:'#F3F4F6', color:C.sub, fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px', color:C.dim, fontSize:14 }}>
              <p style={{ fontSize:36, marginBottom:8 }}>📭</p>
              <p>لا توجد طلبات في هذه الفئة</p>
            </div>
          )}
          {filtered.map(req => (
            <div key={req.id} style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${req.status==='pending' ? C.border : req.status==='approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, boxShadow:C.shadow }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                    {CAT_EMOJI[req.category]}
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{req.title}</p>
                      <span style={{ padding:'2px 8px', borderRadius:6, background:PRIORITY_BG[req.priority], color:PRIORITY_COLOR[req.priority], fontSize:10, fontWeight:700 }}>
                        {PRIORITY_LABEL[req.priority]}
                      </span>
                    </div>
                    <p style={{ color:C.sub, fontSize:12, marginBottom:4, lineHeight:1.5 }}>{req.description}</p>
                    <p style={{ color:C.dim, fontSize:11 }}>من: {req.requestedBy} ({req.role}) · {req.date}</p>
                  </div>
                </div>
                <span style={{ padding:'4px 12px', borderRadius:8, background: req.status==='pending' ? C.amberBg : req.status==='approved' ? C.greenBg : C.redBg, color: req.status==='pending' ? C.amber : req.status==='approved' ? C.green : C.red, fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {req.status==='pending' ? '⏳ معلق' : req.status==='approved' ? '✅ موافق' : '❌ مرفوض'}
                </span>
              </div>
              {req.status === 'pending' && (
                <div style={{ display:'flex', gap:8, marginTop:6 }}>
                  <button onClick={() => handleApprove(req.id)} style={{ padding:'8px 18px', borderRadius:9, background:C.greenBg, border:`1px solid ${C.green}30`, color:C.green, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>الموافقة</button>
                  <button onClick={() => setRejectingId(req.id)} style={{ padding:'8px 18px', borderRadius:9, background:C.redBg, border:`1px solid ${C.red}30`, color:C.red, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>الرفض</button>
                  <button onClick={()=>alert(`تم إرسال طلب توضيح إلى ${req.requestedBy} (سيناريو تجريبي — الطلبات هنا بيانات عرض وليست مرتبطة بمستخدمين حقيقيين بعد).`)} style={{ padding:'8px 18px', borderRadius:9, background:'#F3F4F6', border:`1px solid ${C.border}`, color:C.sub, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>طلب مزيد من المعلومات</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
