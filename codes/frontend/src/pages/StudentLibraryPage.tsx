import { useState } from 'react';
import StudentLayout from '../components/StudentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  blue:'#2563EB', blueBg:'rgba(37,99,235,0.08)',
  purple:'#8B5CF6', purpleBg:'rgba(139,92,246,0.08)',
};

const TABS = ['الكتب', 'أسئلة السنوات السابقة', 'ملخصات', 'الإهداءات'];

const BOOKS = [
  { title:'رياضيات الصف العاشر', author:'د. أحمد السالم', type:'كتاب', grade:'الصف العاشر', subject:'رياضيات', color:'#2563EB', emoji:'📐' },
  { title:'الفيزياء العملية', author:'د. ليلى عمر', type:'كتاب', grade:'الصف الحادي عشر', subject:'فيزياء', color:'#7C3AED', emoji:'⚛️' },
  { title:'قواعد اللغة العربية', author:'أ. محمد النور', type:'كتاب', grade:'كل الصفوف', subject:'عربي', color:'#065F46', emoji:'📚' },
  { title:'الكيمياء التطبيقية', author:'د. سارة خالد', type:'كتاب', grade:'الصف الثاني عشر', subject:'كيمياء', color:'#D97706', emoji:'🧪' },
];

const PAST_EXAMS = [
  { subject:'رياضيات', year:2024, grade:'الصف العاشر', questions:45, downloads:1240, color:'#2563EB' },
  { subject:'علوم', year:2024, grade:'الصف التاسع', questions:38, downloads:980, color:'#10B981' },
  { subject:'لغة عربية', year:2023, grade:'الصف العاشر', questions:50, downloads:2100, color:'#D97706' },
  { subject:'فيزياء', year:2023, grade:'الصف الثاني عشر', questions:40, downloads:1560, color:'#7C3AED' },
  { subject:'كيمياء', year:2024, grade:'الصف الحادي عشر', questions:42, downloads:890, color:'#EF4444' },
  { subject:'تربية إسلامية', year:2023, grade:'الصف التاسع', questions:30, downloads:760, color:'#065F46' },
];

const SUMMARIES = [
  { title:'ملخص وحدات الرياضيات', pages:12, subject:'رياضيات', color:'#2563EB', emoji:'📐' },
  { title:'ملخص قوانين الفيزياء', pages:8, subject:'فيزياء', color:'#7C3AED', emoji:'⚡' },
  { title:'ملخص التفاعلات الكيميائية', pages:10, subject:'كيمياء', color:'#D97706', emoji:'🧪' },
  { title:'ملخص الأحداث التاريخية', pages:15, subject:'تاريخ', color:'#10B981', emoji:'🏛️' },
];

const DEDICATIONS = [
  { from:'المعلم أحمد', to:'طلاب الصف العاشر', text:'أتمنى لكم التوفيق في رحلتكم الأكاديمية. العلم نور والجهل ظلام — استمروا في التعلم', date:'2026-01-15', emoji:'💌' },
  { from:'إدارة المنصة', to:'جميع الطلاب', text:'أنتم مستقبل الأمة — لا تيأسوا وابذلوا قصارى جهدكم في كل يوم', date:'2026-03-01', emoji:'🌟' },
  { from:'المعلمة ليلى', to:'طلاب الرياضيات', text:'الرياضيات ليست مجرد أرقام، بل طريقة تفكير. أؤمن بقدراتكم', date:'2025-12-20', emoji:'📐' },
];

export default function StudentLibraryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('الكل');

  const subjects = ['الكل', 'رياضيات', 'فيزياء', 'كيمياء', 'عربي', 'تاريخ'];

  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>مكتبة الياقوت 📖</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>كتب، أسئلة سنوات سابقة، ملخصات، وإهداءات من معلميك</p>
        </div>

        {/* Stats Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'كتاب متاح', value:'48', icon:'📚', color:C.blue, bg:C.blueBg },
            { label:'أسئلة سابقة', value:'320+', icon:'📝', color:C.gold, bg:C.goldBg },
            { label:'ملخص', value:'75', icon:'📄', color:C.green, bg:C.greenBg },
            { label:'إهداء', value:'12', icon:'💌', color:C.purple, bg:C.purpleBg },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'14px 16px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:20, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11, marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:20, background:C.card, padding:5, borderRadius:12, border:`1px solid ${C.border}`, width:'fit-content' }}>
          {TABS.map((t,i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{ padding:'7px 16px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700, background: activeTab===i ? C.goldGrad : 'transparent', color: activeTab===i ? '#fff' : C.sub, transition:'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <div style={{ flex:1, position:'relative' }}>
            <svg width="16" height="16" fill="none" stroke={C.dim} viewBox="0 0 24 24" strokeWidth={2} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث في المكتبة..." style={{ width:'100%', padding:'9px 38px 9px 12px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", color:C.text, background:C.card, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {subjects.map((s,i) => (
              <button key={i} onClick={() => setSelectedSubject(s)} style={{ padding:'8px 14px', borderRadius:9, border:`1px solid ${selectedSubject===s ? C.gold : C.border}`, cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:12, fontWeight:600, background: selectedSubject===s ? C.goldBg : C.card, color: selectedSubject===s ? C.gold : C.sub, transition:'all 0.15s', whiteSpace:'nowrap' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {BOOKS.map((b,i) => (
              <div key={i} style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'hidden', cursor:'pointer', transition:'transform 0.15s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)'}
                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform='translateY(0)'}>
                <div style={{ height:100, background:`linear-gradient(135deg,${b.color}22,${b.color}44)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42 }}>{b.emoji}</div>
                <div style={{ padding:14 }}>
                  <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:4, lineHeight:1.4 }}>{b.title}</p>
                  <p style={{ color:C.sub, fontSize:11, marginBottom:6 }}>{b.author}</p>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                    <span style={{ padding:'2px 8px', borderRadius:6, background:C.goldBg, color:C.gold, fontSize:10, fontWeight:600 }}>{b.subject}</span>
                    <span style={{ padding:'2px 8px', borderRadius:6, background:'#F3F4F6', color:C.sub, fontSize:10 }}>{b.grade}</span>
                  </div>
                  <button style={{ width:'100%', padding:'7px', borderRadius:9, background:C.goldGrad, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>قراءة</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {PAST_EXAMS.map((e,i) => (
              <div key={i} style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                  <div>
                    <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:3 }}>{e.subject}</p>
                    <p style={{ color:C.sub, fontSize:12 }}>{e.grade}</p>
                  </div>
                  <span style={{ padding:'4px 10px', borderRadius:8, background:`${e.color}18`, color:e.color, fontSize:12, fontWeight:700 }}>{e.year}</span>
                </div>
                <div style={{ display:'flex', gap:16, marginBottom:14 }}>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ color:C.text, fontWeight:800, fontSize:18 }}>{e.questions}</p>
                    <p style={{ color:C.dim, fontSize:10 }}>سؤال</p>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ color:C.green, fontWeight:800, fontSize:18 }}>{e.downloads.toLocaleString()}</p>
                    <p style={{ color:C.dim, fontSize:10 }}>تحميل</p>
                  </div>
                </div>
                <button style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldGrad, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>
                  تحميل الأسئلة
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {SUMMARIES.map((s,i) => (
              <div key={i} style={{ background:C.card, borderRadius:16, padding:18, border:`1px solid ${C.border}`, boxShadow:C.shadow, textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>{s.emoji}</div>
                <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:4 }}>{s.title}</p>
                <p style={{ color:C.sub, fontSize:11, marginBottom:4 }}>{s.subject}</p>
                <p style={{ color:C.dim, fontSize:10, marginBottom:12 }}>{s.pages} صفحة</p>
                <button style={{ width:'100%', padding:'7px', borderRadius:9, background:C.goldGrad, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>عرض الملخص</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {DEDICATIONS.map((d,i) => (
              <div key={i} style={{ background:C.card, borderRadius:16, padding:20, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{d.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <p style={{ color:C.gold, fontWeight:800, fontSize:14 }}>{d.from}</p>
                      <span style={{ color:C.dim, fontSize:11 }}>{d.date}</span>
                    </div>
                    <p style={{ color:C.sub, fontSize:11.5, marginBottom:8 }}>إلى: {d.to}</p>
                    <p style={{ color:C.text, fontSize:13, lineHeight:1.8, fontStyle:'italic' }}>"{d.text}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
