<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Talent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TalentController extends Controller
{
    public function show(): JsonResponse
    {
        $talent = Talent::where('student_id', Auth::id())->first();

        return response()->json([
            'talent' => $talent ? $this->format($talent) : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (Talent::where('student_id', Auth::id())->exists()) {
            return response()->json(['message' => 'لديك ملف موهبة بالفعل — يمكنك تعديله.'], 422);
        }

        $data = $this->validated($request);
        $user = Auth::user();

        $talent = Talent::create([
            ...$data,
            'student_id' => $user->id,
            'country_id' => (int) $user->country_id,
        ]);

        return response()->json([
            'message' => 'تم إنشاء ملف موهبتك',
            'talent'  => $this->format($talent),
        ], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $talent = Talent::where('student_id', Auth::id())->firstOrFail();
        $talent->update($this->validated($request));

        return response()->json([
            'message' => 'تم تحديث ملف الموهبة',
            'talent'  => $this->format($talent->fresh()),
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'display_name' => 'required|string|max:255',
            'talent_name'  => 'required|string|max:255',
            'grade_label'  => 'nullable|string|max:100',
            'age'          => 'nullable|integer|min:5|max:25',
            'goal'         => 'nullable|string|max:1000',
            'dream'        => 'nullable|string|max:1000',
            'bio'          => 'nullable|string|max:2000',
        ]);
    }

    private function format(Talent $t): array
    {
        return [
            'id'           => $t->id,
            'display_name' => $t->display_name,
            'talent_name'  => $t->talent_name,
            'grade_label'  => $t->grade_label,
            'age'          => $t->age,
            'goal'         => $t->goal,
            'dream'        => $t->dream,
            'bio'          => $t->bio,
            'created_at'   => $t->created_at?->toISOString(),
            'updated_at'   => $t->updated_at?->toISOString(),
        ];
    }
}
