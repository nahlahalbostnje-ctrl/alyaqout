<?php

declare(strict_types=1);

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(): JsonResponse
    {
        $conversations = Conversation::where('teacher_id', Auth::id())
            ->with(['parent:id,name', 'student:id,name'])
            ->withCount(['messages as unread_count' => function ($q) {
                $q->where('is_read', false)->where('sender_id', '!=', Auth::id());
            }])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $conversations->map(fn (Conversation $c) => [
                'id'              => $c->id,
                'parent'          => $c->parent->name,
                'student'         => $c->student->name,
                'unread_count'    => $c->unread_count,
                'last_message'    => $c->messages()->latest()->first()?->body,
                'last_message_at' => $c->last_message_at?->format('Y-m-d H:i'),
            ])->values(),
        ]);
    }

    public function show(Conversation $conversation): JsonResponse
    {
        if ($conversation->teacher_id !== Auth::id()) {
            abort(403, 'غير مصرح.');
        }

        $conversation->messages()->where('sender_id', '!=', Auth::id())->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => $conversation->messages()->with('sender:id,name')->oldest()->get()
                ->map(fn (Message $m) => [
                    'id'         => $m->id,
                    'body'       => $m->body,
                    'is_mine'    => $m->sender_id === Auth::id(),
                    'sender'     => $m->sender->name,
                    'created_at' => $m->created_at->format('Y-m-d H:i'),
                ])->values(),
        ]);
    }

    public function store(Request $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->teacher_id !== Auth::id()) {
            abort(403, 'غير مصرح.');
        }

        $request->validate(['body' => 'required|string|max:2000']);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => Auth::id(),
            'body'            => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['success' => true, 'data' => [
            'id' => $message->id, 'body' => $message->body, 'is_mine' => true,
            'created_at' => $message->created_at->format('Y-m-d H:i'),
        ]], 201);
    }
}
