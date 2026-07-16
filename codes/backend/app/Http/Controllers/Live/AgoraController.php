<?php

declare(strict_types=1);

namespace App\Http\Controllers\Live;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\LiveClass;
use App\Services\AgoraService;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AgoraController extends Controller
{
    public function __construct(
        private readonly AgoraService       $agora,
        private readonly GamificationService $gamification,
    ) {}

    /** توليد توكن Agora للمستخدم المصادق (معلم أو طالب) */
    public function token(Request $request): JsonResponse
    {
        $request->validate(['class_id' => 'required|integer|exists:live_classes,id']);

        $liveClass = LiveClass::findOrFail($request->class_id);
        $user      = Auth::user();
        $uid       = (int) $user->id;

        if (!$liveClass->agora_channel) {
            return response()->json(['message' => 'هذه الحصة لا تحتوي على قناة بث. تواصل مع المسؤول.'], 422);
        }

        if (! $liveClass->isApproved()) {
            return response()->json(['message' => 'هذه الحصة لم تُعتمد بعد من الإدارة.'], 422);
        }

        if ($liveClass->isArchived()) {
            return response()->json(['message' => 'هذه الحصة مؤرشفة.'], 422);
        }

        $isTeacher = $user->role === 'teacher' && (int) $liveClass->teacher_id === $uid;
        $role      = $isTeacher ? AgoraService::ROLE_PUBLISHER : AgoraService::ROLE_SUBSCRIBER;

        $token = $this->agora->generateToken($liveClass->agora_channel, $uid, $role);

        return response()->json([
            'token'       => $token,
            'channel'     => $liveClass->agora_channel,
            'uid'         => $uid,
            'app_id'      => config('agora.app_id'),
            'role'        => $isTeacher ? 'publisher' : 'subscriber',
            'class_title' => $liveClass->title,
        ]);
    }

    /** المعلم يبدأ البث — يغيّر الحالة إلى live */
    public function start(int $classId): JsonResponse
    {
        $liveClass = LiveClass::findOrFail($classId);
        $uid       = (int) Auth::id();

        if ((int) $liveClass->teacher_id !== $uid) {
            return response()->json(['message' => 'غير مصرح.'], 403);
        }

        if (! $liveClass->isApproved()) {
            return response()->json(['message' => 'لا يمكن بدء الحصة قبل موافقة الإدارة.'], 422);
        }

        if ($liveClass->isArchived()) {
            return response()->json(['message' => 'هذه الحصة مؤرشفة.'], 422);
        }

        if ($liveClass->status === 'ended') {
            return response()->json(['message' => 'هذه الحصة منتهية ولا يمكن إعادة بدئها.'], 422);
        }

        $liveClass->update(['status' => 'live']);

        $token = $this->agora->generateToken($liveClass->agora_channel, $uid, AgoraService::ROLE_PUBLISHER);

        return response()->json([
            'token'       => $token,
            'channel'     => $liveClass->agora_channel,
            'uid'         => $uid,
            'app_id'      => config('agora.app_id'),
            'role'        => 'publisher',
            'class_title' => $liveClass->title,
            'status'      => 'live',
        ]);
    }

    /** المعلم ينهي البث */
    public function end(int $classId): JsonResponse
    {
        $liveClass = LiveClass::findOrFail($classId);

        if ((int) $liveClass->teacher_id !== (int) Auth::id()) {
            return response()->json(['message' => 'غير مصرح.'], 403);
        }

        $liveClass->update(['status' => 'ended']);

        return response()->json(['message' => 'تم إنهاء الحصة.', 'status' => 'ended']);
    }

    /** الطالب ينضم — يسجّل الحضور ويمنح النقاط مرة واحدة */
    public function attend(int $classId): JsonResponse
    {
        $liveClass = LiveClass::findOrFail($classId);
        $studentId = (int) Auth::id();

        $existing = AttendanceRecord::where('student_id', $studentId)
            ->where('live_class_id', $classId)
            ->first();

        AttendanceRecord::updateOrCreate(
            ['student_id' => $studentId, 'live_class_id' => $classId],
            ['status' => 'present', 'recorded_at' => now()]
        );

        if (!$existing) {
            $this->gamification->award($studentId, 'attend_class', $liveClass->title);
        }

        return response()->json(['message' => 'تم تسجيل حضورك.']);
    }

    /** قائمة المشاركين الحاضرين */
    public function participants(int $classId): JsonResponse
    {
        $records = AttendanceRecord::where('live_class_id', $classId)
            ->where('status', 'present')
            ->with('student:id,name')
            ->get()
            ->map(fn ($r) => ['id' => $r->student_id, 'name' => $r->student?->name]);

        return response()->json(['data' => $records, 'count' => $records->count()]);
    }
}
