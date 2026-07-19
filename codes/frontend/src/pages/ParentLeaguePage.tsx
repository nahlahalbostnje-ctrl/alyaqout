import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';

export default function ParentLeaguePage() {
  const [family, setFamily] = useState<{ rank: number; name: string; points: number }[]>([]);
  const [country, setCountry] = useState<{ rank: number; name: string; points: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/league-board')
      .then((r) => {
        setFamily(r.data.family_board ?? []);
        setCountry(r.data.country_top10 ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", padding: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>دوري الأولياء</h1>
        <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: 13 }}>ترتيب أبنائك بالنقاط + أفضل 10 في الدولة</p>
        {loading ? <p>جاري...</p> : (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>ترتيب العائلة</h3>
            {family.length === 0 ? <p style={{ color: '#6B7280', fontSize: 13 }}>لا أبناء بعد</p> : family.map((r) => (
              <div key={r.rank} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, border: '1px solid #EDE3CE', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>#{r.rank} {r.name}</span>
                <span style={{ color: '#C59341', fontWeight: 900 }}>{r.points}</span>
              </div>
            ))}
            <h3 style={{ fontSize: 15, fontWeight: 800, marginTop: 20 }}>أفضل 10 في الدولة</h3>
            {country.map((r) => (
              <div key={`${r.rank}-${r.name}`} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, border: '1px solid #EDE3CE', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>#{r.rank} {r.name}</span>
                <span style={{ color: '#C59341', fontWeight: 900 }}>{r.points}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </ParentLayout>
  );
}
