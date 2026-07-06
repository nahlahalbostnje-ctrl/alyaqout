<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Read-only oversight: every parent↔teacher conversation across every country.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['country_id' => 'nullable|integer']);

        $query = Conversation::with(['parent:id,name', 'teacher:id,name', 'student:id,name', 'country:id,name'])
            ->withCount('messages')
            ->orderByDesc('last_message_at');

        if ($request->filled('country_id')) {
            $query->where('country_id', $request->country_id);
        }

        $conversations = $query->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $conversations->through(fn (Conversation $c) => [
                'id'              => $c->id,
                'country'         => $c->country->name,
                'parent'          => $c->parent->name,
                'teacher'         => $c->teacher->name,
                'student'         => $c->student->name,
                'messages_count'  => $c->messages_count,
                'last_message_at' => $c->last_message_at?->format('Y-m-d H:i'),
            ]),
        ]);
    }

    public function show(Conversation $conversation): JsonResponse
    {
        $conversation->load(['parent:id,name', 'teacher:id,name', 'student:id,name', 'country:id,name']);

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => [
                    'country' => $conversation->country->name,
                    'parent'  => $conversation->parent->name,
                    'teacher' => $conversation->teacher->name,
                    'student' => $conversation->student->name,
                ],
                'messages' => $conversation->messages()->with('sender:id,name')->oldest()->get()
                    ->map(fn (Message $m) => [
                        'id'         => $m->id,
                        'body'       => $m->body,
                        'sender'     => $m->sender->name,
                        'created_at' => $m->created_at->format('Y-m-d H:i'),
                    ])->values(),
            ],
        ]);
    }
}
