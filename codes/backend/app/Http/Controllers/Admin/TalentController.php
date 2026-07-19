<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Talent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TalentController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Talent::where('country_id', Auth::user()->country_id)
            ->with('student:id,name,phone')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Talent $t) => [
                'id'           => $t->id,
                'display_name' => $t->display_name,
                'talent_name'  => $t->talent_name,
                'grade_label'  => $t->grade_label,
                'age'          => $t->age,
                'goal'         => $t->goal,
                'dream'        => $t->dream,
                'bio'          => $t->bio,
                'student'      => $t->student
                    ? ['id' => $t->student->id, 'name' => $t->student->name, 'phone' => $t->student->phone]
                    : null,
                'created_at'   => $t->created_at?->toISOString(),
            ]);

        return response()->json(['talents' => $items]);
    }
}
