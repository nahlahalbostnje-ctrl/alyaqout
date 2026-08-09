<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePurchaseRequest;
use App\Services\CoursePurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoursePurchaseController extends Controller
{
    public function __construct(
        private readonly CoursePurchaseService $purchases,
    ) {}

    /** POST /student/catalog/{course}/purchase-request */
    public function request(Request $request, Course $course): JsonResponse
    {
        $student = auth()->user();
        abort_unless($student->role === 'student', 403);
        abort_unless((int) $course->country_id === (int) $student->country_id, 404);

        $data = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $row = $this->purchases->request(
            $course,
            $student,
            $student,
            $data['notes'] ?? 'طلب شراء من الطالب',
        );

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب الشراء. سيُفعّل بعد موافقة الإدارة.',
            'data'    => $this->purchases->format($row),
        ], 201);
    }

    /** GET /student/catalog/{course}/purchase-request — حالة آخر طلب */
    public function status(Course $course): JsonResponse
    {
        $student = auth()->user();
        abort_unless((int) $course->country_id === (int) $student->country_id, 404);

        $row = CoursePurchaseRequest::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data'    => $row ? $this->purchases->format($row) : null,
        ]);
    }
}
