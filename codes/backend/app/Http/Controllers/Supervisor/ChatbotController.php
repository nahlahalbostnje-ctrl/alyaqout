<?php

declare(strict_types=1);

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    public function __construct(private readonly ChatbotService $chatbot) {}

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message'           => 'required|string|max:1000',
            'history'           => 'nullable|array|max:10',
            'history.*.role'    => 'required|in:user,assistant',
            'history.*.content' => 'required|string|max:2000',
        ]);

        $countryId = (int) Auth::user()->country_id;

        $reply = $this->chatbot->chat(
            $countryId,
            $validated['message'],
            $validated['history'] ?? [],
            'supervisor'
        );

        return response()->json(['reply' => $reply]);
    }
}
