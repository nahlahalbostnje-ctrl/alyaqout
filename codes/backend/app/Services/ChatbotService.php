<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class ChatbotService
{
    private const SYSTEM_PROMPTS = [
        'student' => <<<'PROMPT'
أنت "مستشار ياقوت" — مساعد أكاديمي ذكي في منصة ياقوت التعليمية.
لديك وصول لبيانات الطالب: مستوى التطور، نقاط الغيمفيكيشن، سجل الحضور والغياب، ملاحظات المعلمين على سلوكه وأدائه، ونتائج الاختبارات والواجبات.
دورك:
- مساعدة الطالب على الفهم من خلال التلميحات لا الإجابات المباشرة.
- تحليل أنماط أدائه (تحسن/تراجع) بناءً على نتائجه الفعلية.
- تنبيه الطالب إذا كان غيابه يؤثر سلباً على أدائه.
- الإشارة لملاحظات المعلمين إذا تعلقت بسؤاله.
- تشجيع التفكير النقدي وتحفيز الدافعية.
كن ودوداً، محفزاً، ومنظماً. استخدم اللغة العربية دائماً.
PROMPT,

        'parent'  => <<<'PROMPT'
أنت "مستشار ياقوت" — مساعد مخصص لأولياء الأمور في منصة ياقوت التعليمية.
لديك وصول لبيانات الأبناء: نتائج الاختبارات، سجلات الحضور والغياب، ملاحظات المعلمين على السلوك والأداء، مستوى التطور، ونقاط الغيمفيكيشن.
مهمتك:
- تفسير التقارير الأكاديمية وسجلات الحضور لولي الأمر بأسلوب واضح.
- ربط الغياب بالتراجع الأكاديمي إذا وُجد وشرح التأثير.
- تلخيص ملاحظات المعلمين وترجمتها لتوصيات عملية.
- اقتراح استراتيجيات تحسين مبنية على البيانات الفعلية لا الكلام العام.
- تقديم دعم نفسي وتربوي موجّه.
كن مطمئناً وداعماً ومحترماً. استخدم اللغة العربية دائماً.
PROMPT,

        'supervisor' => <<<'PROMPT'
أنت مساعد أكاديمي للمشرفين في منصة ياقوت التعليمية.
لديك وصول لبيانات الطلاب الشاملة: نتائج الاختبارات والواجبات، سجلات الحضور والغياب، ملاحظات المعلمين على السلوك والأداء، ومستويات التطور.
مهمتك:
- تحليل أداء الطلاب الجماعي والفردي وتحديد نقاط الضعف.
- ربط الغياب المتكرر بالتراجع الأكاديمي وتقديم خطط تدخل.
- قراءة ملاحظات المعلمين وترجمتها لتوصيات قابلة للتطبيق.
- اقتراح جلسات إرشادية مخصصة بناءً على البيانات.
- كتابة تقارير متابعة وتوصيات موثقة.
كن مهنياً وتحليلياً ودقيقاً. استخدم اللغة العربية دائماً.
PROMPT,

        'teacher'  => <<<'PROMPT'
أنت مساعد للمعلمين في منصة ياقوت التعليمية.
لديك وصول لبيانات طلاب الصف: نتائجهم، سجلات الحضور والغياب، وملاحظات السلوك.
مهمتك:
- مساعدة المعلم في تصميم شرح مناسب لمستويات الطلاب الفعلية.
- اقتراح تمارين وأسئلة مناسبة بناءً على نقاط الضعف المرصودة.
- تقديم استراتيجيات علاجية للطلاب المتعثرين استناداً لأدائهم الفعلي.
- إعداد خطط درس منظمة وأساليب تدريس تفاعلية.
- تقديم تغذية راجعة بناءة ومحددة.
كن تعاونياً وعملياً ومنهجياً. استخدم اللغة العربية دائماً.
PROMPT,
    ];

    public function chat(int $countryId, string $userMessage, array $history = [], string $role = 'student', array $context = []): string
    {
        $settings = Setting::where('country_id', $countryId)->first();

        if (!$settings || !$settings->chatbot_enabled || !$settings->chatbot_api_key) {
            return 'عذراً، خدمة المساعد الذكي غير مفعّلة حالياً. تواصل مع إدارة المنصة لتفعيل مفتاح الذكاء الاصطناعي.';
        }

        $basePrompt   = $settings->chatbot_system_prompt ?: (self::SYSTEM_PROMPTS[$role] ?? self::SYSTEM_PROMPTS['student']);
        $systemPrompt = $basePrompt . $this->buildContextBlock($context);
        $provider     = $settings->chatbot_provider ?? 'claude';
        $apiKey       = $settings->chatbot_api_key;

        try {
            return match ($provider) {
                'openai' => $this->callOpenAI($apiKey, $systemPrompt, $userMessage, $history),
                default  => $this->callClaude($apiKey, $systemPrompt, $userMessage, $history),
            };
        } catch (\Throwable) {
            return 'حدث خطأ في الاتصال بالمساعد الذكي. حاول مرة أخرى بعد لحظات.';
        }
    }

    private function callClaude(string $apiKey, string $systemPrompt, string $userMessage, array $history): string
    {
        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model'      => 'claude-haiku-4-5-20251001',
            'max_tokens' => 700,
            'system'     => $systemPrompt,
            'messages'   => $this->buildMessages($history, $userMessage),
        ]);

        $data = $response->json();
        return $data['content'][0]['text'] ?? 'لم أتمكن من الإجابة، حاول مرة أخرى.';
    }

    private function callOpenAI(string $apiKey, string $systemPrompt, string $userMessage, array $history): string
    {
        $messages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $this->buildMessages($history, $userMessage)
        );

        $response = Http::withToken($apiKey)
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'      => 'gpt-4o-mini',
                'max_tokens' => 700,
                'messages'   => $messages,
            ]);

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? 'لم أتمكن من الإجابة، حاول مرة أخرى.';
    }

    private function buildMessages(array $history, string $userMessage): array
    {
        $messages = [];
        foreach (array_slice($history, -8) as $h) {
            $messages[] = ['role' => $h['role'], 'content' => $h['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $userMessage];
        return $messages;
    }

    private function buildContextBlock(array $context): string
    {
        if (empty($context)) return '';

        $lines = ["\n\n--- بيانات المستخدم الحالية (استخدمها في ردودك) ---"];

        if (!empty($context['student_name'])) {
            $lines[] = "اسم الطالب: {$context['student_name']}";
        }
        if (isset($context['attendance_total'], $context['attendance_present'])) {
            $pct = $context['attendance_total'] > 0
                ? round($context['attendance_present'] / $context['attendance_total'] * 100)
                : 0;
            $lines[] = "الحضور: {$context['attendance_present']} من {$context['attendance_total']} ({$pct}%)";
            if ($pct < 75) {
                $lines[] = "⚠️ تحذير: نسبة الحضور منخفضة وتحت الحد المقبول (75%).";
            }
        }
        if (!empty($context['exam_results'])) {
            $lines[] = "نتائج الاختبارات الأخيرة:";
            foreach ($context['exam_results'] as $r) {
                $lines[] = "  - {$r['title']}: {$r['score']}/{$r['total']}";
            }
        }
        if (!empty($context['homework_stats'])) {
            $h = $context['homework_stats'];
            $lines[] = "الواجبات: {$h['submitted']} مسلّم من أصل {$h['total']}";
        }
        if (!empty($context['teacher_notes'])) {
            $lines[] = "ملاحظات المعلمين: " . implode('؛ ', $context['teacher_notes']);
        }
        if (!empty($context['points'])) {
            $lines[] = "نقاط الغيمفيكيشن: {$context['points']} نقطة";
        }
        if (!empty($context['children'])) {
            $lines[] = "بيانات الأبناء:";
            foreach ($context['children'] as $child) {
                $lines[] = "  - {$child['name']}: حضور {$child['attendance_pct']}%, متوسط الدرجات {$child['avg_score']}%";
            }
        }

        $lines[] = "---";
        return implode("\n", $lines);
    }
}
