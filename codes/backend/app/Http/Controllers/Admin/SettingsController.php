<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function publicShow(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $countryId = (int) Auth::user()->country_id;
        } else {
            $countryId = $request->filled('country_id')
                ? (int) $request->country_id
                : (Setting::first()?->country_id ?? 1);
        }

        $settings = Setting::where('country_id', $countryId)->first();

        return response()->json([
            'whatsapp_number'          => $settings?->whatsapp_number,
            'whatsapp_default_message' => $settings?->whatsapp_default_message,
        ]);
    }

    public function show(): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;
        $settings  = Setting::where('country_id', $countryId)->first();

        return response()->json([
            'settings' => $settings ? [
                'chatbot_provider'       => $settings->chatbot_provider,
                'chatbot_api_key'        => $settings->chatbot_api_key ? '••••••••' . substr((string) $settings->chatbot_api_key, -4) : null,
                'chatbot_system_prompt'  => $settings->chatbot_system_prompt,
                'chatbot_enabled'        => $settings->chatbot_enabled,
                'whatsapp_number'        => $settings->whatsapp_number,
                'whatsapp_default_message' => $settings->whatsapp_default_message,
            ] : null,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chatbot_provider'         => 'nullable|in:claude,openai',
            'chatbot_api_key'          => 'nullable|string|max:500',
            'chatbot_system_prompt'    => 'nullable|string|max:5000',
            'chatbot_enabled'          => 'nullable|boolean',
            'whatsapp_number'          => 'nullable|string|max:20',
            'whatsapp_default_message' => 'nullable|string|max:500',
        ]);

        $countryId = (int) Auth::user()->country_id;

        $data = array_filter($validated, fn ($v) => $v !== null);
        $data['updated_at'] = now();

        if (isset($data['chatbot_api_key']) && str_starts_with($data['chatbot_api_key'], '••••')) {
            unset($data['chatbot_api_key']);
        }

        Setting::updateOrCreate(
            ['country_id' => $countryId],
            $data
        );

        return response()->json(['message' => 'تم حفظ الإعدادات']);
    }
}
