import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  blue:'#2563EB', blueBg:'rgba(37,99,235,0.08)',
};

interface LogEntry {
  id: number; action: string; target_type: string | null; target_label: string | null;
  ip_address: string | null; created_at: string;
  admin?: { id: number; name: string };
}

const ACTION_ICON: Record<string, string> = {
  create_user: '👤+', delete_user: '🗑️', toggle_user: '🔄',
  impersonate: '🎭', update_city: '🏙️', delete_city: '🗑️',
  approve: '✅', reject: '❌', default: '📝',
};

const ACTION_LABEL: Record<string, string> = {
  create:'إضافة', update:'تعديل', delete:'حذف',
  create_user:'إنشاء مستخدم', delete_user:'حذف مستخدم', toggle_user:'تغيير حالة',
  impersonate:'دخول كمستخدم', login:'تسجيل دخول', update_city:'تعديل مدينة', delete_city:'حذف مدينة',
  approve:'موافقة', reject:'رفض',
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/admin/audit-log')
      .then(({ data }) => {
        const paginated = data.data;
        setLogs(paginated?.data ?? []);
      })
      .catch(() => { setLogs([]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !search || (l.target_label ?? '').includes(search) || (ACTION_LABEL[l.action] ?? l.action).includes(search)
  );

  return (
    <AdminLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Header */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>سجل العمليات 📋</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>تاريخ كامل لكل العمليات التي أجريتها على المنصة</p>
        </div>

        {/* Search */}
        <div style={{ marginBottom:16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ابحث في السجل..."
            style={{ width:'100%', padding:'10px 16px', borderRadius:12, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', background:C.card, color:C.text, boxSizing:'border-box' }}
          />
        </div>

        {/* Log Table */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflowX:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr 140px 120px', minWidth:600, padding:'11px 20px', background:C.goldBg, borderBottom:`1px solid ${C.border}` }}>
            {['#','العملية','الهدف','IP','الوقت'].map((h,i) => (
              <span key={i} style={{ color:C.gold, fontSize:11, fontWeight:800 }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:C.dim }}>جارٍ التحميل...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:C.dim }}>
              <p style={{ fontSize:32, marginBottom:8 }}>📋</p>
              <p>لا توجد سجلات بعد</p>
            </div>
          ) : filtered.map((log, idx) => (
            <div key={log.id} style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr 140px 120px', minWidth:600, padding:'13px 20px', borderBottom: idx < filtered.length-1 ? `1px solid ${C.border}` : 'none', alignItems:'center' }}>
              <span style={{ color:C.dim, fontSize:12, fontWeight:700 }}>#{log.id}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>{ACTION_ICON[log.action] ?? ACTION_ICON.default}</span>
                <span style={{ color:C.text, fontSize:13, fontWeight:700 }}>{ACTION_LABEL[log.action] ?? log.action}</span>
              </div>
              <div>
                {log.target_type && <span style={{ color:C.sub, fontSize:11, background:C.goldBg, padding:'2px 8px', borderRadius:6, marginLeft:4 }}>{log.target_type}</span>}
                <span style={{ color:C.text, fontSize:12 }}>{log.target_label ?? '—'}</span>
              </div>
              <span style={{ color:C.sub, fontSize:12, direction:'ltr' }}>{log.ip_address ?? '—'}</span>
              <span style={{ color:C.dim, fontSize:11 }}>{new Date(log.created_at).toLocaleString('ar-EG', { hour12:false, hour:'2-digit', minute:'2-digit' })}</span>
            </div>
          ))}
        </div>

        <p style={{ color:C.dim, fontSize:11, textAlign:'center', marginTop:12 }}>يُعرض آخر {filtered.length} عملية</p>
      </div>
    </AdminLayout>
  );
}
