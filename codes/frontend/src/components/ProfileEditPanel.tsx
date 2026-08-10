import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateProfile, uploadAvatar } from '../features/auth/authSlice';
import { C } from '../theme/palette';

type Props = {
  roleLabel: string;
  /** Hint under phone (OTP vs password login) */
  authHint?: string;
  /** Show password change fields */
  showPassword?: boolean;
  cardStyle?: CSSProperties;
};

export default function ProfileEditPanel({
  roleLabel,
  authHint,
  showPassword = true,
  cardStyle,
}: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    password: '',
    password_confirmation: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setForm((p) => ({
      ...p,
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
    }));
  }, [user?.id, user?.name, user?.phone, user?.email]);

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')
    : 'م';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const payload: {
        name: string;
        phone: string;
        email?: string;
        password?: string;
        password_confirmation?: string;
      } = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      };
      if (showPassword && form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }
      await dispatch(updateProfile(payload)).unwrap();
      setForm((p) => ({ ...p, password: '', password_confirmation: '' }));
      setMsg({ type: 'success', text: 'تم تحديث بياناتك بنجاح.' });
    } catch (err: unknown) {
      setMsg({ type: 'error', text: typeof err === 'string' ? err : 'تعذّر حفظ التعديلات' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(file: File | null) {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      await dispatch(uploadAvatar(file)).unwrap();
      setMsg({ type: 'success', text: 'تم تحديث الصورة الشخصية.' });
    } catch (err: unknown) {
      setMsg({ type: 'error', text: typeof err === 'string' ? err : 'تعذّر رفع الصورة' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const card: CSSProperties = {
    background: C.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
    ...cardStyle,
  };

  const inp: CSSProperties = {
    background: '#fff',
    border: `1.5px solid ${C.border}`,
    color: C.text,
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    fontFamily: "'Cairo',sans-serif",
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ ...card, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: C.goldGrad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 24,
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 6px 18px rgba(197,147,65,0.28)',
            overflow: 'hidden',
          }}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>{user?.name}</p>
          <p style={{ color: C.sub, fontSize: 13, marginTop: 4, direction: 'ltr', textAlign: 'right' }}>
            {user?.phone}
          </p>
          <span
            style={{
              display: 'inline-block',
              marginTop: 8,
              background: C.goldGrad,
              color: '#1B2038',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20,
            }}
          >
            {roleLabel}
          </span>
          <div style={{ marginTop: 12 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.bg,
                color: C.text,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: uploading ? 'default' : 'pointer',
                fontFamily: "'Cairo',sans-serif",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? 'جاري الرفع…' : 'إضافة / تغيير الصورة'}
            </button>
            <p style={{ color: C.dim, fontSize: 11, margin: '6px 0 0' }}>JPEG أو PNG أو WebP — بحد أقصى 2MB</p>
          </div>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ color: C.gold, fontWeight: 800, fontSize: 12, margin: '0 0 16px' }}>المعلومات الأساسية</h3>
        <form onSubmit={handleSave}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={labelStyle}>الاسم الكامل</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                style={inp}
              />
            </div>
            <div>
              <label style={labelStyle}>رقم الهاتف (واتساب)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                required
                dir="ltr"
                style={inp}
              />
            </div>
            <div>
              <label style={labelStyle}>البريد الإلكتروني</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                dir="ltr"
                style={inp}
              />
            </div>
          </div>

          {showPassword && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <label style={labelStyle}>كلمة مرور جديدة (اختياري)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                  style={inp}
                />
              </div>
              <div>
                <label style={labelStyle}>تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                  autoComplete="new-password"
                  style={inp}
                />
              </div>
            </div>
          )}

          {authHint && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.15)',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 14 }}>ℹ️</span>
              <p style={{ color: C.blue, fontSize: 12, margin: 0, lineHeight: 1.6 }}>{authHint}</p>
            </div>
          )}

          {msg && (
            <p
              style={{
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 14,
                background: msg.type === 'success' ? 'rgba(22,163,74,0.08)' : 'rgba(239,68,68,0.08)',
                color: msg.type === 'success' ? C.green : C.red,
                border: `1px solid ${msg.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {msg.text}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '11px 22px',
                borderRadius: 12,
                border: 'none',
                background: C.goldGrad,
                color: '#1B2038',
                fontWeight: 800,
                fontSize: 13,
                cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.7 : 1,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {saving ? 'جاري الحفظ…' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: 'block',
  color: C.sub,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
};
