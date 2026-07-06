<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Course;
use App\Models\ExamSubmission;
use App\Models\HomeworkSubmission;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    private function ownChild(int $studentId): User
    {
        return User::where('id', $studentId)
            ->where('parent_id', Auth::id())
            ->where('role', 'student')
            ->firstOrFail();
    }

    /**
     * Teachers this student has real activity with (via homework/exam submissions),
     * falling back to all active teachers in the country if there is no activity yet.
     */
    public function teachersForChild(int $studentId): JsonResponse
    {
        $student = $this->ownChild($studentId);

        $courseIds = HomeworkSubmission::where('student_id', $studentId)
            ->with('homework:id,course_id')
            ->get()
            ->pluck('homework.course_id')
            ->merge(
                ExamSubmission::where('student_id', $studentId)
                    ->with('exam:id,course_id')
                    ->get()
                    ->pluck('exam.course_id')
            )
            ->filter()
            ->unique();

        $teacherIds = $courseIds->isNotEmpty()
            ? Course::whereIn('id', $courseIds)->pluck('teacher_id')->filter()->unique()
            : collect();

        $teachers = $teacherIds->isNotEmpty()
            ? User::where('role', 'teacher')->whereIn('id', $teacherIds)->get(['id', 'name'])
            : User::where('role', 'teacher')
                ->where('country_id', $student->country_id)
                ->where('is_active', true)
                ->get(['id', 'name']);

        return response()->json(['success' => true, 'data' => $teachers]);
    }

    public function index(): JsonResponse
    {
        $conversations = Conversation::where('parent_id', Auth::id())
            ->with(['teacher:id,name', 'student:id,name'])
            ->withCount(['messages as unread_count' => function ($q) {
                $q->where('is_read', false)->where('sender_id', '!=', Auth::id());
            }])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $conversations->map(fn (Conversation $c) => [
                'id'           => $c->id,
                'teacher'      => $c->teacher->name,
                'student'      => $c->student->name,
                'unread_count' => $c->unread_count,
                'last_message' => $c->messages()->latest()->first()?->body,
                'last_message_at' => $c->last_message_at?->format('Y-m-d H:i'),
            ])->values(),
        ]);
    }

    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|integer',
            'teacher_id' => 'required|integer|exists:users,id',
        ]);

        $student = $this->ownChild((int) $request->student_id);

        $teacher = User::where('id', $request->teacher_id)
            ->where('role', 'teacher')
            ->where('country_id', $student->country_id)
            ->firstOrFail();

        $conversation = Conversation::firstOrCreate([
            'parent_id'  => Auth::id(),
            'teacher_id' => $teacher->id,
            'student_id' => $student->id,
        ], [
            'country_id' => $student->country_id,
        ]);

        return response()->json(['success' => true, 'data' => ['id' => $conversation->id]]);
    }

    public function show(Conversation $conversation): JsonResponse
    {
        if ($conversation->parent_id !== Auth::id()) {
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
        if ($conversation->parent_id !== Auth::id()) {
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
