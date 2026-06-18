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

const font = { fontFamily: "'Cairo', sans-serif" };

/* ────────── Remote user video tile ────────── */
function RemoteVideo({ user }: { user: IAgoraRTCRemoteUser }) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && user.videoTrack) {
      user.videoTrack.play(divRef.current);
    }
    return () => { user.videoTrack?.stop(); };
  }, [user.videoTrack]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-800"
      style={{ aspectRatio: '16/9' }}>
      <div ref={divRef} className="w-full h-full" />
      {!user.videoTrack && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <div className="w-14 h-14 rounded-full bg-slate-600 flex items-center justify-center text-white text-xl font-bold" style={font}>
            {String(user.uid).slice(-2)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────── Main Room Page ────────── */
export default function LiveRoomPage() {
  const { channel }       = useParams<{ channel: string }>();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const classId           = searchParams.get('classId');

  const clientRef         = useRef<IAgoraRTCClient | null>(null);
  const localCamRef       = useRef<ICameraVideoTrack | null>(null);
  const localMicRef       = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef     = useRef<HTMLDivElement>(null);

  const [tokenData,   setTokenData]   = useState<AgoraTokenData | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [joined,      setJoined]      = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [micMuted,    setMicMuted]    = useState(false);
  const [camOff,      setCamOff]      = useState(false);
  const [ending,      setEnding]      = useState(false);
  const [elapsed,     setElapsed]     = useState(0);

  /* Timer */
  useEffect(() => {
    if (!joined) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [joined]);

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  /* Join channel */
  useEffect(() => {
    if (!classId || !channel) { setError('معلومات الحصة غير مكتملة'); setLoading(false); return; }

    let unmounted = false;

    (async () => {
      try {
        const r    = await api.post('/live/token', { class_id: Number(classId) });
        const data = r.data as AgoraTokenData;
        if (unmounted) return;
        setTokenData(data);

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'audio') user.audioTrack?.play();
          setRemoteUsers(prev => {
            const filtered = prev.filter(u => u.uid !== user.uid);
            return [...filtered, user];
          });
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') user.audioTrack?.stop();
          setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? user : u));
        });

        client.on('user-left', (user) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        await client.join(data.app_id, data.channel, data.token, data.uid);

        if (data.role === 'publisher') {
          const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          localMicRef.current = micTrack;
          localCamRef.current = camTrack;
          await client.publish([micTrack, camTrack]);
          if (localVideoRef.current) camTrack.play(localVideoRef.current);
        } else {
          /* student — record attendance once */
          api.post(`/live/${classId}/attend`).catch(() => {});
        }

        if (!unmounted) { setJoined(true); setLoading(false); }
      } catch {
        if (!unmounted) { setError('فشل الانضمام للحصة. تأكد من صلاحيات الكاميرا والميكروفون.'); setLoading(false); }
      }
    })();

    return () => {
      unmounted = true;
      localCamRef.current?.stop();
      localMicRef.current?.stop();
      clientRef.current?.leave().catch(() => {});
    };
  }, [classId, channel]);

  const toggleMic = useCallback(async () => {
    if (!localMicRef.current) return;
    await localMicRef.current.setEnabled(micMuted);
    setMicMuted(v => !v);
  }, [micMuted]);

  const toggleCam = useCallback(async () => {
    if (!localCamRef.current) return;
    await localCamRef.current.setEnabled(camOff);
    setCamOff(v => !v);
  }, [camOff]);

  const leaveRoom = useCallback(async () => {
    setEnding(true);
    try {
      if (tokenData?.role === 'publisher' && classId) {
        await api.post(`/live/${classId}/end`).catch(() => {});
      }
      localCamRef.current?.stop();
      localMicRef.current?.stop();
      await clientRef.current?.leave().catch(() => {});
    } finally {
      navigate(-1);
    }
  }, [tokenData, classId, navigate]);

  /* ────── Loading ────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="w-12 h-12 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
        <p className="text-purple-300 font-semibold" style={font}>جاري الاتصال بالحصة...</p>
      </div>
    );
  }

  /* ────── Error ────── */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-white font-bold text-lg" style={font}>{error}</p>
        <button onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
          style={font}>
          العودة
        </button>
      </div>
    );
  }

  const isPublisher   = tokenData?.role === 'publisher';
  const participCount = remoteUsers.length + 1;

  /* ────── Room UI ────── */
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400" style={font}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            مباشر
          </span>
          <p className="text-white font-bold text-sm" style={font}>{tokenData?.class_title || 'الحصة المباشرة'}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-mono">{fmtTime(elapsed)}</span>
          <span className="text-slate-400 text-xs" style={font}>
            {participCount} مشارك
          </span>
          <button
            onClick={leaveRoom}
            disabled={ending}
            className="px-4 py-1.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: isPublisher ? '#ef4444' : '#6b7280', ...font }}>
            {isPublisher ? 'إنهاء الحصة' : 'مغادرة'}
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className={`grid gap-3 h-full ${remoteUsers.length === 0 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

            {/* Local video (publisher) */}
            {isPublisher && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-800"
                style={{ aspectRatio: '16/9' }}>
                <div ref={localVideoRef} className="w-full h-full" />
                {camOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black" style={font}>
                      أنا
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 text-xs text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm" style={font}>
                  أنت (المعلم)
                </div>
              </div>
            )}

            {/* Remote users */}
            {remoteUsers.map(user => (
              <div key={String(user.uid)} className="relative">
                <RemoteVideo user={user} />
                <div className="absolute bottom-3 right-3 text-xs text-white bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm" style={font}>
                  مشارك
                </div>
              </div>
            ))}

            {/* Empty state for student waiting */}
            {!isPublisher && remoteUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-64 rounded-2xl bg-slate-800 gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                <p className="text-slate-400 text-sm" style={font}>بانتظار بدء المعلم...</p>
              </div>
            )}
          </div>
        </div>

        {/* Participants Panel */}
        <div className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-white text-sm font-bold" style={font}>المشاركون ({participCount})</p>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {/* local user */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-600/20">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                أ
              </div>
              <span className="text-white text-xs font-semibold truncate" style={font}>
                أنت {isPublisher ? '(معلم)' : '(طالب)'}
              </span>
            </div>

            {remoteUsers.map(user => (
              <div key={String(user.uid)} className="flex items-center gap-2 p-2 rounded-xl bg-slate-700">
                <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 text-xs font-bold flex-shrink-0">
                  {String(user.uid).slice(-1)}
                </div>
                <span className="text-slate-300 text-xs truncate" style={font}>
                  مشارك {String(user.uid).slice(-3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls Bar (publisher only) ── */}
      {isPublisher && (
        <div className="flex items-center justify-center gap-4 py-4 bg-slate-800 border-t border-slate-700">

          {/* Mic toggle */}
          <button
            onClick={toggleMic}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
            style={{ background: micMuted ? '#ef4444' : '#374151' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {micMuted
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M3 3l18 18" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              }
            </svg>
            <span className="text-white text-xs" style={font}>{micMuted ? 'إلغاء الكتم' : 'كتم'}</span>
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCam}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
            style={{ background: camOff ? '#ef4444' : '#374151' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {camOff
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z M3 3l18 18" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              }
            </svg>
            <span className="text-white text-xs" style={font}>{camOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}</span>
          </button>

          {/* End */}
          <button
            onClick={leaveRoom}
            disabled={ending}
            className="flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all disabled:opacity-50"
            style={{ background: '#dc2626' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            <span className="text-white text-xs" style={font}>إنهاء</span>
          </button>
        </div>
      )}

      {/* Leave button for students */}
      {!isPublisher && (
        <div className="flex items-center justify-center py-4 bg-slate-800 border-t border-slate-700">
          <button
            onClick={leaveRoom}
            className="flex items-center gap-2 px-6 py-2 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: '#6b7280', ...font }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            مغادرة الحصة
          </button>
        </div>
      )}
    </div>
  );
}
