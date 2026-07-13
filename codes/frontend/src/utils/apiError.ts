/** Extract a user-facing Arabic error message from an Axios/API error. */

const EN_TO_AR: Record<string, string> = {
  'the email has already been taken.': 'البريد الإلكتروني مستخدم مسبقاً.',
  'the phone has already been taken.': 'رقم الجوال مستخدم مسبقاً.',
  'the selected email is invalid.': 'البريد الإلكتروني غير صالح.',
  'the email field is required.': 'البريد الإلكتروني مطلوب.',
  'the password field is required.': 'كلمة المرور مطلوبة.',
  'the name field is required.': 'الاسم مطلوب.',
  'the phone field is required.': 'رقم الجوال مطلوب.',
  'unauthenticated.': 'يجب تسجيل الدخول أولاً.',
  'too many attempts.': 'محاولات كثيرة. حاول لاحقاً.',
  'server error': 'خطأ في الخادم.',
};

function translateOne(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const mapped = EN_TO_AR[trimmed.toLowerCase()];
  if (mapped) return mapped;

  // Laravel style: "The email has already been taken."
  const unique = trimmed.match(/^The (.+) has already been taken\.?$/i);
  if (unique) {
    const field = unique[1].toLowerCase();
    if (field.includes('email')) return 'البريد الإلكتروني مستخدم مسبقاً.';
    if (field.includes('phone')) return 'رقم الجوال مستخدم مسبقاً.';
    if (field.includes('code')) return 'هذا الرمز مستخدم مسبقاً.';
    return 'هذه القيمة مستخدمة مسبقاً.';
  }

  const required = trimmed.match(/^The (.+) field is required\.?$/i);
  if (required) {
    const field = required[1].toLowerCase();
    if (field.includes('email')) return 'البريد الإلكتروني مطلوب.';
    if (field.includes('password')) return 'كلمة المرور مطلوبة.';
    if (field.includes('name')) return 'الاسم مطلوب.';
    if (field.includes('phone')) return 'رقم الجوال مطلوب.';
    return 'هذا الحقل مطلوب.';
  }

  return trimmed;
}

export function getApiError(err: unknown, fallback = 'حدث خطأ. حاول مرة أخرى.'): string {
  const e = err as {
    response?: {
      data?: {
        message?: string;
        error?: string;
        errors?: Record<string, string[] | string>;
      };
    };
    message?: string;
  };

  const data = e?.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    const parts = Object.values(data.errors).flatMap((v) =>
      Array.isArray(v) ? v : [String(v)],
    );
    if (parts.length > 0) {
      return parts.map(translateOne).join(' — ');
    }
  }

  if (data?.message) return translateOne(String(data.message));
  if (data?.error) return translateOne(String(data.error));
  if (e?.message && e.message !== 'Network Error') return translateOne(e.message);

  return fallback;
}
