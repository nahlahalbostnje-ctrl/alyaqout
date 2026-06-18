import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  inputStyle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
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

function statusStyle(s: string) {
  if (s === 'new')       return { background: 'rgba(96,165,250,0.12)',  color: '#60a5fa' };
  if (s === 'contacted') return { background: 'rgba(245,158,11,0.12)', color: '#fbbf24' };
  if (s === 'converted') return { background: 'rgba(52,211,153,0.12)', color: '#34d399' };
  return { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' };
}

const SOURCE_LABELS: Record<string, string> = {
  book_now:   'احجز الآن',
  free_class: 'حصة مجانية',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

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
    { label: 'إجمالي',     value: stats.total,    color: DK.gold,    bg: 'rgba(245,166,35,0.08)' },
    { label: 'جديد',       value: stats.new,       color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
    { label: 'تم التواصل', value: stats.contacted, color: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
    { label: 'تحوّل',      value: stats.converted, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  ] : [];

  const selectStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">العملاء المحتملون</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>إدارة طلبات الحجز والحصص المجانية</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl p-4" style={{ background: card.bg, border: '1px solid rgba(245,166,35,0.08)' }}>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: '#070e22' }}>كل الحالات</option>
            <option value="new"       style={{ background: '#070e22' }}>جديد</option>
            <option value="contacted" style={{ background: '#070e22' }}>تم التواصل</option>
            <option value="converted" style={{ background: '#070e22' }}>تحوّل</option>
            <option value="lost"      style={{ background: '#070e22' }}>مفقود</option>
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={selectStyle}>
            <option value=""           style={{ background: '#070e22' }}>كل المصادر</option>
            <option value="book_now"   style={{ background: '#070e22' }}>احجز الآن</option>
            <option value="free_class" style={{ background: '#070e22' }}>حصة مجانية</option>
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {!loading && leads && leads.data.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={DK.card}>
            <p className="font-semibold text-white">لا توجد نتائج</p>
          </div>
        )}

        {!loading && leads && leads.data.length > 0 && (
          <>
            <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }} className="mb-4">
              <table className="w-full text-sm">
                <thead style={{ background: 'rgba(245,166,35,0.04)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                  <tr>
                    {['الاسم', 'الهاتف', 'الصف', 'المصدر', 'التاريخ', 'الحالة'].map((h) => (
                      <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                        style={{ color: 'rgba(245,166,35,0.55)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.data.map((lead) => (
                    <tr key={lead.id} className="transition"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{lead.student_name}</p>
                        {lead.school && <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{lead.school}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: DK.dimTxt }} dir="ltr">{lead.phone}</td>
                      <td className="px-4 py-3" style={{ color: DK.dimTxt }}>{lead.grade?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={lead.source === 'book_now'
                            ? { background: 'rgba(245,166,35,0.12)', color: '#f5a623' }
                            : { background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                          {SOURCE_LABELS[lead.source]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: DK.dimTxt }}>{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          style={{ ...statusStyle(lead.status), borderRadius: '8px', padding: '4px 8px', fontSize: '12px', outline: 'none', cursor: 'pointer', border: 'none', fontFamily: "'Cairo', sans-serif" }}
                          className="disabled:opacity-50">
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val} style={{ background: '#070e22', color: '#fff' }}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {leads.last_page > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={page === 1}
                  onClick={() => { const p = page - 1; setPage(p); load(p); }}
                  className="px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(245,166,35,0.15)' }}>
                  السابق
                </button>
                <span className="text-sm" style={{ color: DK.dimTxt }}>صفحة {page} من {leads.last_page}</span>
                <button disabled={page === leads.last_page}
                  onClick={() => { const p = page + 1; setPage(p); load(p); }}
                  className="px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(245,166,35,0.15)' }}>
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
