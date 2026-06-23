import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6', orange: '#F59E0B', purple: '#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});
const inp = (focused = false): React.CSSProperties => ({
  background: '#FFFFFF', border: `1.5px solid ${focused ? '#C59341' : '#EDE3CE'}`,
  color: '#1B2038', borderRadius: 12, padding: '10px 14px', fontSize: 13,
  width: '100%', outline: 'none', fontFamily: "'Cairo',sans-serif",
  boxSizing: 'border-box',
});

const font = { fontFamily: "'Cairo', sans-serif" };

const DEFAULT_PROMPT = 'أنت مساعد دراسي ذكي لمنصة ياقوت التعليمية. دورك هو مساعدة الطلاب على التعلم من خلال تقديم التلميحات والإرشادات، وليس الإجابات المباشرة. شجّع الطالب على التفكير والاستنتاج بنفسه. كن ودوداً ومشجعاً. استخدم اللغة العربية دائماً في ردودك.';

interface Settings {
  chatbot_provider: string;
  chatbot_api_key: string | null;
  chatbot_system_prompt: string | null;
  chatbot_enabled: boolean;
  whatsapp_number: string | null;
  whatsapp_default_message: string | null;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onChange(!enabled)}>
      <span style={{ fontSize: 13, color: enabled ? DK.green : DK.sub, fontWeight: 700, ...font }}>
        {enabled ? 'مفعّل' : 'معطّل'}
      </span>
      <div style={{
        width: 44, height: 24, borderRadius: 40, position: 'relative',
        background: enabled ? DK.green : '#D1D5DB',
        transition: 'background 0.2s', cursor: 'pointer',
        boxShadow: enabled ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
      }}>
        <div style={{
          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          left: enabled ? 22 : 2,
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    chatbot_provider: 'claude',
    chatbot_api_key: null,
    chatbot_system_prompt: null,
    chatbot_enabled: false,
    whatsapp_number: null,
    whatsapp_default_message: null,
  });
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState<'ai' | 'wa' | null>(null);
  const [fetching, setFetching] = useState(true);
  const [savedAi, setSavedAi] = useState(false);
  const [savedWa, setSavedWa] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);
  const [errorWa, setErrorWa] = useState<string | null>(null);
  const [apiKeyChanged, setApiKeyChanged] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        if (data.settings) setSettings(data.settings);
      } finally { setFetching(false); }
    })();
  }, []);

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings((s) => ({ ...s, [field]: value }));
    if (field === 'chatbot_api_key') setApiKeyChanged(true);
    setSavedAi(false); setSavedWa(false);
  };

  const handleSave = async () => {
    setSaving(true); setErrorAi(null); setErrorWa(null);
    try {
      const payload: Record<string, unknown> = {
        chatbot_provider: settings.chatbot_provider,
        chatbot_system_prompt: settings.chatbot_system_prompt || null,
        chatbot_enabled: settings.chatbot_enabled,
        whatsapp_number: settings.whatsapp_number || null,
        whatsapp_default_message: settings.whatsapp_default_message || null,
      };
      if (apiKeyChanged) payload.chatbot_api_key = settings.chatbot_api_key;
      await api.put('/admin/settings', payload);
      setSavedAi(true); setSavedWa(true); setApiKeyChanged(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setErrorAi(e.response?.data?.message || 'فشل حفظ الإعدادات');
    } finally { setSaving(false); }
  };

  const handleSaveAi = async () => {
    setSavingSection('ai'); setErrorAi(null); setSavedAi(false);
    try {
      const payload: Record<string, unknown> = {
        chatbot_provider: settings.chatbot_provider,
        chatbot_system_prompt: settings.chatbot_system_prompt || null,
        chatbot_enabled: settings.chatbot_enabled,
        whatsapp_number: settings.whatsapp_number || null,
        whatsapp_default_message: settings.whatsapp_default_message || null,
      };
      if (apiKeyChanged) payload.chatbot_api_key = settings.chatbot_api_key;
      await api.put('/admin/settings', payload);
      setSavedAi(true); setApiKeyChanged(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setErrorAi(e.response?.data?.message || 'فشل الحفظ');
    } finally { setSavingSection(null); }
  };

  const handleSaveWa = async () => {
    setSavingSection('wa'); setErrorWa(null); setSavedWa(false);
    try {
      const payload: Record<string, unknown> = {
        chatbot_provider: settings.chatbot_provider,
        chatbot_system_prompt: settings.chatbot_system_prompt || null,
        chatbot_enabled: settings.chatbot_enabled,
        whatsapp_number: settings.whatsapp_number || null,
        whatsapp_default_message: settings.whatsapp_default_message || null,
      };
      if (apiKeyChanged) payload.chatbot_api_key = settings.chatbot_api_key;
      await api.put('/admin/settings', payload);
      setSavedWa(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setErrorWa(e.response?.data?.message || 'فشل الحفظ');
    } finally { setSavingSection(null); }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    ...inp(focusedInput === field),
  });

  if (fetching) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation: 'spin 0.8s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AdminLayout>
    );
  }

  const waNumber = settings.whatsapp_number?.replace(/\D/g, '') ?? '';
  const waMessage = encodeURIComponent(settings.whatsapp_default_message ?? 'مرحباً، أريد الاستفسار عن...');
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <AdminLayout>
      <div dir="rtl" style={{ ...font, background: DK.bg, minHeight: '100vh', padding: 24 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 24, borderRadius: 4, background: DK.goldGrad }} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: DK.text, margin: 0 }}>الإعدادات</h1>
          </div>
          <p style={{ color: DK.sub, fontSize: 13, marginRight: 14 }}>إعدادات المساعد الذكي والتكاملات</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>

          {/* SECTION 1: AI Settings */}
          <div style={card({ padding: 0, overflow: 'hidden' })}>
            {/* Section Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #EDE3CE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: 'rgba(197,147,65,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  🤖
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: 0 }}>إعدادات الذكاء الاصطناعي</p>
                  <p style={{ fontSize: 12, color: DK.sub, margin: '2px 0 0' }}>بوت الدعم الدراسي للطلاب</p>
                </div>
              </div>
              <Toggle enabled={settings.chatbot_enabled} onChange={(v) => handleChange('chatbot_enabled', v)} />
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Success/Error banners */}
              {savedAi && (
                <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: DK.green, fontSize: 13, fontWeight: 700 }}>
                  ✅ تم حفظ إعدادات الذكاء الاصطناعي بنجاح
                </div>
              )}
              {errorAi && (
                <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: DK.red, fontSize: 13, fontWeight: 700 }}>
                  ❌ {errorAi}
                </div>
              )}

              {/* Provider */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>مزوّد الذكاء الاصطناعي</label>
                <select value={settings.chatbot_provider}
                  onChange={(e) => handleChange('chatbot_provider', e.target.value)}
                  onFocus={() => setFocusedInput('provider')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('provider'), cursor: 'pointer' }}>
                  <option value="claude">Claude (Anthropic) — موصى به</option>
                  <option value="openai">GPT (OpenAI)</option>
                </select>
              </div>

              {/* API Key */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>
                  مفتاح API
                  <span style={{ fontSize: 11, fontWeight: 400, color: DK.dim, marginRight: 6 }}>
                    {settings.chatbot_provider === 'claude' ? '(من console.anthropic.com)' : '(من platform.openai.com)'}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', fontSize: 14 }}>🔑</span>
                  <input type="password"
                    value={settings.chatbot_api_key ?? ''}
                    onChange={(e) => handleChange('chatbot_api_key', e.target.value)}
                    placeholder={settings.chatbot_api_key && !apiKeyChanged ? '••••••••••••' : 'sk-ant-... أو sk-...'}
                    dir="ltr"
                    onFocus={() => setFocusedInput('apikey')} onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('apikey'), fontFamily: 'monospace', paddingRight: 40 }} />
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: DK.text }}>System Prompt</label>
                  <button
                    type="button"
                    onClick={() => handleChange('chatbot_system_prompt', DEFAULT_PROMPT)}
                    style={{ fontSize: 12, color: DK.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontWeight: 700 }}>
                    استخدم الافتراضي
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={settings.chatbot_system_prompt ?? ''}
                  onChange={(e) => handleChange('chatbot_system_prompt', e.target.value)}
                  placeholder={DEFAULT_PROMPT}
                  onFocus={() => setFocusedInput('prompt')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('prompt'), resize: 'vertical' }}
                />
                <p style={{ fontSize: 11, color: DK.dim, marginTop: 4 }}>
                  وجّه البوت لإعطاء تلميحات لا إجابات مباشرة — يحفظ الفارغ القيمة الافتراضية
                </p>
              </div>

              {/* Save AI button */}
              <button
                onClick={handleSaveAi}
                disabled={savingSection === 'ai'}
                style={{
                  padding: '11px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: DK.goldGrad, color: '#fff', fontSize: 14, fontWeight: 800,
                  fontFamily: "'Cairo',sans-serif", boxShadow: '0 4px 14px rgba(197,147,65,0.25)',
                  opacity: savingSection === 'ai' ? 0.7 : 1, alignSelf: 'flex-start',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                {savingSection === 'ai' ? (
                  <>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                    جاري الحفظ...
                  </>
                ) : '💾 حفظ إعدادات الذكاء الاصطناعي'}
              </button>
            </div>
          </div>

          {/* SECTION 2: WhatsApp Settings */}
          <div style={card({ padding: 0, overflow: 'hidden' })}>
            {/* Section Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #EDE3CE', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                💬
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: DK.text, margin: 0 }}>إعدادات الواتساب</p>
                <p style={{ fontSize: 12, color: DK.sub, margin: '2px 0 0' }}>رقم التواصل وزر واتساب العائم</p>
              </div>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Success/Error banners */}
              {savedWa && (
                <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: DK.green, fontSize: 13, fontWeight: 700 }}>
                  ✅ تم حفظ إعدادات الواتساب بنجاح
                </div>
              )}
              {errorWa && (
                <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: DK.red, fontSize: 13, fontWeight: 700 }}>
                  ❌ {errorWa}
                </div>
              )}

              {/* WhatsApp Number */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>رقم واتساب</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', fontSize: 16 }}>📱</span>
                  <input type="text"
                    value={settings.whatsapp_number ?? ''}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    placeholder="+962791234567" dir="ltr"
                    onFocus={() => setFocusedInput('wa')} onBlur={() => setFocusedInput(null)}
                    style={{ ...inputStyle('wa'), fontFamily: 'monospace', paddingRight: 42 }} />
                </div>
              </div>

              {/* Default Message */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DK.text, marginBottom: 6 }}>رسالة الترحيب الافتراضية</label>
                <textarea rows={3}
                  value={settings.whatsapp_default_message ?? ''}
                  onChange={(e) => handleChange('whatsapp_default_message', e.target.value)}
                  placeholder="مرحباً، أريد الاستفسار عن..."
                  onFocus={() => setFocusedInput('wamsg')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('wamsg'), resize: 'none' }} />
              </div>

              {/* Preview */}
              {settings.whatsapp_number && (
                <div style={{ padding: '14px 16px', borderRadius: 14, background: '#F0FDF4', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <p style={{ fontSize: 12, color: DK.green, fontWeight: 700, margin: '0 0 10px' }}>معاينة زر الواتساب</p>
                  <a
                    href={waUrl}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 30,
                      background: '#25D366', color: '#fff',
                      fontSize: 13, fontWeight: 700, textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.3)', fontFamily: "'Cairo',sans-serif",
                    }}>
                    <span style={{ fontSize: 17 }}>💬</span>
                    تواصل معنا عبر الواتساب
                  </a>
                </div>
              )}

              {/* Save WA button */}
              <button
                onClick={handleSaveWa}
                disabled={savingSection === 'wa'}
                style={{
                  padding: '11px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 800,
                  fontFamily: "'Cairo',sans-serif", boxShadow: '0 4px 14px rgba(37,211,102,0.25)',
                  opacity: savingSection === 'wa' ? 0.7 : 1, alignSelf: 'flex-start',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                {savingSection === 'wa' ? (
                  <>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                    جاري الحفظ...
                  </>
                ) : '💬 حفظ إعدادات الواتساب'}
              </button>
            </div>
          </div>

          {/* Save All */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: DK.goldGrad, color: '#fff', fontSize: 15, fontWeight: 900,
              fontFamily: "'Cairo',sans-serif", boxShadow: '0 6px 20px rgba(197,147,65,0.3)',
              opacity: saving ? 0.7 : 1,
            }}>
            {saving ? 'جاري الحفظ...' : '💾 حفظ جميع الإعدادات'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
