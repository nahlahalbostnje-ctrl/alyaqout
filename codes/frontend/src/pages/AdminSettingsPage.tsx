import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        if (data.settings) setSettings(data.settings);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings((s) => ({ ...s, [field]: value }));
    if (field === 'chatbot_api_key') setApiKeyChanged(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        chatbot_provider:         settings.chatbot_provider,
        chatbot_system_prompt:    settings.chatbot_system_prompt || null,
        chatbot_enabled:          settings.chatbot_enabled,
        whatsapp_number:          settings.whatsapp_number || null,
        whatsapp_default_message: settings.whatsapp_default_message || null,
      };
      if (apiKeyChanged) {
        payload.chatbot_api_key = settings.chatbot_api_key;
      }
      await api.put('/admin/settings', payload);
      setSaved(true);
      setApiKeyChanged(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return <AdminLayout><div className="p-6 text-gray-400" style={font}>جاري التحميل...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl" dir="rtl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800" style={font}>إعدادات المنصة</h2>
          <p className="text-sm text-gray-400 mt-1" style={font}>إعدادات المساعد الذكي والتكاملات</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl" style={font}>
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl" style={font}>
            ✓ تم حفظ الإعدادات بنجاح
          </div>
        )}

        {/* Chatbot Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🤖</div>
              <div>
                <h3 className="font-bold text-gray-800" style={font}>المساعد الذكي</h3>
                <p className="text-xs text-gray-400" style={font}>بوت الدعم الدراسي للطلاب</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600" style={font}>
                {settings.chatbot_enabled ? 'مفعّل' : 'معطّل'}
              </span>
              <div
                onClick={() => handleChange('chatbot_enabled', !settings.chatbot_enabled)}
                className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
                style={{ background: settings.chatbot_enabled ? '#7c3aed' : '#d1d5db' }}
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
              <label className="text-sm font-bold text-gray-700 mb-1.5 block" style={font}>مزوّد الذكاء الاصطناعي</label>
              <select
                value={settings.chatbot_provider}
                onChange={(e) => handleChange('chatbot_provider', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                style={font}
              >
                <option value="claude">Claude (Anthropic) — موصى به</option>
                <option value="openai">GPT (OpenAI)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block" style={font}>
                مفتاح API
                <span className="text-xs text-gray-400 font-normal mr-2">
                  {settings.chatbot_provider === 'claude'
                    ? '(من console.anthropic.com)'
                    : '(من platform.openai.com)'}
                </span>
              </label>
              <input
                type="password"
                value={settings.chatbot_api_key ?? ''}
                onChange={(e) => handleChange('chatbot_api_key', e.target.value)}
                placeholder={settings.chatbot_api_key && !apiKeyChanged ? '••••••••' : 'sk-ant-... أو sk-...'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-gray-700" style={font}>الـ System Prompt</label>
                <button
                  onClick={() => handleChange('chatbot_system_prompt', DEFAULT_PROMPT)}
                  className="text-xs text-purple-500 hover:text-purple-700 transition"
                  style={font}
                >
                  استخدم الافتراضي
                </button>
              </div>
              <textarea
                rows={5}
                value={settings.chatbot_system_prompt ?? ''}
                onChange={(e) => handleChange('chatbot_system_prompt', e.target.value)}
                placeholder={DEFAULT_PROMPT}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                style={font}
              />
              <p className="text-xs text-gray-400 mt-1" style={font}>
                وجّه البوت لإعطاء تلميحات لا إجابات مباشرة — يحفظ الفارغ القيمة الافتراضية
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">💬</div>
            <div>
              <h3 className="font-bold text-gray-800" style={font}>واتساب</h3>
              <p className="text-xs text-gray-400" style={font}>رقم التواصل وزر واتساب العائم</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block" style={font}>رقم واتساب</label>
              <input
                type="text"
                value={settings.whatsapp_number ?? ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+962791234567"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block" style={font}>رسالة الترحيب الافتراضية</label>
              <textarea
                rows={2}
                value={settings.whatsapp_default_message ?? ''}
                onChange={(e) => handleChange('whatsapp_default_message', e.target.value)}
                placeholder="مرحباً، أريد الاستفسار عن..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
                style={font}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', ...font }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </AdminLayout>
  );
}
