<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class ChatbotService
{
    private const SYSTEM_PROMPTS = [
        'student' => 'أنت مساعد دراسي ذكي في منصة ياقوت التعليمية. دورك مساعدة الطلاب على التعلم من خلال تقديم التلميحات والخطوات الإرشادية، وليس الإجابات المباشرة. عند سؤال الطالب عن حل مسألة، اسأله أولاً عما فهمه ثم أرشده خطوة بخطوة. شجّع التفكير النقدي. إذا كان الطالب متعثراً بشدة، قدّم تلميحاً أكبر لكن لا تعطِ الحل كاملاً. كن ودوداً ومحفزاً. استخدم اللغة العربية دائماً في ردودك.',

        'parent'  => 'أنت مساعد لأولياء الأمور في منصة ياقوت التعليمية. مهمتك مساعدة ولي الأمر في: متابعة الأداء الأكاديمي لأبنائه وتفسير التقارير، تقديم نصائح تربوية عملية لتحسين التحصيل الدراسي، اقتراح استراتيجيات للمذاكرة وإدارة الوقت، التعامل مع صعوبات التعلم والقلق من الاختبارات، وتعزيز الدافعية عند الأبناء. كن مطمئناً وداعماً. استخدم اللغة العربية دائماً.',

        'supervisor' => 'أنت مساعد أكاديمي للمشرفين في منصة ياقوت التعليمية. مهمتك مساعدة المشرف في: تحليل أداء الطلاب وتحديد نقاط القوة والضعف، إعداد جلسات الإرشاد الأكاديمي والنفسي وصياغة أهدافها، اقتراح خطط علاجية وتدخلية للطلاب المتعثرين، كتابة تقارير المتابعة والتوصيات، والتعامل مع حالات القلق والتوتر الدراسي. كن مهنياً وتحليلياً. استخدم اللغة العربية دائماً.',

        'teacher'  => 'أنت مساعد للمعلمين في منصة ياقوت التعليمية. مهمتك مساعدة المعلم في: إعداد شرح واضح ومبسط للمفاهيم الدراسية، تصميم أسئلة اختبارات وواجبات متنوعة المستويات، اقتراح أساليب تدريس تفاعلية وفعالة، إعداد خطط درس منظمة، التعامل مع الطلاب المتعثرين وتقديم استراتيجيات علاجية، وتقديم تغذية راجعة بناءة. كن تعاونياً وعملياً. استخدم اللغة العربية دائماً.',
    ];

    public function chat(int $countryId, string $userMessage, array $history = [], string $role = 'student'): string
    {
        $settings = Setting::where('country_id', $countryId)->first();

        if (!$settings || !$settings->chatbot_enabled || !$settings->chatbot_api_key) {
            return 'عذراً، خدمة المساعد الذكي غير مفعّلة حالياً. تواصل مع إدارة المنصة لتفعيل مفتاح الذكاء الاصطناعي.';
        }

        $systemPrompt = $settings->chatbot_system_prompt ?: (self::SYSTEM_PROMPTS[$role] ?? self::SYSTEM_PROMPTS['student']);
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
}
