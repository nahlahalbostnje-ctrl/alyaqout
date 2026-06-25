import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, AnimatePresence,
  useInView, useScroll, useMotionValue, useSpring, useTransform,
} from 'framer-motion';
import api from '../services/axios';
import { useLenis } from '../hooks/useLenis';
import BrandLogo from '../components/BrandLogo';

/* ── Types ──────────────────────────────────── */
interface Country    { id: number; name: string; }
interface Faq        { id: number; question: string; answer: string; }
interface SocialLink { id: number; platform: string; url: string; }

/* ── Design Tokens ──────────────────────────── */
const C = {
  gold:    '#C59341',
  goldLt:  '#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:  'rgba(197,147,65,0.08)',
  goldBdr: 'rgba(197,147,65,0.22)',
  navy:    '#0D1E3A',
  navy2:   '#142a4e',
  navy3:   '#0a1730',
  bg:      '#F5EDD8',
  card:    '#FFFFFF',
  text:    '#1B2038',
  sub:     '#6B7280',
  dim:     '#9CA3AF',
  border:  '#EDE3CE',
  shadow:  '0 2px 16px rgba(0,0,0,0.06)',
  sub2:    '#A1B1CC',
} as const;

const FONT = "'Cairo','Tajawal',sans-serif";

/* ── Constants ──────────────────────────────── */
const SUBJECTS = ['رياضيات','علوم','لغة عربية','لغة إنجليزية','فيزياء','كيمياء','أحياء','تاريخ','جغرافيا','تربية إسلامية'];

const ARAB_COUNTRIES = [
  { flag:'🇵🇸', name:'فلسطين' },
  { flag:'🇯🇴', name:'الأردن' },
  { flag:'🇪🇬', name:'مصر' },
  { flag:'🇸🇦', name:'السعودية' },
  { flag:'🇦🇪', name:'الإمارات' },
  { flag:'🇰🇼', name:'الكويت' },
  { flag:'🇶🇦', name:'قطر' },
  { flag:'🇧🇭', name:'البحرين' },
  { flag:'🇴🇲', name:'عُمان' },
  { flag:'🇮🇶', name:'العراق' },
  { flag:'🇸🇾', name:'سوريا' },
  { flag:'🇱🇧', name:'لبنان' },
  { flag:'🇾🇪', name:'اليمن' },
  { flag:'🇱🇾', name:'ليبيا' },
  { flag:'🇸🇩', name:'السودان' },
  { flag:'🇲🇦', name:'المغرب' },
  { flag:'🇹🇳', name:'تونس' },
  { flag:'🇩🇿', name:'الجزائر' },
];

const FEATURES = [
  { icon: '🏆', title: 'دوري ياقوت للتلعيب',    desc: 'محرك Gamification يمنح نقاطاً على كل إنجاز مع تحديات 1v1 ولوحة صدارة حية تُشعل روح التنافس' },
  { icon: '📊', title: 'تتبع التقدم الدراسي',    desc: 'تقارير تحليلية شهرية لولي الأمر عبر واتساب — تشمل الحضور والدرجات ونقاط القوة والضعف' },
  { icon: '🤖', title: 'بوت ذكي مساعد 24/7',     desc: 'مساعد Claude AI يُقدّم تلميحات إرشادية بدل الإجابات الجاهزة لتنمية التفكير المستقل' },
  { icon: '📡', title: 'حصص مباشرة تفاعلية',     desc: 'بث عالي الجودة عبر Agora.io مع تسجيل تلقائي وتتبع الحضور لحظةً بلحظة' },
];


const STEPS = [
  { num: '01', title: 'احجز مكانك',  desc: 'أرسل بياناتك عبر نموذج التسجيل البسيط في دقيقتين فقط' },
  { num: '02', title: 'تواصل معنا',  desc: 'فريقنا يتواصل معك لتحديد المستوى والمادة والموعد المناسب' },
  { num: '03', title: 'ابدأ التعلّم', desc: 'انضم لفصلك المباشر وانطلق نحو التفوق مع أفضل المعلمين' },
];

const STATIC_FAQS: Faq[] = [
  { id:1, question:'كيف يتم التحقق من الهوية عند التسجيل؟',
    answer:'يصلك رمز OTP فوري عبر واتساب عند التسجيل أو تسجيل الدخول — بدون كلمة سر، لضمان أمان حسابك وسهولة الوصول.' },
  { id:2, question:'هل يوجد نسخة مجانية أو تجريبية؟',
    answer:'نعم، تحصل على حصة تجريبية مجانية كاملة مع معلم متخصص بدون التزام أو بيانات بنكية مسبقة.' },
  { id:3, question:'كيف يتم الدفع وما طرق السداد المتاحة؟',
    answer:'ندعم Visa / Mastercard والمدى وApple Pay وحوالات واتساب لبعض الدول — جميع المعاملات مشفّرة وآمنة.' },
  { id:4, question:'هل تُسجَّل الحصص المباشرة؟',
    answer:'نعم، كل حصة تُسجَّل تلقائياً عبر Agora Cloud Recording وتبقى متاحة لمراجعتها 90 يوماً للطالب ولولي الأمر.' },
  { id:5, question:'كيف يتم التواصل بين الطالب والمعلم وولي الأمر؟',
    answer:'نظام الرسائل يعمل على Firebase Realtime Database — مراسلة فورية داخل المنصة مع إشعارات للجميع عند وصول رسائل جديدة.' },
  { id:6, question:'ما نظام النقاط ودوري ياقوت؟',
    answer:'يكسب الطالب نقاطاً على كل حضور وواجب واختبار، ويتنافس في بطولات 1v1 على لوحة الصدارة الحية للحصول على جوائز فعلية.' },
  { id:7, question:'ما هو البوت الذكي وماذا يفعل زر الطوارئ؟',
    answer:'البوت مدعوم بـ Claude AI ويُقدّم مفاتيح تفكير بدل الإجابات الجاهزة. زر الطوارئ يُنبّه المشرف الأكاديمي فوراً عند تعثّر الطالب.' },
];

const STATS = [
  { value:500, suffix:'+', label:'طالب مسجّل' },
  { value:50,  suffix:'+', label:'معلم محترف'  },
  { value:10,  suffix:'+', label:'دولة عربية'  },
  { value:98,  suffix:'%', label:'رضا الطلاب'  },
];

/* ── Easings & Variants ──────────────────────── */
const SP  = [0.16,1,0.3,1]     as const;
const POP = [0.34,1.56,0.64,1] as const;
const stagger  = { hidden:{}, visible:{ transition:{ staggerChildren:0.1, delayChildren:0.05 } } };
const cardItem = { hidden:{ opacity:0, y:28, scale:0.96 }, visible:{ opacity:1, y:0, scale:1, transition:{ duration:0.6, ease:SP } } };
const fadeUp   = { hidden:{ opacity:0, y:32 }, visible:{ opacity:1, y:0, transition:{ duration:0.7, ease:SP } } };
const fadeIn   = { hidden:{ opacity:0 }, visible:{ opacity:1, transition:{ duration:0.6 } } };

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════ */

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div className="fixed top-0 left-0 right-0 z-[9999] origin-left"
      style={{ height:2, scaleX:scrollYProgress,
        background:`linear-gradient(90deg,${C.navy},${C.gold},${C.goldLt},${C.gold},${C.navy})` }} />
  );
}

function Counter({ target, suffix }: { target:number; suffix:string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once:true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now(), dur = 2200;
    const tick = (now:number) => {
      const p = Math.min((now-t0)/dur,1);
      setN(Math.round((1-Math.pow(1-p,3.5))*target));
      if (p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

function WordReveal({ text, delay=0 }: { text:string; delay?:number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once:true });
  return (
    <span ref={ref}>
      {text.split(' ').map((w,i) => (
        <motion.span key={i}
          initial={{ opacity:0, y:20, filter:'blur(6px)' }}
          animate={inView ? { opacity:1, y:0, filter:'blur(0px)' } : {}}
          transition={{ duration:0.6, ease:SP, delay:delay+i*0.1 }}
          style={{ display:'inline-block', marginInlineEnd:'0.28em' }}>
          {w}
        </motion.span>
      ))}
    </span>
  );
}

function MagBtn({ children, style={}, onClick, className='' }: {
  children:ReactNode; style?:CSSProperties; onClick?:()=>void; className?:string;
}) {
  const bx=useMotionValue(0), by=useMotionValue(0);
  const sx=useSpring(bx,{stiffness:180,damping:14}), sy=useSpring(by,{stiffness:180,damping:14});
  return (
    <motion.div style={{ x:sx, y:sy, display:'inline-block' }}
      onMouseMove={e=>{ const r=e.currentTarget.getBoundingClientRect(); bx.set((e.clientX-r.left-r.width/2)*0.28); by.set((e.clientY-r.top-r.height/2)*0.28); }}
      onMouseLeave={()=>{ bx.set(0); by.set(0); }}>
      <button className={className} style={style} onClick={onClick}>{children}</button>
    </motion.div>
  );
}

function TiltCard({ children, className='', style={} }: { children:ReactNode; className?:string; style?:CSSProperties }) {
  const ref=useRef<HTMLDivElement>(null);
  const xv=useMotionValue(0), yv=useMotionValue(0);
  const rX=useTransform(yv,[-0.5,0.5],[5,-5]), rY=useTransform(xv,[-0.5,0.5],[-5,5]);
  const srX=useSpring(rX,{stiffness:200,damping:20}), srY=useSpring(rY,{stiffness:200,damping:20});
  const [glow,setGlow]=useState({x:50,y:50,on:false});
  return (
    <motion.div ref={ref} className={className}
      style={{ rotateX:srX, rotateY:srY, transformPerspective:1000, ...style }}
      onMouseMove={e=>{ const r=ref.current?.getBoundingClientRect(); if(!r)return; const nx=(e.clientX-r.left)/r.width,ny=(e.clientY-r.top)/r.height; xv.set(nx-0.5); yv.set(ny-0.5); setGlow({x:nx*100,y:ny*100,on:true}); }}
      onMouseLeave={()=>{ xv.set(0); yv.set(0); setGlow(g=>({...g,on:false})); }}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{ opacity:glow.on?1:0, background:`radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(197,147,65,0.16), transparent 55%)`, transition:'opacity 0.3s' }} />
      {children}
    </motion.div>
  );
}

function GemFacets({ opacity=0.07 }: { opacity?:number }) {
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"
      style={{ position:'absolute', right:-60, top:'50%', transform:'translateY(-55%)', width:420, height:420, opacity, pointerEvents:'none', zIndex:1 }}>
      <polygon points="250,20 450,130 450,370 250,480 50,370 50,130" fill="none" stroke="#C59341" strokeWidth="1.2"/>
      <polygon points="250,80 390,200 390,300 250,420 110,300 110,200" fill="none" stroke="#C59341" strokeWidth="1"/>
      <polygon points="250,140 340,230 340,270 250,360 160,270 160,230" fill="none" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="250" y1="20"  x2="250" y2="140" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="450" y1="130" x2="340" y2="230" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="450" y1="370" x2="340" y2="270" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="250" y1="480" x2="250" y2="360" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="50"  y1="370" x2="160" y2="270" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="50"  y1="130" x2="160" y2="230" stroke="#C59341" strokeWidth="0.8"/>
      <line x1="390" y1="200" x2="110" y2="200" stroke="#C59341" strokeWidth="0.5"/>
      <line x1="390" y1="300" x2="110" y2="300" stroke="#C59341" strokeWidth="0.5"/>
    </svg>
  );
}

function WaveDivider({ from, to }: { from:string; to:string }) {
  return (
    <div style={{ lineHeight:0, background:from }}>
      <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }} preserveAspectRatio="none">
        <path fill={to} d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z"/>
      </svg>
    </div>
  );
}

function SectionBadge({ text }: { text:string }) {
  return (
    <span style={{ display:'inline-block', padding:'5px 16px', borderRadius:99,
      background:C.goldBg, border:`1px solid ${C.goldBdr}`,
      color:C.gold, fontSize:12, fontWeight:700, marginBottom:14 }}>
      ✦ {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function LandingPage() {
  useLenis();

  const [countries,       setCountries]       = useState<Country[]>([]);
  const [navCountry,      setNavCountry]      = useState(0);
  const [faqs,            setFaqs]            = useState<Faq[]>([]);
  const [social,          setSocial]          = useState<SocialLink[]>([]);
  const [openFaq,         setOpenFaq]         = useState<number|null>(null);
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [source,          setSource]          = useState<'book_now'|'free_class'>('book_now');
  const [submitting,      setSubmitting]      = useState(false);
  const [success,         setSuccess]         = useState('');
  const [scrolled,        setScrolled]        = useState(false);
  const [form, setForm] = useState({ country_id:'', student_name:'', phone:'', school:'', region:'', subjects:[] as string[] });

  useEffect(() => {
    api.get('/public/countries').then(({data})=>{ const l:Country[]=data.countries??[]; setCountries(l); }).catch(()=>{});
    api.get('/public/faqs').then(({data})=>setFaqs(data.faqs??[])).catch(()=>{});
    api.get('/public/social').then(({data})=>setSocial(data.links??[])).catch(()=>{});
    const onScroll=()=>setScrolled(window.scrollY>8);
    window.addEventListener('scroll',onScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',onScroll);
  }, []);

  const openModal=(src:'book_now'|'free_class')=>{
    setSource(src); setSuccess('');
    setForm({country_id:String(countries[0]?.id??''),student_name:'',phone:'',school:'',region:'',subjects:[]});
    setModalOpen(true);
  };
  const toggleSubject=(s:string)=>setForm(f=>({...f,subjects:f.subjects.includes(s)?f.subjects.filter(x=>x!==s):[...f.subjects,s]}));
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); setSubmitting(true);
    try { const{data}=await api.post('/leads',{...form,country_id:Number(form.country_id),source}); setSuccess(data.message); }
    catch { setSuccess('حدث خطأ، يرجى المحاولة مرة أخرى.'); }
    finally { setSubmitting(false); }
  };
  const socialIcon=(p:string)=>({facebook:'f',instagram:'ig',twitter:'x',youtube:'YT',tiktok:'TK',whatsapp:'WA',telegram:'TG',linkedin:'in'})[p.toLowerCase()]??p[0].toUpperCase();
  const displayFaqs = faqs.length ? faqs : STATIC_FAQS;

  /* ─── Render ─────────────────────────────── */
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily:FONT }} dir="rtl">
      <ProgressBar />

      {/* ════════ NAVBAR ════════ */}
      <nav style={{
        position:'fixed', top:0, insetInline:0, zIndex:50,
        background:C.navy,
        boxShadow: scrolled ? '0 4px 28px rgba(13,30,58,0.45)' : 'none',
        transition:'box-shadow 0.35s ease',
      }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:68 }}>

          {/* Logo + Country selector (right side) */}
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <BrandLogo size={56} style={{ borderRadius:12 }} />
            </div>

            {/* Country indicator — right side, next to logo */}
            <div className="hidden md:block" style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:1 }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 0 2px rgba(34,197,94,0.3)', flexShrink:0 }} />
                <select
                  value={navCountry}
                  onChange={e => setNavCountry(Number(e.target.value))}
                  style={{
                    background:'rgba(255,255,255,0.07)',
                    border:`1.5px solid ${C.goldBdr}`,
                    borderRadius:11,
                    color:C.gold,
                    padding:'8px 14px',
                    fontSize:13.5,
                    fontWeight:800,
                    fontFamily:FONT,
                    cursor:'pointer',
                    outline:'none',
                    appearance:'none',
                    WebkitAppearance:'none',
                    paddingLeft:32,
                  }}
                >
                  {ARAB_COUNTRIES.map((c, i) => (
                    <option key={i} value={i} style={{ background:C.navy, color:'#fff' }}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:C.gold, fontSize:13, pointerEvents:'none' }}>
                  {ARAB_COUNTRIES[navCountry].flag}
                </span>
                <span style={{ position:'absolute', left:28, top:'50%', transform:'translateY(-50%)', color:'rgba(197,147,65,0.7)', fontSize:10, pointerEvents:'none' }}>▼</span>
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[['المميزات','#features'],['الأسئلة الشائعة','#faqs'],['كيف نعمل؟','#steps']].map(([l,h])=>(
              <a key={h} href={h} style={{ fontSize:13.5, fontWeight:600, color:C.sub2, textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e=>((e.target as HTMLElement).style.color='#fff')}
                onMouseLeave={e=>((e.target as HTMLElement).style.color=C.sub2)}>{l}</a>
            ))}
          </div>

          {/* Left actions */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>openModal('book_now')}
              style={{ background:C.goldGrad, border:'none', borderRadius:12, color:'#fff', fontWeight:800, fontSize:13.5, fontFamily:FONT, padding:'10px 22px', cursor:'pointer', boxShadow:`0 4px 18px rgba(197,147,65,0.4)`, transition:'transform 0.2s,box-shadow 0.2s' }}
              onMouseEnter={e=>{ const el=e.currentTarget; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 8px 26px rgba(197,147,65,0.55)'; }}
              onMouseLeave={e=>{ const el=e.currentTarget; el.style.transform='translateY(0)'; el.style.boxShadow='0 4px 18px rgba(197,147,65,0.4)'; }}>
              تسجيل الدخول
            </button>
            {/* Hamburger */}
            <button className="md:hidden" onClick={()=>setMenuOpen(m=>!m)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:6, display:'flex', flexDirection:'column', gap:5 }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:22, height:2, background:'#fff', borderRadius:2, transition:'all 0.22s',
                  ...(menuOpen ? { transform:i===0?'rotate(45deg) translate(5px,5px)':i===2?'rotate(-45deg) translate(5px,-5px)':'scaleX(0)' } : {}) }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
              transition={{ duration:0.28, ease:SP }} style={{ overflow:'hidden', borderTop:`1px solid rgba(197,147,65,0.15)` }}>
              <div style={{ padding:'12px 0', display:'flex', flexDirection:'column', gap:2 }}>
                {[['المميزات','#features'],['الأسئلة الشائعة','#faqs'],['كيف نعمل؟','#steps']].map(([l,h])=>(
                  <a key={h} href={h} onClick={()=>setMenuOpen(false)}
                    style={{ padding:'12px 24px', color:'#fff', textDecoration:'none', fontSize:14, fontWeight:600, display:'block' }}>{l}</a>
                ))}
                <div style={{ padding:'8px 24px 16px' }}>
                  <Link to="/login" style={{ display:'block', background:C.goldGrad, borderRadius:12, color:'#fff', fontWeight:800, fontSize:14, padding:'12px 20px', textAlign:'center', textDecoration:'none' }}>
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ════════ HERO ════════ */}
      <section style={{
        position:'relative', minHeight:'100vh',
        background:`radial-gradient(ellipse at 50% 0%, ${C.navy2} 0%, ${C.navy} 55%, ${C.navy3} 100%)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        overflow:'hidden', paddingTop:68,
      }}>
        <GemFacets opacity={0.07} />
        {/* Gold radial glow */}
        <div style={{ position:'absolute', top:'38%', left:'50%', transform:'translate(-50%,-50%)', width:650, height:650, borderRadius:'50%', background:`radial-gradient(circle, rgba(197,147,65,0.18) 0%, rgba(197,147,65,0.07) 45%, transparent 70%)`, pointerEvents:'none', zIndex:0 }} />

        <motion.div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:820, padding:'80px 24px 100px', width:'100%' }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7, ease:SP, delay:0.3 }}
            style={{ marginBottom:32 }}>
            <span style={{ padding:'7px 20px', borderRadius:99, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontSize:12.5, fontWeight:700, letterSpacing:'0.06em' }}>
              ● منصة التعليم الأولى عربياً
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div initial={{ scale:0.5,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ duration:1.1, ease:POP, delay:0.45 }}
            style={{ marginBottom:40, display:'inline-block', position:'relative' }}>
            {/* Circular glow disc behind the logo — decorative only, does NOT clip the image */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:380, height:380, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(197,147,65,0.22) 0%, rgba(197,147,65,0.08) 55%, transparent 78%)',
              boxShadow:'0 0 110px rgba(197,147,65,0.65), 0 0 220px rgba(197,147,65,0.25), 0 20px 60px rgba(0,0,0,0.35)',
              pointerEvents:'none', zIndex:0 }} />
            {/* Outer animated ring */}
            <motion.div animate={{ scale:[1,1.08,1], opacity:[0.38,0.12,0.38] }} transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut' }}
              style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:430, height:430, borderRadius:'50%', border:'2px solid rgba(197,147,65,0.5)', pointerEvents:'none', zIndex:0 }} />
            {/* Inner ring */}
            <motion.div animate={{ scale:[1,1.05,1], opacity:[0.25,0.07,0.25] }} transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut', delay:0.6 }}
              style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:380, height:380, borderRadius:'50%', border:'1.5px solid rgba(197,147,65,0.35)', pointerEvents:'none', zIndex:0 }} />
            {/* Logo image — no circular clip, shown complete with contain */}
            <BrandLogo style={{ position:'relative', zIndex:1, display:'block', width:420, height:'auto', filter:'drop-shadow(0 0 50px rgba(197,147,65,0.65)) drop-shadow(0 0 110px rgba(197,147,65,0.28)) drop-shadow(0 16px 32px rgba(0,0,0,0.35))' }} size={420} />
          </motion.div>

          {/* Heading */}
          <h1 style={{ fontSize:'clamp(2rem,4.5vw,4.2rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.03em', color:'#fff', marginBottom:20, fontFamily:FONT }}>
            {[{w:'تعلّم',g:false},{w:'مع',g:false},{w:'أفضل',g:true},{w:'المعلمين',g:true}].map(({w,g},i)=>(
              <motion.span key={i}
                initial={{ opacity:0,y:40,filter:'blur(12px)' }}
                animate={{ opacity:1,y:0,filter:'blur(0px)' }}
                transition={{ duration:0.85, ease:SP, delay:0.8+i*0.18 }}
                style={{ display:'inline-block', marginInlineEnd:'0.22em', ...(g?{ background:C.goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }:{ color:'#fff' }) }}>
                {w}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8, ease:SP, delay:1.5 }}
            style={{ fontSize:16, lineHeight:1.8, color:C.sub2, maxWidth:520, margin:'0 auto 44px', fontWeight:400 }}>
            اكتشف متعة التفوق مع فصول مباشرة احترافية، بوت AI مساعد، ودوري تنافسي
            — ونظام متابعة ذكي لولي الأمر في كل خطوة
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.8, ease:SP, delay:1.7 }}
            style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <MagBtn className="btn-shimmer rounded-2xl"
              style={{ color:'#fff', padding:'16px 42px', fontSize:16, fontWeight:800, fontFamily:FONT }}
              onClick={()=>openModal('book_now')}>
              📚 احجز مكانك الآن
            </MagBtn>
            <button onClick={()=>openModal('free_class')}
              style={{ padding:'16px 42px', fontSize:16, fontWeight:700, fontFamily:FONT, borderRadius:16, border:'1.5px solid rgba(255,255,255,0.22)', background:'rgba(255,255,255,0.06)', color:'#fff', cursor:'pointer', backdropFilter:'blur(8px)', transition:'border-color 0.2s,background 0.2s' }}
              onMouseEnter={e=>{ const el=e.currentTarget; el.style.borderColor=C.gold; el.style.background=C.goldBg; }}
              onMouseLeave={e=>{ const el=e.currentTarget; el.style.borderColor='rgba(255,255,255,0.22)'; el.style.background='rgba(255,255,255,0.06)'; }}>
              🎁 اطلب حصة مجانية
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Wave: navy → cream */}
      <WaveDivider from={C.navy3} to={C.bg} />

      {/* ════════ STATS FLOATING CARD ════════ */}
      <div style={{ background:C.bg }}>
        <div style={{ maxWidth:1024, margin:'0 auto', padding:'0 24px' }}>
          <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once:true }}
            style={{ background:C.card, borderRadius:20, boxShadow:`0 12px 60px rgba(13,30,58,0.12)`, border:`1px solid ${C.border}`, display:'grid', gridTemplateColumns:'repeat(4,1fr)', marginTop:-60, position:'relative', zIndex:10 }}>
            {STATS.map((s,i)=>(
              <div key={i} style={{ padding:'32px 16px', textAlign:'center', borderLeft:i<3?`1px solid ${C.border}`:'none' }}>
                <p style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:900, lineHeight:1, background:C.goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontFamily:FONT }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p style={{ fontSize:13, color:C.sub, fontWeight:600, marginTop:8 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>


      {/* Wave: cream → navy */}
      <WaveDivider from={C.bg} to={C.navy} />

      {/* ════════ FEATURES (Navy Island) ════════ */}
      <section id="features" style={{ background:C.navy, padding:'72px 0', position:'relative', overflow:'hidden' }}>
        <GemFacets opacity={0.05} />
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>
          <motion.div style={{ textAlign:'center', marginBottom:56 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.4 }}>
            <SectionBadge text="لماذا ياقوت؟" />
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.025em', margin:'0 0 12px' }}>
              <WordReveal text="مميزات تجعل الفرق" />
            </h2>
            <p style={{ color:C.sub2, fontSize:15, lineHeight:1.7, maxWidth:440, margin:'0 auto' }}>
              تجربة تعليمية متكاملة مصممة لتحقيق أفضل النتائج الأكاديمية
            </p>
          </motion.div>
          <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:18 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.1 }}>
            {FEATURES.map((f,i)=>(
              <motion.div key={i} variants={cardItem}>
                <TiltCard style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(197,147,65,0.16)', borderRadius:20, padding:'32px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                  <div style={{ width:60, height:60, borderRadius:16, margin:'0 auto 18px', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:`0 6px 22px rgba(197,147,65,0.35)` }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize:15.5, fontWeight:800, color:'#fff', marginBottom:10 }}>{f.title}</h3>
                  <p style={{ fontSize:13, lineHeight:1.75, color:C.sub2 }}>{f.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Wave: navy → cream */}
      <WaveDivider from={C.navy} to={C.bg} />

      {/* ════════ STEPS ════════ */}
      <section id="steps" style={{ background:C.bg, padding:'72px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <motion.div style={{ textAlign:'center', marginBottom:60 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.4 }}>
            <SectionBadge text="كيف نعمل؟" />
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:900, color:C.text, letterSpacing:'-0.025em', margin:0 }}>
              <WordReveal text="3 خطوات فقط للانطلاق" />
            </h2>
          </motion.div>

          <div style={{ position:'relative' }}>
            <div className="hidden md:block" style={{ position:'absolute', top:34, right:'16.6%', left:'16.6%', borderTop:`2px dashed rgba(197,147,65,0.38)`, zIndex:0 }} />
            <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32, position:'relative', zIndex:1 }}
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.25 }}>
              {STEPS.map((s,i)=>(
                <motion.div key={i} variants={cardItem} style={{ textAlign:'center' }}>
                  <div style={{ width:68, height:68, borderRadius:'50%', border:`2.5px solid ${C.gold}`, background:C.bg, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color:C.gold, fontFamily:FONT, marginBottom:20 }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:10 }}>{s.title}</h3>
                  <p style={{ fontSize:13.5, lineHeight:1.75, color:C.sub }}>{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div style={{ textAlign:'center', marginTop:52 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <MagBtn style={{ background:C.navy, border:'none', borderRadius:16, color:'#fff', fontWeight:800, fontSize:15, fontFamily:FONT, padding:'16px 44px', cursor:'pointer', boxShadow:`0 8px 32px rgba(13,30,58,0.3)` }}
              onClick={()=>openModal('book_now')}>
              ابدأ رحلتك الآن ←
            </MagBtn>
          </motion.div>
        </div>
      </section>

      {/* ════════ FAQs ════════ */}
      <section id="faqs" style={{ background:C.bg, padding:'0 0 80px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px' }}>
          <motion.div style={{ textAlign:'center', marginBottom:48 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.4 }}>
            <SectionBadge text="لديك سؤال؟" />
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:900, color:C.text, letterSpacing:'-0.025em', margin:0 }}>
              <WordReveal text="الأسئلة الشائعة" />
            </h2>
          </motion.div>
          <motion.div style={{ display:'flex', flexDirection:'column', gap:10 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.1 }}>
            {displayFaqs.map((faq,i)=>(
              <motion.div key={faq.id} variants={cardItem}
                style={{ background:C.card, borderRadius:16, overflow:'hidden', border:`1px solid ${openFaq===i ? C.goldBdr : C.border}`, transition:'border-color 0.2s' }}>
                <button style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', textAlign:'right', background:'transparent', border:'none', cursor:'pointer', fontFamily:FONT }}
                  onClick={()=>setOpenFaq(openFaq===i ? null : i)}>
                  <span style={{ fontSize:14.5, fontWeight:700, color:C.text, lineHeight:1.5 }}>{faq.question}</span>
                  <motion.div
                    animate={{ rotate:openFaq===i ? 135 : 0 }}
                    transition={{ duration:0.3, ease:SP }}
                    style={{ width:30, height:30, borderRadius:'50%', flexShrink:0, marginInlineStart:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:300, lineHeight:1, transition:'background 0.25s,border-color 0.25s,color 0.25s',
                      background:openFaq===i ? C.goldGrad : 'transparent',
                      border:`1.5px solid ${openFaq===i ? C.gold : C.border}`,
                      color:openFaq===i ? '#fff' : C.gold,
                    }}>+</motion.div>
                </button>
                <AnimatePresence>
                  {openFaq===i && (
                    <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.32, ease:SP }}>
                      <p style={{ padding:'10px 22px 22px', fontSize:13.5, lineHeight:1.82, color:C.sub, borderTop:`1px solid ${C.border}` }}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ CTA BAND ════════ */}
      <section style={{ background:C.bg, padding:'0 24px 80px' }}>
        <motion.div style={{ maxWidth:1120, margin:'0 auto', background:`linear-gradient(135deg,${C.gold},#E9C988,${C.goldLt})`, borderRadius:28, padding:'64px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true, amount:0.4 }}>
          <motion.div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', width:'40%' }}
            animate={{ x:['-100%','350%'] }} transition={{ duration:2.8, repeat:Infinity, repeatDelay:3, ease:'easeInOut' }} />
          <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.6rem)', fontWeight:900, color:C.navy, marginBottom:14, letterSpacing:'-0.02em', position:'relative', zIndex:1 }}>
            <WordReveal text="جاهز للانطلاق نحو التفوق؟" />
          </h2>
          <p style={{ fontSize:15.5, color:'rgba(13,30,58,0.65)', marginBottom:36, lineHeight:1.7, fontWeight:400, position:'relative', zIndex:1 }}>
            سجّل الآن واحصل على حصتك التجريبية المجانية مع أفضل المعلمين
          </p>
          <MagBtn style={{ background:C.navy, border:'none', borderRadius:16, color:'#fff', fontWeight:800, fontSize:15, fontFamily:FONT, padding:'16px 48px', cursor:'pointer', boxShadow:`0 12px 40px rgba(13,30,58,0.4)`, position:'relative', zIndex:1 }}
            onClick={()=>openModal('free_class')}>
            🎁 اطلب حصتك المجانية
          </MagBtn>
        </motion.div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ background:C.navy, padding:'52px 24px 36px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <motion.div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:28, marginBottom:36 }}
            variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once:true }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <BrandLogo size={46} style={{ borderRadius:12 }} />
            </div>
            {social.length>0 && (
              <div style={{ display:'flex', gap:10 }}>
                {social.map(s=>(
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ width:42, height:42, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${C.goldBdr}`, color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:800, textDecoration:'none', transition:'border-color 0.2s,color 0.2s' }}
                    onMouseEnter={e=>{ const el=e.currentTarget; el.style.borderColor=C.gold; el.style.color=C.gold; }}
                    onMouseLeave={e=>{ const el=e.currentTarget; el.style.borderColor=C.goldBdr; el.style.color='rgba(255,255,255,0.5)'; }}>
                    {socialIcon(s.platform)}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
          <div style={{ borderTop:`1px solid rgba(197,147,65,0.15)`, marginBottom:24 }} />
          <p style={{ textAlign:'center', fontSize:12.5, color:'rgba(255,255,255,0.2)', fontWeight:400 }}>
            © {new Date().getFullYear()} منصة الياقوت لخدمات التعليم — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>

      {/* ════════ MODAL ════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex:9990, backdropFilter:'blur(18px)', background:`rgba(13,30,58,0.82)` }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}
            onClick={e=>{ if(e.target===e.currentTarget)setModalOpen(false); }}>
            <motion.div className="w-full rounded-3xl"
              style={{ maxWidth:500, maxHeight:'90vh', overflowY:'auto', background:C.card, border:`1px solid ${C.border}`, boxShadow:C.shadow }}
              initial={{ scale:0.82,opacity:0,y:40 }} animate={{ scale:1,opacity:1,y:0 }} exit={{ scale:0.88,opacity:0,y:24 }}
              transition={{ duration:0.38, ease:POP }} dir="rtl">

              <div style={{ padding:'22px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:900, color:C.text }}>{source==='book_now'?'📚 احجز مكانك':'🎁 الحصة المجانية'}</h3>
                  <p style={{ fontSize:13, color:C.sub, marginTop:4 }}>أكمل بياناتك وسنتواصل معك قريباً</p>
                </div>
                <button onClick={()=>setModalOpen(false)} style={{ color:C.dim, fontSize:28, fontWeight:200, lineHeight:1, background:'none', border:'none', cursor:'pointer' }}
                  onMouseEnter={e=>((e.target as HTMLElement).style.color=C.text)}
                  onMouseLeave={e=>((e.target as HTMLElement).style.color=C.dim)}>×</button>
              </div>

              <div style={{ padding:24 }}>
                {success ? (
                  <motion.div style={{ textAlign:'center', padding:'40px 0' }}
                    initial={{ scale:0.7,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ ease:POP }}>
                    <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
                    <p style={{ fontSize:15, fontWeight:700, color:C.text }}>{success}</p>
                    <button onClick={()=>setModalOpen(false)} style={{ marginTop:24, padding:'12px 32px', borderRadius:12, background:C.goldGrad, border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:FONT }}>إغلاق</button>
                  </motion.div>
                ):(
                  <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { label:'الاسم الكامل *', key:'student_name', type:'text', ph:'اسم الطالب الكامل', req:true },
                      { label:'رقم الهاتف *',  key:'phone',        type:'tel',  ph:'07xxxxxxxx',       req:true, ltr:true },
                    ].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:'block', marginBottom:6 }}>{f.label}</label>
                        <input type={f.type} required={f.req} value={form[f.key as keyof typeof form] as string}
                          onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} dir={f.ltr?'ltr':undefined}
                          style={{ width:'100%', height:44, borderRadius:12, padding:'0 14px', border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, fontFamily:FONT, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                          onFocus={e=>(e.currentTarget.style.borderColor=C.gold)} onBlur={e=>(e.currentTarget.style.borderColor=C.border)} />
                      </div>
                    ))}
                    {countries.length>0 && (
                      <div>
                        <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:'block', marginBottom:6 }}>الدولة *</label>
                        <select required value={form.country_id} onChange={e=>setForm(p=>({...p,country_id:e.target.value}))}
                          style={{ width:'100%', height:44, borderRadius:12, padding:'0 14px', border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, fontFamily:FONT, outline:'none', background:'#fff', boxSizing:'border-box' }}>
                          <option value="">اختر الدولة</option>
                          {countries.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {[{label:'المدرسة',key:'school',ph:'اسم المدرسة'},{label:'المنطقة',key:'region',ph:'المنطقة السكنية'}].map(f=>(
                        <div key={f.key}>
                          <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:'block', marginBottom:6 }}>{f.label}</label>
                          <input type="text" value={form[f.key as keyof typeof form] as string} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                            style={{ width:'100%', height:44, borderRadius:12, padding:'0 12px', border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, fontFamily:FONT, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
                            onFocus={e=>(e.currentTarget.style.borderColor=C.gold)} onBlur={e=>(e.currentTarget.style.borderColor=C.border)} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:'block', marginBottom:10 }}>المواد المطلوبة</label>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {SUBJECTS.map(s=>(
                          <button type="button" key={s} onClick={()=>toggleSubject(s)}
                            style={{ padding:'7px 14px', borderRadius:10, fontSize:12.5, fontWeight:600, border:'none', cursor:'pointer', fontFamily:FONT, transition:'all 0.18s',
                              ...(form.subjects.includes(s) ? { background:C.goldGrad, color:'#fff', boxShadow:`0 4px 14px rgba(197,147,65,0.35)` } : { background:'#F3F4F6', color:C.sub }) }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={submitting}
                      style={{ padding:14, borderRadius:13, background:C.goldGrad, border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:submitting?'wait':'pointer', fontFamily:FONT, marginTop:4, opacity:submitting?0.75:1, boxShadow:`0 6px 22px rgba(197,147,65,0.4)` }}>
                      {submitting?'جاري الإرسال...':(source==='book_now'?'احجز الآن ←':'اطلب الحصة المجانية ←')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
