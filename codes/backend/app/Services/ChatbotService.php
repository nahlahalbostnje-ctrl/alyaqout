<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class ChatbotService
{
    private const DEFAULT_SYSTEM_PROMPT = 'أنت مساعد دراسي ذكي لمنصة ياقوت التعليمية. دورك هو مساعدة الطلاب على التعلم من خلال تقديم التلميحات والإرشادات، وليس الإجابات المباشرة. شجّع الطالب على التفكير والاستنتاج بنفسه. كن ودوداً ومشجعاً. استخدم اللغة العربية دائماً في ردودك.';

    public function chat(int $countryId, string $userMessage, array $history = []): string
    {
        $settings = Setting::where('country_id', $countryId)->first();

        if (!$settings || !$settings->chatbot_enabled || !$settings->chatbot_api_key) {
            return 'عذراً، خدمة المساعد الذكي غير مفعّلة حالياً. تواصل مع إدارة المنصة.';
        }

        $systemPrompt = $settings->chatbot_system_prompt ?: self::DEFAULT_SYSTEM_PROMPT;
        $provider     = $settings->chatbot_provider ?? 'claude';
        $apiKey       = $settings->chatbot_api_key;

        try {
            return match ($provider) {
                'openai' => $this->callOpenAI($apiKey, $systemPrompt, $userMessage, $history),
                default  => $this->callClaude($apiKey, $systemPrompt, $userMessage, $history),
            };
        } catch (\Throwable $e) {
            return 'حدث خطأ في الاتصال بالمساعد الذكي. حاول مرة أخرى.';
        }
    }

    private function callClaude(string $apiKey, string $systemPrompt, string $userMessage, array $history): string
    {
        $messages = $this->buildMessages($history, $userMessage);

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model'      => 'claude-haiku-4-5-20251001',
            'max_tokens' => 600,
            'system'     => $systemPrompt,
            'messages'   => $messages,
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
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'      => 'gpt-4o-mini',
                'max_tokens' => 600,
                'messages'   => $messages,
            ]);

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? 'لم أتمكن من الإجابة، حاول مرة أخرى.';
    }

    private function buildMessages(array $history, string $userMessage): array
    {
        $messages = [];
        foreach (array_slice($history, -6) as $h) {
            $messages[] = ['role' => $h['role'], 'content' => $h['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $userMessage];
        return $messages;
    }
}
