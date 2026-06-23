import { useState, useRef, useEffect } from 'react';
import ParentLayout from '../components/ParentLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981',
};

interface Message {
  id: number;
  from: 'ai' | 'user';
  text: string;
  time: string;
}

const INITIAL_MSG: Message = {
  id: 1, from: 'ai',
  text: 'مرحباً! أنا مساعد الياقوت الذكي 🤖\n\nأنا هنا لمساعدتك في متابعة رحلة أبنائك التعليمية. يمكنك أن تسألني عن:\n• مستوى أبنائك الأكاديمي وكيفية التحسين\n• نصائح لتحسين الأداء الدراسي\n• خطط مراجعة مخصصة لكل مادة\n• كيفية التعامل مع صعوبات التعلم\n• إدارة وقت المذاكرة في المنزل',
  time: new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' }),
};

const SUGGESTIONS = [
  'كيف يمكنني مساعدة محمد في اللغة الإنجليزية؟',
  'ما هي أفضل طرق المذاكرة للصف الخامس؟',
  'محمد يتأخر في تسليم الواجبات، ماذا أفعل؟',
  'كيف أتعامل مع قلق الاختبارات عند ابني؟',
];

const AI_RESPONSES = [
  {
    keywords: ['إنجليزية','english','انجليزية'],
    response: 'لتحسين مستوى اللغة الإنجليزية، أنصح بـ:\n\n1️⃣ مشاهدة 15 دقيقة من المحتوى الإنجليزي يومياً (كرتون أو قصة)\n2️⃣ حل تمارين القراءة من الوحدة الحالية في الدورة\n3️⃣ التحدث بالإنجليزية 10 دقائق يومياً مع أحد الوالدين\n4️⃣ الاستفادة من الحصص الإضافية المتاحة في المنصة\n\nهل تريد خطة مراجعة أسبوعية مفصلة لمادة الإنجليزية؟',
  },
  {
    keywords: ['واجب','تأخر','تأخير'],
    response: 'لمعالجة مشكلة التأخر في الواجبات:\n\n1️⃣ ضع جدولاً يومياً ثابتاً لوقت المذاكرة (مثلاً: بعد العصر مباشرة)\n2️⃣ ابدأ بالواجبات الأصعب أولاً حين تكون الطاقة في أوجها\n3️⃣ قسّم الواجبات الكبيرة إلى أجزاء صغيرة مع استراحة 5 دقائق كل 25 دقيقة\n4️⃣ استخدم مكافآت بسيطة عند الإنجاز (وجبة خفيفة مفضلة، وقت لعب إضافي)\n\nهل تريد نموذج جدول يومي مقترح؟',
  },
  {
    keywords: ['قلق','اختبار','خوف','توتر'],
    response: 'قلق الاختبارات أمر طبيعي جداً! إليك بعض النصائح الفعالة:\n\n1️⃣ المراجعة المنتظمة (20 دقيقة يومياً) أفضل بكثير من المراجعة المكثفة\n2️⃣ تمارين التنفس العميق قبل الاختبار بـ 5 دقائق\n3️⃣ النوم الكافي: 8-9 ساعات ليلة الاختبار (لا تراجع بعد منتصف الليل)\n4️⃣ وجبة فطور صحية ومغذية في يوم الاختبار\n5️⃣ كلمات التشجيع الإيجابية تصنع فارقاً كبيراً - قل لابنك "أنا فخور بك"\n\nهل تريد تمارين استرخاء مخصصة للأطفال؟',
  },
  {
    keywords: ['رياضيات','math'],
    response: 'لتقوية الرياضيات:\n\n1️⃣ حل 5-10 تمارين يومياً (التكرار مفتاح النجاح)\n2️⃣ استخدم الأشياء المنزلية لشرح المفاهيم (عد الفواكه، قياس الغرف)\n3️⃣ شجع ابنك على شرح الحل بصوت عالٍ - هذا يكشف أي ثغرات\n4️⃣ مراجعة الأخطاء في الاختبارات السابقة أهم من حل مسائل جديدة\n\nما المرحلة التي يجد فيها ابنك صعوبة تحديداً؟',
  },
  {
    keywords: ['جدول','وقت','منظم'],
    response: 'إليك جدولاً يومياً مقترحاً للمرحلة الابتدائية:\n\n🌅 الصباح:\n• مراجعة 15 دقيقة قبل المدرسة\n\n🌆 بعد الظهر:\n• استراحة 30 دقيقة بعد العودة من المدرسة\n• واجبات: 45-60 دقيقة مع استراحة 5 دقائق كل 25 دقيقة\n• مراجعة درس اليوم: 20 دقيقة\n\n🌙 المساء:\n• وقت القراءة الحرة: 20 دقيقة\n• النوم المبكر قبل 9 مساءً\n\nهل تريد تعديل هذا الجدول حسب عمر ابنك؟',
  },
];

const GENERIC = 'شكراً على سؤالك! 😊\n\nبناءً على بيانات أبنائك في المنصة، يبدو أن محمداً يسير بخطى جيدة. أنصح بالتركيز على:\n• المراجعة المنتظمة بدلاً من المكثفة\n• التشجيع المستمر وتقدير الجهد\n• التواصل مع المعلمين عبر منصة الياقوت\n\nهل لديك سؤال أكثر تحديداً حول أداء أحد أبنائك؟';

const CAPABILITIES = [
  'تحليل مستوى أبنائك أكاديمياً',
  'اقتراح خطط مراجعة مخصصة',
  'نصائح لتعزيز الدافعية',
  'التعامل مع صعوبات التعلم',
  'إدارة وقت المذاكرة',
  'الدعم النفسي لولي الأمر',
];

export default function ParentAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const now = () => new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' });

  const getAIResponse = (text: string): string => {
    const lower = text.toLowerCase();
    for (const r of AI_RESPONSES) {
      if (r.keywords.some(k => lower.includes(k) || text.includes(k))) return r.response;
    }
    return GENERIC;
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: nextId.current++, from:'user', text: text.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: Message = { id: nextId.current++, from:'ai', text: getAIResponse(text), time: now() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const reset = () => { setMessages([INITIAL_MSG]); setInput(''); setIsTyping(false); };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ display:'flex', height:'calc(100vh - 58px)', fontFamily:"'Cairo',sans-serif" }}>

        {/* Left sidebar */}
        <div style={{ width:280, flexShrink:0, background:C.card, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', padding:20, gap:16, overflowY:'auto' }}>
          {/* AI avatar */}
          <div style={{ textAlign:'center', padding:'10px 0 16px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:80, height:80, borderRadius:24, background:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(13,30,58,0.35)' }}>🤖</div>
            <p style={{ color:C.text, fontWeight:900, fontSize:16, marginBottom:3 }}>مساعد الياقوت الذكي</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.green }} />
              <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>متصل دائماً</span>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <p style={{ color:C.sub, fontSize:11, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>ما يمكنني مساعدتك به</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {CAPABILITIES.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:C.gold, fontSize:12 }}>✓</span>
                  <span style={{ color:C.text, fontSize:12 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New chat button */}
          <button onClick={reset} style={{ padding:'10px', borderRadius:12, border:`1.5px solid ${C.goldBdr}`, background:C.goldBg, color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            ✨ محادثة جديدة
          </button>

          {/* Quick questions */}
          <div>
            <p style={{ color:C.sub, fontSize:11, fontWeight:700, marginBottom:8 }}>أسئلة سريعة</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`,
                  background:C.bg, color:C.text, fontSize:11.5, fontWeight:600,
                  cursor:'pointer', textAlign:'right', lineHeight:1.5,
                  fontFamily:"'Cairo',sans-serif", transition:'all 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold; (e.currentTarget as HTMLButtonElement).style.background = C.goldBg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.background = C.bg; }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Chat header */}
          <div style={{ padding:'14px 20px', background:C.card, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>مساعد الياقوت الذكي</p>
              <p style={{ color:C.green, fontSize:11.5, fontWeight:600 }}>🟢 متصل • يرد فوراً</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16, background:'#FDFAF4' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display:'flex', gap:10, flexDirection: msg.from==='user' ? 'row-reverse' : 'row', alignItems:'flex-end' }}>
                {/* Avatar */}
                <div style={{
                  width:36, height:36, borderRadius:'50%', flexShrink:0,
                  background: msg.from==='ai' ? `linear-gradient(135deg,${C.navy},#2D3561)` : C.goldGrad,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: msg.from==='ai' ? 18 : 13, color:'#fff', fontWeight:900,
                }}>
                  {msg.from==='ai' ? '🤖' : 'و'}
                </div>
                {/* Bubble */}
                <div style={{ maxWidth:'70%' }}>
                  <div style={{
                    padding:'12px 16px', borderRadius: msg.from==='ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    background: msg.from==='ai' ? C.card : C.goldGrad,
                    color: msg.from==='ai' ? C.text : '#fff',
                    fontSize:13, lineHeight:1.8, boxShadow:'0 2px 8px rgba(0,0,0,0.07)',
                    border: msg.from==='ai' ? `1px solid ${C.border}` : 'none',
                    whiteSpace:'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                  <p style={{ color:C.dim, fontSize:10, marginTop:4, textAlign: msg.from==='user' ? 'left' : 'right' }}>{msg.time}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🤖</div>
                <div style={{ padding:'12px 16px', borderRadius:'4px 16px 16px 16px', background:C.card, border:`1px solid ${C.border}`, display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:C.gold, animation:`bounce 1s ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'14px 20px', background:C.card, borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter للسطر الجديد)"
                rows={1}
                style={{
                  flex:1, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`,
                  background:C.bg, color:C.text, fontSize:13, outline:'none',
                  fontFamily:"'Cairo',sans-serif", resize:'none', lineHeight:1.6,
                  maxHeight:100, overflowY:'auto',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = C.gold; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || isTyping} style={{
                width:44, height:44, borderRadius:12, border:'none',
                background: input.trim() && !isTyping ? C.goldGrad : '#E5E7EB',
                color: input.trim() && !isTyping ? '#fff' : C.dim,
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                flexShrink:0, boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(197,147,65,0.35)' : 'none',
                transition:'all 0.2s',
              }}>
                ↑
              </button>
            </div>
            <p style={{ color:C.dim, fontSize:10.5, marginTop:6, textAlign:'center' }}>مدعوم بالذكاء الاصطناعي • منصة الياقوت التعليمية</p>
          </div>
        </div>

        <style>{`
          @keyframes bounce {
            0%,80%,100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    </ParentLayout>
  );
}
