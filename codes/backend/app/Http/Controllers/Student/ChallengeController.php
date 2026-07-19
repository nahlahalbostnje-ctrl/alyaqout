<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Services\ChallengeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChallengeController extends Controller
{
    public function __construct(private readonly ChallengeService $challenges) {}

    public function index(): JsonResponse
    {
        $studentId = (int) Auth::id();

        $items = Challenge::where('student_id', $studentId)
            ->whereIn('status', ['pending', 'active', 'completed'])
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END")
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Challenge $c) => $this->challenges->format($c));

        return response()->json(['challenges' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'         => 'required|in:individual,family',
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'category'     => 'nullable|in:reading,homework,study,attendance,custom',
            'target_value' => 'required|integer|min:1|max:10000',
            'unit'         => 'nullable|string|max:50',
            'ends_at'      => 'nullable|date|after_or_equal:today',
        ]);

        $student = Auth::user();

        $challenge = $data['type'] === 'family'
            ? $this->challenges->createFamilyByStudent($student, $data)
            : $this->challenges->createIndividual($student, $data);

        return response()->json([
            'message'   => $challenge->status === 'pending'
                ? 'تم إرسال التحدي العائلي لولي الأمر بانتظار الموافقة'
                : 'تم إنشاء التحدي',
            'challenge' => $this->challenges->format($challenge),
        ], 201);
    }

    public function addProgress(Request $request, Challenge $challenge): JsonResponse
    {
        abort_unless((int) $challenge->student_id === (int) Auth::id(), 403);

        $data = $request->validate([
            'amount' => 'nullable|integer|min:1|max:100',
            'note'   => 'nullable|string|max:500',
        ]);

        $updated = $this->challenges->addProgress(
            $challenge,
            Auth::user(),
            (int) ($data['amount'] ?? 1),
            $data['note'] ?? null
        );

        return response()->json([
            'message'   => $updated->status === 'completed' ? 'أحسنت! أُكمل التحدي' : 'تم تسجيل التقدم',
            'challenge' => $this->challenges->format($updated),
        ]);
    }

    public function cancel(Challenge $challenge): JsonResponse
    {
        abort_unless((int) $challenge->student_id === (int) Auth::id(), 403);

        $updated = $this->challenges->cancel($challenge, Auth::user());

        return response()->json([
            'message'   => 'تم إلغاء التحدي',
            'challenge' => $this->challenges->format($updated),
        ]);
    }
}
