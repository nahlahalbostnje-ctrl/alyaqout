<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\TimeCapsule;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class TimeCapsuleController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function index(): JsonResponse
    {
        $items = TimeCapsule::where('student_id', Auth::id())
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get()
            ->map(fn (TimeCapsule $c) => $this->format($c));

        return response()->json(['capsules' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        $now  = now();

        $data = $request->validate([
            'message' => 'required|string|max:2000',
            'year'    => 'nullable|integer|min:2024|max:2100',
            'month'   => 'nullable|integer|min:1|max:12',
        ]);

        $year  = (int) ($data['year'] ?? $now->year);
        $month = (int) ($data['month'] ?? $now->month);

        if (TimeCapsule::where('student_id', $user->id)->where('year', $year)->where('month', $month)->exists()) {
            throw ValidationException::withMessages([
                'month' => ['لديك كبسولة لهذا الشهر بالفعل.'],
            ]);
        }

        $remindAt = now()->setDate($year, $month, 1)->endOfMonth()->toDateString();

        $capsule = TimeCapsule::create([
            'student_id' => $user->id,
            'country_id' => (int) $user->country_id,
            'year'       => $year,
            'month'      => $month,
            'message'    => $data['message'],
            'remind_at'  => $remindAt,
        ]);

        $this->notifications->send(
            $user,
            'كُبست رسالتك الزمنية',
            'سنذكّرك برسالتك قبل نهاية الشهر.',
            'time_capsule',
            ['capsule_id' => $capsule->id]
        );

        return response()->json([
            'message' => 'تم حفظ الكبسولة الزمنية',
            'capsule' => $this->format($capsule),
        ], 201);
    }

    public function open(TimeCapsule $timeCapsule): JsonResponse
    {
        abort_unless((int) $timeCapsule->student_id === (int) Auth::id(), 403);

        if (! $timeCapsule->opened_at && $timeCapsule->remind_at->lte(now()->startOfDay())) {
            $timeCapsule->update(['opened_at' => now()]);
        }

        return response()->json(['capsule' => $this->format($timeCapsule->fresh())]);
    }

    private function format(TimeCapsule $c): array
    {
        $canOpen = $c->remind_at->lte(now()->startOfDay()) || $c->opened_at !== null;

        return [
            'id'         => $c->id,
            'year'       => $c->year,
            'month'      => $c->month,
            'message'    => $canOpen ? $c->message : null,
            'sealed'     => ! $canOpen,
            'remind_at'  => $c->remind_at->toDateString(),
            'opened_at'  => $c->opened_at?->toISOString(),
            'created_at' => $c->created_at?->toISOString(),
        ];
    }
}
