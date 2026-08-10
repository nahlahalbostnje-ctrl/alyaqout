<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePurchaseRequest;
use App\Models\User;
use App\Services\CoursePurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CoursePurchaseController extends Controller
{
    public function __construct(
        private readonly CoursePurchaseService $purchases,
    ) {}

    /** POST /parent/course-purchases/request */
    public function request(Request $request): JsonResponse
    {
        $parent = Auth::user();

        $data = $request->validate([
            'student_id' => 'required|integer|exists:users,id',
            'course_id'  => 'required|integer|exists:courses,id',
            'notes'      => 'nullable|string|max:500',
        ]);

        $student = User::where('id', $data['student_id'])
            ->where('parent_id', $parent->id)
            ->where('role', 'student')
            ->firstOrFail();

        abort_if((int) $student->country_id !== (int) $parent->country_id, 403);

        $course = Course::where('id', $data['course_id'])
            ->where('country_id', $parent->country_id)
            ->firstOrFail();

        $row = $this->purchases->request(
            $course,
            $student,
            $parent,
            $data['notes'] ?? 'طلب شراء من ولي الأمر',
        );

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب شراء المساق. سيُفعّل بعد موافقة الإدارة.',
            'data'    => $this->purchases->format($row),
        ], 201);
    }

    /** GET /parent/course-purchases */
    public function index(): JsonResponse
    {
        $parent = Auth::user();
        $childIds = User::where('parent_id', $parent->id)->where('role', 'student')->pluck('id');

        $rows = CoursePurchaseRequest::query()
            ->whereIn('student_id', $childIds)
            ->with(['student:id,name', 'course:id,title,price', 'requester:id,name,role'])
            ->latest()
            ->limit(100)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $rows->map(fn (CoursePurchaseRequest $r) => $this->purchases->format($r))->values(),
        ]);
    }
}
