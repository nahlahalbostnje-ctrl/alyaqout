import { useState } from 'react';
import ParentLayout from '../components/ParentLayout';

const C = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', goldBdr: 'rgba(197,147,65,0.22)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  purple: '#8B5CF6', purpleBg: 'rgba(139,92,246,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
};

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{sub}</p>
    </div>
  );
}

const COUNSELORS = [
  { id: 1, name: 'د. ريم الشمري', specialty: 'مرشد أكاديمي', avatar: 'رش', rating: 4.9, sessions: 120, available: true, color: '#C59341' },
  { id: 2, name: 'د. فهد الزهراني', specialty: 'مرشد نفسي', avatar: 'فز', rating: 4.7, sessions: 85, available: true, color: '#3B82F6' },
  { id: 3, name: 'أ. لمياء الرشيد', specialty: 'مستشار تربوي', avatar: 'لر', rating: 4.8, sessions: 200, available: false, color: '#8B5CF6' },
];

const CHILDREN = ['محمد أحمد', 'سارة أحمد', 'علي أحمد'];

const UPCOMING = [
  { counselor: 'د. ريم الشمري', type: 'أونلاين', date: '2025-06-15', time: '10:00 ص', status: 'confirmed', child: 'محمد أحمد' },
  { counselor: 'د. فهد الزهراني', type: 'هاتفية', date: '2025-06-20', time: '2:00 م', status: 'pending', child: 'سارة أحمد' },
];

const PAST = [
  { counselor: 'أ. لمياء الرشيد', type: 'أونلاين', date: '2025-05-10', time: '11:00 ص', status: 'completed', child: 'محمد أحمد', notes: 'تحسّن ملحوظ في الأداء الدراسي' },
  { counselor: 'د. ريم الشمري', type: 'هاتفية', date: '2025-04-22', time: '3:00 م', status: 'completed', child: 'سارة أحمد', notes: 'مناقشة الخطة الأكاديمية للفصل القادم' },
  { counselor: 'د. فهد الزهراني', type: 'أونلاين', date: '2025-03-15', time: '9:00 ص', status: 'completed', child: 'علي أحمد', notes: 'جلسة متابعة نفسية — التكيف الاجتماعي' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? C.amber : C.dim, fontSize: 13 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: C.sub, marginRight: 4, fontWeight: 700 }}>{rating}</span>
    </div>
  );
}

const STATUS_CONF: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'مؤكد', color: C.green, bg: C.greenBg },
  pending: { label: 'قيد الانتظار', color: C.amber, bg: C.amberBg },
  completed: { label: 'مكتمل', color: C.blue, bg: C.blueBg },
  cancelled: { label: 'ملغي', color: C.red, bg: C.redBg },
};

export default function ParentCounselingPage() {
  const [modalCounselor, setModalCounselor] = useState<typeof COUNSELORS[0] | null>(null);
  const [bookChild, setBookChild] = useState('محمد أحمد');
  const [bookType, setBookType] = useState('أونلاين');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);
  const [upcomingList, setUpcomingList] = useState(UPCOMING);

  const handleBook = () => {
    if (!bookDate || !bookTime) return;
    const newSession = {
      counselor: modalCounselor!.name,
      type: bookType,
      date: bookDate,
      time: bookTime,
      status: 'pending',
      child: bookChild,
    };
    setUpcomingList(prev => [...prev, newSession]);
    setBookSuccess(true);
    setTimeout(() => {
      setBookSuccess(false);
      setModalCounselor(null);
      setBookDate('');
      setBookTime('');
      setBookNotes('');
    }, 2000);
  };

  const handleCancel = (idx: number) => {
    setUpcomingList(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <PageHeader title="طلب جلسة إرشاد" sub="احجز جلسة مع المرشدين والمستشارين التربويين لمتابعة أبنائك" />

        {/* Counselors Grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>المرشدون والمستشارون</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {COUNSELORS.map(c => (
              <div key={c.id} style={card({ padding: 24 })}>
                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', margin: '0 auto 10px',
                    background: `linear-gradient(135deg,${c.color},${c.color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 24,
                    boxShadow: `0 4px 16px ${c.color}40`,
                  }}>{c.avatar}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>{c.name}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: C.goldBg, color: C.gold,
                  }}>{c.specialty}</span>
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '10px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                  <StarRating rating={c.rating} />
                  <span style={{ fontSize: 12, color: C.sub }}>{c.sessions} جلسة</span>
                </div>
                {/* Availability */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: C.sub }}>الحالة:</span>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                    background: c.available ? C.greenBg : C.redBg,
                    color: c.available ? C.green : C.red,
                  }}>{c.available ? 'متاح' : 'مشغول'}</span>
                </div>
                {/* Book Button */}
                <button
                  onClick={() => c.available && setModalCounselor(c)}
                  disabled={!c.available}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 12, border: 'none',
                    background: c.available ? C.goldGrad : '#F3F4F6',
                    color: c.available ? '#fff' : C.dim,
                    fontWeight: 800, fontSize: 13, cursor: c.available ? 'pointer' : 'not-allowed',
                    fontFamily: "'Cairo',sans-serif",
                    boxShadow: c.available ? '0 4px 12px rgba(197,147,65,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.available ? 'احجز جلسة' : 'غير متاح حالياً'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div style={card({ marginBottom: 20 })}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>الجلسات القادمة</div>
          {upcomingList.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.dim, padding: '24px 0', fontSize: 13 }}>
              لا توجد جلسات قادمة مجدولة حالياً.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.goldBg }}>
                    {['المرشد', 'الطفل', 'النوع', 'التاريخ', 'الوقت', 'الحالة', 'إجراء'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'right', color: C.gold, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingList.map((s, i) => {
                    const st = STATUS_CONF[s.status] || STATUS_CONF.pending;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', color: C.text, fontWeight: 700 }}>{s.counselor}</td>
                        <td style={{ padding: '10px 14px', color: C.sub }}>{s.child}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                            background: C.blueBg, color: C.blue,
                          }}>{s.type}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: C.sub, direction: 'ltr', textAlign: 'right' }}>{s.date}</td>
                        <td style={{ padding: '10px 14px', color: C.sub }}>{s.time}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                            background: st.bg, color: st.color,
                          }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={() => handleCancel(i)}
                            style={{
                              padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.redBg}`,
                              background: C.redBg, color: C.red, fontSize: 11, fontWeight: 700,
                              cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                            }}
                          >
                            إلغاء الحجز
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Past Sessions */}
        <div style={card()}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>الجلسات السابقة</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.goldBg }}>
                  {['المرشد', 'الطفل', 'النوع', 'التاريخ', 'الحالة', 'ملاحظات الجلسة'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'right', color: C.gold, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAST.map((s, i) => {
                  const st = STATUS_CONF[s.status];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 14px', color: C.text, fontWeight: 700 }}>{s.counselor}</td>
                      <td style={{ padding: '10px 14px', color: C.sub }}>{s.child}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: C.blueBg, color: C.blue,
                        }}>{s.type}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: C.sub, direction: 'ltr', textAlign: 'right' }}>{s.date}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: st.bg, color: st.color,
                        }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: C.sub, fontSize: 12 }}>{s.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Modal */}
        {modalCounselor && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(13,30,58,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
            onClick={e => { if (e.target === e.currentTarget) setModalCounselor(null); }}
          >
            <div style={{
              background: '#fff', borderRadius: 20, padding: 28,
              width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              fontFamily: "'Cairo',sans-serif",
            }}>
              {bookSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.green, marginBottom: 6 }}>تم الحجز بنجاح!</div>
                  <div style={{ fontSize: 13, color: C.sub }}>سيتم تأكيد الجلسة في أقرب وقت ممكن.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>حجز جلسة إرشاد</div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{modalCounselor.name} — {modalCounselor.specialty}</div>
                    </div>
                    <button
                      onClick={() => setModalCounselor(null)}
                      style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.dim }}
                    >✕</button>
                  </div>

                  {[
                    {
                      label: 'اختر الطفل', content: (
                        <select value={bookChild} onChange={e => setBookChild(e.target.value)} style={inputStyle}>
                          {CHILDREN.map(ch => <option key={ch}>{ch}</option>)}
                        </select>
                      )
                    },
                    {
                      label: 'نوع الجلسة', content: (
                        <div style={{ display: 'flex', gap: 10 }}>
                          {['أونلاين', 'هاتفية'].map(t => (
                            <button
                              key={t}
                              onClick={() => setBookType(t)}
                              style={{
                                flex: 1, padding: '9px 0', borderRadius: 10, border: 'none',
                                background: bookType === t ? C.goldGrad : '#F3F4F6',
                                color: bookType === t ? '#fff' : C.text,
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                fontFamily: "'Cairo',sans-serif",
                              }}
                            >{t}</button>
                          ))}
                        </div>
                      )
                    },
                    {
                      label: 'تاريخ الجلسة', content: (
                        <input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} style={inputStyle} />
                      )
                    },
                    {
                      label: 'وقت الجلسة', content: (
                        <input type="time" value={bookTime} onChange={e => setBookTime(e.target.value)} style={inputStyle} />
                      )
                    },
                    {
                      label: 'موضوع الجلسة (اختياري)', content: (
                        <textarea
                          value={bookNotes}
                          onChange={e => setBookNotes(e.target.value)}
                          rows={3}
                          placeholder="اذكر الموضوع أو السبب الرئيسي للجلسة..."
                          style={{ ...inputStyle, resize: 'none' as const }}
                        />
                      )
                    },
                  ].map(({ label, content }, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.text, display: 'block', marginBottom: 6 }}>{label}</label>
                      {content}
                    </div>
                  ))}

                  <button
                    onClick={handleBook}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                      background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 14,
                      cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                      boxShadow: '0 4px 14px rgba(197,147,65,0.4)', marginTop: 4,
                    }}
                  >
                    تأكيد الحجز
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1px solid #EDE3CE', fontSize: 13,
  fontFamily: "'Cairo',sans-serif", color: '#1B2038',
  boxSizing: 'border-box', background: '#fff',
};
