<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ExamSubmission;
use App\Models\User;
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
        $context   = $this->buildParentContext(Auth::id());

        $reply = $this->chatbot->chat(
            $countryId,
            $validated['message'],
            $validated['history'] ?? [],
            'parent',
            $context,
        );

        return response()->json(['reply' => $reply]);
    }

    private function buildParentContext(int $parentId): array
    {
        try {
            $children = User::where('parent_id', $parentId)->where('role', 'student')->get();

            $childrenData = $children->map(function (User $child) {
                $total   = Attendance::where('student_id', $child->id)->count();
                $present = Attendance::where('student_id', $child->id)->where('status', 'present')->count();
                $pct     = $total > 0 ? round($present / $total * 100) : 0;

                $avgScore = ExamSubmission::where('student_id', $child->id)->avg('score');

                return [
                    'name'            => $child->name,
                    'attendance_pct'  => $pct,
                    'avg_score'       => $avgScore ? round($avgScore) : 0,
                ];
            })->toArray();

            return ['children' => $childrenData];
        } catch (\Throwable) {
            return [];
        }
    }
}
