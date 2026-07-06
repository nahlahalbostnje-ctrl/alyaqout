import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6', orange:'#F59E0B', purple:'#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background:'#FFFFFF', borderRadius:16, padding:20,
  boxShadow:'0 2px 16px rgba(0,0,0,0.06)', border:'1px solid #EDE3CE', ...e,
});
const TH: React.CSSProperties = {
  padding:'11px 16px', textAlign:'right', color:DK.sub, fontSize:12,
  fontWeight:700, background:'#F8F5EE', borderBottom:'1px solid #EDE3CE',
};
const TD: React.CSSProperties = {
  padding:'12px 16px', borderBottom:'1px solid #F3EDE0', fontSize:13, color:DK.text,
};

interface Lead {
  id:           number;
  student_name: string;
  phone:        string;
  school:       string | null;
  region:       string | null;
  subjects:     string[] | null;
  source:       'book_now' | 'free_class';
  status:       'new' | 'contacted' | 'converted' | 'lost';
  created_at:   string;
  grade?:       { id: number; name: string } | null;
}

interface Stats {
  total:     number;
  new:       number;
  contacted: number;
  converted: number;
}

interface PaginatedLeads {
  data:          Lead[];
  current_page:  number;
  last_page:     number;
  total:         number;
}

const STATUS_LABELS: Record<string, string> = {
  new:       'جديد',
  contacted: 'تم التواصل',
  converted: 'تحوّل',
  lost:      'مفقود',
};

function statusBadgeStyle(s: string): React.CSSProperties {
  if (s === 'new')       return { background:'rgba(245,158,11,0.1)',  color:DK.orange };
  if (s === 'contacted') return { background:'rgba(59,130,246,0.1)',  color:DK.blue   };
  if (s === 'converted') return { background:'rgba(16,185,129,0.1)',  color:DK.green  };
  return { background:'rgba(239,68,68,0.1)', color:DK.red };
}

const SOURCE_LABELS: Record<string, string> = {
  book_now:   'احجز الآن',
  free_class: 'حصة مجانية',
};


export default function AdminLeadsPage() {
  const [leads, setLeads]         = useState<PaginatedLeads | null>(null);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p };
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      const { data } = await api.get('/admin/leads', { params });
      setLeads(data.leads);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); setPage(1); }, [statusFilter, sourceFilter]);

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    setUpdatingId(lead.id);
    try {
      await api.patch(`/admin/leads/${lead.id}/status`, { status: newStatus });
      await load(page);
    } finally {
      setUpdatingId(null);
    }
  };

  const statCards = stats ? [
    { label:'إجمالي',      value:stats.total,     color:DK.gold,   bg:'rgba(197,147,65,0.1)',   icon:'👥' },
    { label:'جديد',        value:stats.new,        color:DK.orange, bg:'rgba(245,158,11,0.1)',   icon:'🆕' },
    { label:'تم التواصل',  value:stats.contacted,  color:DK.blue,   bg:'rgba(59,130,246,0.1)',   icon:'📞' },
    { label:'تم التحويل',  value:stats.converted,  color:DK.green,  bg:'rgba(16,185,129,0.1)',   icon:'✅' },
  ] : [];

  const filterSelectStyle: React.CSSProperties = {
    background:'#FFFFFF', border:'1px solid #EDE3CE', color:DK.text,
    borderRadius:12, padding:'9px 14px', fontSize:13, outline:'none',
    cursor:'pointer', fontFamily:"'Cairo',sans-serif",
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background:DK.bg, minHeight:'100vh', padding:24 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background:DK.goldGrad }} />
            <div>
              <h1 style={{ color:DK.text, fontWeight:900, fontSize:20, margin:0 }}>العملاء المحتملون</h1>
              <p style={{ color:DK.sub, fontSize:12, margin:'2px 0 0' }}>إدارة طلبات الحجز والحصص المجانية</p>
            </div>
          </div>
          {/* Source filter pills */}
          <div style={{ display:'flex', gap:8 }}>
            {[
              { val:'', label:'الكل' },
              { val:'book_now', label:'احجز الآن' },
              { val:'free_class', label:'حصة مجانية' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setSourceFilter(opt.val)}
                style={{
                  padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer',
                  fontFamily:"'Cairo',sans-serif", border:'none',
                  background: sourceFilter===opt.val ? DK.gold : '#FFFFFF',
                  color: sourceFilter===opt.val ? '#fff' : DK.sub,
                  boxShadow: sourceFilter===opt.val ? '0 2px 8px rgba(197,147,65,0.3)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:24 }}>
            {statCards.map(sc => (
              <div key={sc.label} style={{ ...card({ padding:16 }), background:sc.bg, border:'1px solid #EDE3CE' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:22 }}>{sc.icon}</span>
                  <span style={{ fontSize:11, color:DK.sub, fontWeight:600 }}>{sc.label}</span>
                </div>
                <p style={{ color:sc.color, fontWeight:900, fontSize:28, margin:0 }}>{sc.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Status Filter */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <span style={{ color:DK.sub, fontSize:13 }}>تصفية:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="">كل الحالات</option>
            <option value="new">جديد</option>
            <option value="contacted">تم التواصل</option>
            <option value="converted">تحوّل</option>
            <option value="lost">مفقود</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor:DK.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        )}

        {/* Empty */}
        {!loading && leads && leads.data.length === 0 && (
          <div style={{ ...card(), textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
            <p style={{ color:DK.text, fontWeight:700, fontSize:15, margin:0 }}>لا توجد نتائج</p>
          </div>
        )}

        {/* Table */}
        {!loading && leads && leads.data.length > 0 && (
          <>
            <div style={{ ...card({ padding:0 }), overflowX:'auto', marginBottom:16 }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #EDE3CE', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:15 }}>📋</span>
                  <span style={{ color:DK.text, fontWeight:800, fontSize:14 }}>قائمة العملاء ({leads.total})</span>
                </div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['#','الاسم','الهاتف','المدرسة / المنطقة','المصدر','المواد','حالة المتابعة','إجراءات'].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.data.map((lead, i) => (
                    <tr key={lead.id}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(197,147,65,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                    >
                      <td style={{ ...TD, color:DK.dim, width:40 }}>{(page-1)*15 + i+1}</td>

                      {/* Name */}
                      <td style={TD}>
                        <p style={{ color:DK.text, fontWeight:700, margin:'0 0 2px', fontSize:13 }}>{lead.student_name}</p>
                        {lead.grade && <p style={{ color:DK.dim, fontSize:11, margin:0 }}>{lead.grade.name}</p>}
                      </td>

                      {/* Phone */}
                      <td style={TD}>
                        <a href={`tel:${lead.phone}`} style={{ color:DK.blue, textDecoration:'none', fontFamily:'monospace', fontSize:13 }} dir="ltr">
                          {lead.phone}
                        </a>
                      </td>

                      {/* School / Region */}
                      <td style={TD}>
                        {lead.school && <p style={{ color:DK.text, fontSize:12, margin:'0 0 2px' }}>{lead.school}</p>}
                        {lead.region && <p style={{ color:DK.dim, fontSize:11, margin:0 }}>{lead.region}</p>}
                        {!lead.school && !lead.region && <span style={{ color:DK.dim }}>—</span>}
                      </td>

                      {/* Source */}
                      <td style={TD}>
                        <span style={{
                          display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                          background: lead.source==='book_now'?'rgba(59,130,246,0.1)':'rgba(16,185,129,0.1)',
                          color: lead.source==='book_now'?DK.blue:DK.green,
                        }}>
                          {SOURCE_LABELS[lead.source]}
                        </span>
                      </td>

                      {/* Subjects */}
                      <td style={TD}>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          {lead.subjects && lead.subjects.length > 0
                            ? lead.subjects.map((s, idx) => (
                              <span key={idx} style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, background:'rgba(197,147,65,0.1)', color:DK.gold }}>
                                {s}
                              </span>
                            ))
                            : <span style={{ color:DK.dim, fontSize:12 }}>—</span>
                          }
                        </div>
                      </td>

                      {/* Status */}
                      <td style={TD}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:6 }}>
                          <span style={{
                            display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                            ...statusBadgeStyle(lead.status),
                          }}>
                            {STATUS_LABELS[lead.status]}
                          </span>
                          {/* Action button based on status */}
                          {lead.status === 'new' && (
                            <button
                              disabled={updatingId===lead.id}
                              onClick={() => handleStatusChange(lead, 'contacted')}
                              style={{ padding:'3px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(59,130,246,0.1)', color:DK.blue, opacity:updatingId===lead.id?0.5:1 }}
                            >
                              تم التواصل
                            </button>
                          )}
                          {lead.status === 'contacted' && (
                            <button
                              disabled={updatingId===lead.id}
                              onClick={() => handleStatusChange(lead, 'converted')}
                              style={{ padding:'3px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(16,185,129,0.1)', color:DK.green, opacity:updatingId===lead.id?0.5:1 }}
                            >
                              تم التحويل
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={TD}>
                        <div style={{ display:'flex', gap:6 }}>
                          {lead.status !== 'lost' && (
                            <button
                              disabled={updatingId===lead.id}
                              onClick={() => handleStatusChange(lead, 'lost')}
                              style={{ padding:'5px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:"'Cairo',sans-serif", background:'rgba(239,68,68,0.08)', color:DK.red, opacity:updatingId===lead.id?0.5:1 }}
                            >
                              لم يتجاوب
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {leads.last_page > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <button
                  disabled={page===1}
                  onClick={() => { const p = page-1; setPage(p); load(p); }}
                  style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #EDE3CE', background:'#FFFFFF', color:DK.sub, cursor:'pointer', fontSize:13, fontFamily:"'Cairo',sans-serif", opacity:page===1?0.4:1 }}
                >
                  السابق
                </button>
                <span style={{ color:DK.sub, fontSize:13 }}>صفحة {page} من {leads.last_page}</span>
                <button
                  disabled={page===leads.last_page}
                  onClick={() => { const p = page+1; setPage(p); load(p); }}
                  style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #EDE3CE', background:'#FFFFFF', color:DK.sub, cursor:'pointer', fontSize:13, fontFamily:"'Cairo',sans-serif", opacity:page===leads.last_page?0.4:1 }}
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
