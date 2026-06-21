import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import api from '../services/axios';
import type { AgoraTokenData } from '../features/live/agoraSlice';

const C = {
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1535', navy2: '#1B2038',
  gold: '#C9952A', goldL: '#DDAD50', goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: 'rgba(0,0,0,0.07)',
  red: '#EF4444', green: '#10B981', shadow: '0 2px 12px rgba(0,0,0,0.06)',
};
const font = { fontFamily:"'Cairo',sans-serif" };

function RemoteVideo({ user }: { user: IAgoraRTCRemoteUser }) {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (divRef.current && user.videoTrack) user.videoTrack.play(divRef.current);
    return () => { user.videoTrack?.stop(); };
  }, [user.videoTrack]);
  return (
    <div style={{ position:'relative', borderRadius:12, overflow:'hidden', background:'#1e293b', aspectRatio:'16/9' }}>
      <div ref={divRef} style={{ width:'100%', height:'100%' }} />
      {!user.videoTrack && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#334155' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#475569', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, ...font }}>
            {String(user.uid).slice(-2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveRoomPage() {
  const { channel }     = useParams<{ channel: string }>();
  const [sp]            = useSearchParams();
  const navigate        = useNavigate();
  const classId         = sp.get('classId');

  const clientRef     = useRef<IAgoraRTCClient | null>(null);
  const localCamRef   = useRef<ICameraVideoTrack | null>(null);
  const localMicRef   = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  const [tokenData,   setTokenData]   = useState<AgoraTokenData | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [joined,      setJoined]      = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [micMuted,    setMicMuted]    = useState(false);
  const [camOff,      setCamOff]      = useState(false);
  const [ending,      setEnding]      = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [showBoard,   setShowBoard]   = useState(true);

  useEffect(() => {
    if (!joined) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [joined]);

  const fmtTime = (s: number) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  useEffect(() => {
    if (!classId || !channel) { setError('معلومات الحصة غير مكتملة'); setLoading(false); return; }
    let unmounted = false;
    (async () => {
      try {
        const r    = await api.post('/live/token', { class_id: Number(classId) });
        const data = r.data as AgoraTokenData;
        if (unmounted) return;
        setTokenData(data);
        const client = AgoraRTC.createClient({ mode:'rtc', codec:'vp8' });
        clientRef.current = client;
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'audio') user.audioTrack?.play();
          setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
        });
        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') user.audioTrack?.stop();
          setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? user : u));
        });
        client.on('user-left', user => setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid)));
        await client.join(data.app_id, data.channel, data.token, data.uid);
        if (data.role === 'publisher') {
          const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
          localMicRef.current = mic; localCamRef.current = cam;
          await client.publish([mic, cam]);
          if (localVideoRef.current) cam.play(localVideoRef.current);
        } else {
          api.post(`/live/${classId}/attend`).catch(() => {});
        }
        if (!unmounted) { setJoined(true); setLoading(false); }
      } catch {
        if (!unmounted) { setError('فشل الانضمام للحصة. تأكد من صلاحيات الكاميرا والميكروفون.'); setLoading(false); }
      }
    })();
    return () => { unmounted = true; localCamRef.current?.stop(); localMicRef.current?.stop(); clientRef.current?.leave().catch(() => {}); };
  }, [classId, channel]);

  const toggleMic = useCallback(async () => {
    if (!localMicRef.current) return;
    await localMicRef.current.setEnabled(micMuted); setMicMuted(v => !v);
  }, [micMuted]);

  const toggleCam = useCallback(async () => {
    if (!localCamRef.current) return;
    await localCamRef.current.setEnabled(camOff); setCamOff(v => !v);
  }, [camOff]);

  const leaveRoom = useCallback(async () => {
    setEnding(true);
    try {
      if (tokenData?.role === 'publisher' && classId) await api.post(`/live/${classId}/end`).catch(() => {});
      localCamRef.current?.stop(); localMicRef.current?.stop();
      await clientRef.current?.leave().catch(() => {});
    } finally { navigate(-1); }
  }, [tokenData, classId, navigate]);

  // ── Loading ──
  if (loading) return (
    <div dir="rtl" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, background:C.bg, ...font }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:`3px solid ${C.gold}`, borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:C.gold, fontWeight:600, fontSize:14 }}>جاري الاتصال بالحصة...</p>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div dir="rtl" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, background:C.bg, ...font }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>⚠️</div>
      <p style={{ color:C.navy2, fontWeight:700, fontSize:16 }}>{error}</p>
      <button onClick={()=>navigate(-1)} style={{ padding:'10px 24px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, border:'none', cursor:'pointer', fontSize:14 }}>العودة</button>
    </div>
  );

  const isPublisher = tokenData?.role === 'publisher';
  const totalPart   = remoteUsers.length + 1;

  // ── Room UI ──
  return (
    <div dir="rtl" style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#0f172a', fontFamily:"'Cairo',sans-serif" }}>

      {/* Header */}
      <div style={{ background:C.card, padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${C.border}`, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <button onClick={()=>navigate(-1)} style={{ width:34, height:34, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15 }}>‹</button>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:C.red, background:'rgba(239,68,68,0.1)', padding:'3px 9px', borderRadius:20 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.red, display:'inline-block' }} />
              مباشر الآن
            </span>
          </div>
          <p style={{ color:C.navy2, fontWeight:700, fontSize:14, marginTop:2 }}>{tokenData?.class_title ?? 'الحصة المباشرة'}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:14 }}>👥</span>
          <span style={{ color:C.sub, fontSize:13, fontWeight:600 }}>{totalPart}</span>
        </div>
      </div>

      {/* Main video area */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* Teacher/main video */}
        <div style={{ position:'relative', background:'#1e293b', margin:0 }}>
          {isPublisher ? (
            <div style={{ position:'relative', aspectRatio:'16/9', background:'#1e293b' }}>
              <div ref={localVideoRef} style={{ width:'100%', height:'100%' }} />
              {camOff && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#334155' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#1B2038', fontSize:24, fontWeight:800 }}>أنا</div>
                </div>
              )}
            </div>
          ) : remoteUsers.length > 0 ? (
            <div style={{ aspectRatio:'16/9', background:'#1e293b' }}>
              <RemoteVideo user={remoteUsers[0]} />
            </div>
          ) : (
            <div style={{ aspectRatio:'16/9', background:'#1e293b', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', border:`3px solid ${C.gold}`, borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>بانتظار بدء المعلم...</p>
            </div>
          )}

          {/* Badges */}
          <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:7 }}>
            <span style={{ background:'rgba(239,68,68,0.85)', color:'#fff', fontSize:10.5, fontWeight:700, padding:'4px 10px', borderRadius:20, backdropFilter:'blur(4px)' }}>🔴 مباشر الآن</span>
            <span style={{ background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:10.5, fontWeight:600, padding:'4px 10px', borderRadius:20, backdropFilter:'blur(4px)' }}>📹 {totalPart}</span>
          </div>

          {/* Timer */}
          <div style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:20, backdropFilter:'blur(4px)', fontFamily:'monospace' }}>
            {fmtTime(elapsed)}
          </div>
        </div>

        {/* Student thumbnails row */}
        {remoteUsers.length > 1 && (
          <div style={{ background:'#1e293b', padding:'8px 12px', display:'flex', gap:8, overflowX:'auto' }}>
            {remoteUsers.slice(1).map(u => (
              <div key={String(u.uid)} style={{ flexShrink:0, width:80, borderRadius:10, overflow:'hidden', background:'#334155', aspectRatio:'4/3' }}>
                <RemoteVideo user={u} />
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-around', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          {[
            { label:'رفع اليد', emoji:'✋', action: undefined },
            { label: micMuted ? 'إلغاء الكتم' : 'مايك', emoji: micMuted ? '🔇' : '🎙️', action: isPublisher ? toggleMic : undefined },
            { label: camOff ? 'تشغيل' : 'كاميرا', emoji: camOff ? '📷' : '📹', action: isPublisher ? toggleCam : undefined },
            { label:'الدردشة',  emoji:'💬', action: undefined },
            { label:'المزيد',   emoji:'⋯',  action: undefined },
          ].map((btn,i) => (
            <button key={i} onClick={btn.action} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 12px', border:'none', background:'none', cursor:btn.action?'pointer':'default', fontFamily:"'Cairo',sans-serif" }}>
              <span style={{ fontSize:22 }}>{btn.emoji}</span>
              <span style={{ fontSize:10, color:C.sub, fontWeight:500 }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Smart Board */}
        <div style={{ flex:1, background:C.bg, padding:'14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <p style={{ color:C.navy2, fontWeight:800, fontSize:15 }}>السبورة الذكية</p>
            <span style={{ color:C.sub, fontSize:12 }}>المشاركون ({totalPart})</span>
          </div>

          {/* Board content */}
          <div style={{ background:C.card, borderRadius:18, padding:'18px', boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:12 }}>
            <p style={{ color:C.navy2, fontWeight:800, fontSize:17, marginBottom:14 }}>Future Simple (will)</p>
            <div style={{ background:'#F0F9FF', borderRadius:12, padding:'14px 16px', marginBottom:14, border:'1px solid #BAE6FD', fontFamily:'monospace', fontSize:15, color:'#0369A1' }}>
              [ S + will + V(base) ]
            </div>
            <p style={{ color:C.sub, fontSize:12.5, fontWeight:600, marginBottom:8 }}>Examples:</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <p style={{ color:'#DC2626', fontSize:13, fontWeight:500 }}>• I will study hard.</p>
              <p style={{ color:'#DC2626', fontSize:13, fontWeight:500 }}>• We will travel tomorrow.</p>
            </div>
          </div>

          {/* Drawing tools */}
          <div style={{ background:C.card, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:12 }}>
            {['✏️','📐','📏','T','🔵'].map((t,i) => (
              <button key={i} style={{ width:34, height:34, borderRadius:9, background:i===0?C.goldBg:C.bg, border:`1px solid ${i===0?C.gold:C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:i===3?13:17, cursor:'pointer', fontWeight:i===3?700:400, color:C.navy2 }}>{t}</button>
            ))}
            <div style={{ display:'flex', gap:5, marginRight:'auto' }}>
              {['#EF4444','#3B82F6','#16A34A','#F59E0B','#1B2038'].map((col,i) => (
                <div key={i} style={{ width:20, height:20, borderRadius:'50%', background:col, cursor:'pointer', border:'2px solid #fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
              ))}
            </div>
          </div>

          {/* AI Teacher button */}
          <button style={{ width:'100%', padding:'13px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(201,149,42,0.4)' }}>
            <span style={{ fontSize:18 }}>🤖</span>
            اسأل معلمي الذكي
          </button>

          {/* Leave button */}
          <button onClick={leaveRoom} disabled={ending}
            style={{ width:'100%', marginTop:10, padding:'12px', borderRadius:14, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:C.red, fontWeight:700, fontSize:14, cursor:'pointer', opacity:ending?0.6:1 }}>
            {isPublisher ? 'إنهاء الحصة' : 'مغادرة الحصة'}
          </button>
        </div>
      </div>
    </div>
  );
}
