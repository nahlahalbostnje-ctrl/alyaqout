<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\GamificationPoint;

class GamificationService
{
    const POINTS = [
        'attend_class'    => 10,
        'submit_homework' => 5,
        'submit_exam'     => 15,
        'complete_video'  => 3,
    ];

    public function award(int $studentId, string $action, string $description = ''): GamificationPoint
    {
        return GamificationPoint::create([
            'student_id'  => $studentId,
            'action'      => $action,
            'points'      => self::POINTS[$action] ?? 1,
            'description' => $description,
            'earned_at'   => now(),
        ]);
    }

    public function totalPoints(int $studentId): int
    {
        return (int) GamificationPoint::where('student_id', $studentId)->sum('points');
    }
}
