<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StudentEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TeacherContactController extends Controller
{
    public function __construct(private readonly StudentEntitlementService $entitlement) {}

    /** معلمو الدورات المتاحة للطالب. */
    public function teachers(): JsonResponse
    {
        $student = Auth::user();
        $courseIds = $this->entitlement->courseIdsFor($student);

        if ($courseIds === []) {
            return response()->json(['teachers' => []]);
        }

        $teachers = User::query()
            ->where('role', 'teacher')
            ->whereIn('id', function ($q) use ($courseIds) {
                $q->select('teacher_id')
                    ->from('courses')
                    ->whereIn('id', $courseIds)
                    ->whereNotNull('teacher_id');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email'])
            ->map(fn (User $t) => [
                'id'    => $t->id,
                'name'  => $t->name,
                'phone' => $t->phone,
                'email' => $t->email,
            ]);

        return response()->json(['teachers' => $teachers]);
    }
}
