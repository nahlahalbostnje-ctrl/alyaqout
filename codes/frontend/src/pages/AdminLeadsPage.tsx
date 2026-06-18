import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

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

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  lost:      'bg-gray-100 text-gray-400',
};

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
    { label: 'إجمالي',     value: stats.total,     color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { label: 'جديد',       value: stats.new,        color: 'bg-blue-50 text-blue-700 border-blue-100'       },
    { label: 'تم التواصل', value: stats.contacted,  color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { label: 'تحوّل',      value: stats.converted,  color: 'bg-green-50 text-green-700 border-green-100'   },
  ] : [];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">العملاء المحتملون</h2>
          <p className="text-sm text-gray-400 mt-1">إدارة طلبات الحجز والحصص المجانية</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs mt-0.5 opacity-75">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          >
            <option value="">كل الحالات</option>
            <option value="new">جديد</option>
            <option value="contacted">تم التواصل</option>
            <option value="converted">تحوّل</option>
            <option value="lost">مفقود</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          >
            <option value="">كل المصادر</option>
            <option value="book_now">احجز الآن</option>
            <option value="free_class">حصة مجانية</option>
          </select>
        </div>

        {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}

        {!loading && leads && leads.data.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white border border-gray-100">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-gray-500 font-semibold">لا توجد نتائج</p>
          </div>
        )}

        {!loading && leads && leads.data.length > 0 && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">الاسم</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">الهاتف</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">الصف</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">المصدر</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">التاريخ</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leads.data.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{lead.student_name}</p>
                        {lead.school && <p className="text-xs text-gray-400 mt-0.5">{lead.school}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{lead.grade?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${lead.source === 'book_now' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {SOURCE_LABELS[lead.source]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 font-semibold ${STATUS_COLORS[lead.status]} border-transparent disabled:opacity-50`}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
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
                <button
                  disabled={page === 1}
                  onClick={() => { const p = page - 1; setPage(p); load(p); }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  السابق
                </button>
                <span className="text-sm text-gray-500">
                  صفحة {page} من {leads.last_page}
                </span>
                <button
                  disabled={page === leads.last_page}
                  onClick={() => { const p = page + 1; setPage(p); load(p); }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
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
