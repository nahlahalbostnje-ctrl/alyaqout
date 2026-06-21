import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
};

const font = { fontFamily: "'Cairo', sans-serif" };

const DEFAULT_PROMPT = 'أنت مساعد دراسي ذكي لمنصة ياقوت التعليمية. دورك هو مساعدة الطلاب على التعلم من خلال تقديم التلميحات والإرشادات، وليس الإجابات المباشرة. شجّع الطالب على التفكير والاستنتاج بنفسه. كن ودوداً ومشجعاً. استخدم اللغة العربية دائماً في ردودك.';

interface Settings {
  chatbot_provider:         string;
  chatbot_api_key:          string | null;
  chatbot_system_prompt:    string | null;
  chatbot_enabled:          boolean;
  whatsapp_number:          string | null;
  whatsapp_default_message: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    chatbot_provider:         'claude',
    chatbot_api_key:          null,
    chatbot_system_prompt:    null,
    chatbot_enabled:          false,
    whatsapp_number:          null,
    whatsapp_default_message: null,
  });
  const [saving, setSaving]       = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
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
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = {
        chatbot_provider:         settings.chatbot_provider,
        chatbot_system_prompt:    settings.chatbot_system_prompt || null,
        chatbot_enabled:          settings.chatbot_enabled,
        whatsapp_number:          settings.whatsapp_number || null,
        whatsapp_default_message: settings.whatsapp_default_message || null,
      };
      if (apiKeyChanged) payload.chatbot_api_key = settings.chatbot_api_key;
      await api.put('/admin/settings', payload);
      setSaved(true); setApiKeyChanged(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'فشل حفظ الإعدادات');
    } finally { setSaving(false); }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    background: '#FFFFFF',
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    ...font,
  });

  if (fetching) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl" dir="rtl" style={{ ...font, background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>إعدادات المنصة</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>إعدادات المساعد الذكي والتكاملات</p>
        </div>

        {error && (
          <div className="mb-4 text-sm px-4 py-3 rounded-xl" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 text-sm px-4 py-3 rounded-xl" style={{ color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            تم حفظ الإعدادات بنجاح
          </div>
        )}

        {/* Chatbot Section */}
        <div className="p-6 mb-4 rounded-2xl" style={DK.card}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(201,149,42,0.08)' }}>🤖</div>
              <div>
                <h3 className="font-bold" style={{ color: '#1B2038' }}>المساعد الذكي</h3>
                <p className="text-xs" style={{ color: DK.dimTxt }}>بوت الدعم الدراسي للطلاب</p>
              </div>
            </div>
            {/* Custom Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm" style={{ color: DK.dimTxt }}>
                {settings.chatbot_enabled ? 'مفعّل' : 'معطّل'}
              </span>
              <div
                onClick={() => handleChange('chatbot_enabled', !settings.chatbot_enabled)}
                className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
                style={{ background: settings.chatbot_enabled ? 'linear-gradient(135deg, #C9952A, #DDAD50)' : '#EDE3CE' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: settings.chatbot_enabled ? 'translateX(-22px)' : 'translateX(-2px)' }}
                />
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-1.5 block" style={{ color: '#1B2038' }}>مزوّد الذكاء الاصطناعي</label>
              <select value={settings.chatbot_provider}
                onChange={(e) => handleChange('chatbot_provider', e.target.value)}
                onFocus={() => setFocusedInput('provider')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('provider'), cursor: 'pointer' }}>
                <option value="claude">Claude (Anthropic) — موصى به</option>
                <option value="openai">GPT (OpenAI)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold mb-1.5 block" style={{ color: '#1B2038' }}>
                مفتاح API
                <span className="text-xs font-normal mr-2" style={{ color: DK.dimTxt }}>
                  {settings.chatbot_provider === 'claude'
                    ? '(من console.anthropic.com)'
                    : '(من platform.openai.com)'}
                </span>
              </label>
              <input type="password" value={settings.chatbot_api_key ?? ''}
                onChange={(e) => handleChange('chatbot_api_key', e.target.value)}
                placeholder={settings.chatbot_api_key && !apiKeyChanged ? '••••••••' : 'sk-ant-... أو sk-...'}
                dir="ltr"
                onFocus={() => setFocusedInput('apikey')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('apikey'), fontFamily: 'monospace' }} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold" style={{ color: '#1B2038' }}>الـ System Prompt</label>
                <button onClick={() => handleChange('chatbot_system_prompt', DEFAULT_PROMPT)}
                  className="text-xs transition hover:underline" style={{ color: DK.gold }}>
                  استخدم الافتراضي
                </button>
              </div>
              <textarea rows={5} value={settings.chatbot_system_prompt ?? ''}
                onChange={(e) => handleChange('chatbot_system_prompt', e.target.value)}
                placeholder={DEFAULT_PROMPT}
                onFocus={() => setFocusedInput('prompt')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('prompt'), resize: 'none' }} />
              <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>
                وجّه البوت لإعطاء تلميحات لا إجابات مباشرة — يحفظ الفارغ القيمة الافتراضية
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="p-6 mb-6 rounded-2xl" style={DK.card}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(16,185,129,0.08)' }}>💬</div>
            <div>
              <h3 className="font-bold" style={{ color: '#1B2038' }}>واتساب</h3>
              <p className="text-xs" style={{ color: DK.dimTxt }}>رقم التواصل وزر واتساب العائم</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-1.5 block" style={{ color: '#1B2038' }}>رقم واتساب</label>
              <input type="text" value={settings.whatsapp_number ?? ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+962791234567" dir="ltr"
                onFocus={() => setFocusedInput('wa')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('wa'), fontFamily: 'monospace' }} />
            </div>
            <div>
              <label className="text-sm font-bold mb-1.5 block" style={{ color: '#1B2038' }}>رسالة الترحيب الافتراضية</label>
              <textarea rows={2} value={settings.whatsapp_default_message ?? ''}
                onChange={(e) => handleChange('whatsapp_default_message', e.target.value)}
                placeholder="مرحباً، أريد الاستفسار عن..."
                onFocus={() => setFocusedInput('wamsg')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('wamsg'), resize: 'none' }} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-2xl font-bold text-sm transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff', ...font }}>
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </AdminLayout>
  );
}
