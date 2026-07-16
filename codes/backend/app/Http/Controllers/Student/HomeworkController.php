<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeworkController extends Controller
{
    public function __construct(private readonly GamificationService $gamification) {}
    public function index(): JsonResponse
    {
        $student   = Auth::user();
        $countryId = (int) $student->country_id;

        $homeworks = Homework::where('status', 'approved')
            ->whereNull('archived_at')
            ->whereHas('course', fn ($q) => $q->where('country_id', $countryId)->where('is_active', true))
            ->with('course:id,title')
            ->orderBy('due_date')
            ->get();

        $submittedMap = HomeworkSubmission::where('student_id', Auth::id())
            ->get(['homework_id', 'status', 'grade'])
            ->keyBy('homework_id');

        return response()->json([
            'data' => $homeworks->map(function ($h) use ($submittedMap) {
                $sub = $submittedMap[$h->id] ?? null;
                return [
                    'id'          => $h->id,
                    'title'       => $h->title,
                    'description' => $h->description,
                    'due_date'    => $h->due_date?->toDateString(),
                    'course'      => ['id' => $h->course->id, 'title' => $h->course->title],
                    'is_overdue'  => $h->due_date?->isPast(),
                    'submitted'   => $sub !== null,
                    'sub_status'  => $sub?->status,
                    'grade'       => $sub?->grade,
                ];
            }),
        ]);
    }

    public function submit(Request $request, Homework $homework): JsonResponse
    {
        $studentId = (int) Auth::id();

        abort_if($homework->status !== 'approved', 403);
        abort_if(
            HomeworkSubmission::where('homework_id', $homework->id)->where('student_id', $studentId)->exists(),
            422,
            'لقد سبق لك تسليم هذا الواجب'
        );

        $data = $request->validate([
            'file_url' => 'required|string|max:2048',
            'notes'    => 'nullable|string|max:1000',
        ]);

        $status = $homework->due_date?->isPast() ? 'late' : 'submitted';

        HomeworkSubmission::create([
            'homework_id'  => $homework->id,
            'student_id'   => $studentId,
            'file_url'     => $data['file_url'],
            'notes'        => $data['notes'] ?? null,
            'status'       => $status,
            'submitted_at' => now(),
        ]);

        $this->gamification->award($studentId, 'submit_homework', $homework->title);

        return response()->json([
            'message' => $status === 'late' ? 'تم التسليم (متأخر)' : 'تم التسليم بنجاح',
        ], 201);
    }
}
