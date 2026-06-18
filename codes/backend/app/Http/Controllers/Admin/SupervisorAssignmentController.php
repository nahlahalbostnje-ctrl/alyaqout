<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupervisorStudent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupervisorAssignmentController extends Controller
{
    public function supervisors(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $supervisors = User::where('country_id', $countryId)
            ->where('role', 'supervisor')
            ->where('is_active', true)
            ->select('id', 'name', 'phone')
            ->withCount(['supervisorStudents as student_count'])
            ->get();

        return response()->json(['supervisors' => $supervisors]);
    }

    public function supervisorStudents(User $supervisor): JsonResponse
    {
        abort_if($supervisor->country_id !== Auth::user()->country_id, 403);
        abort_if($supervisor->role !== 'supervisor', 422);

        $studentIds = SupervisorStudent::where('supervisor_id', $supervisor->id)->pluck('student_id');

        $students = User::whereIn('id', $studentIds)
            ->select('id', 'name', 'phone', 'grade_id')
            ->with('grade:id,name')
            ->get();

        return response()->json([
            'supervisor' => ['id' => $supervisor->id, 'name' => $supervisor->name],
            'students'   => $students,
        ]);
    }

    public function assign(Request $request, User $supervisor): JsonResponse
    {
        abort_if($supervisor->country_id !== Auth::user()->country_id, 403);
        abort_if($supervisor->role !== 'supervisor', 422);

        $request->validate(['student_id' => 'required|exists:users,id']);

        $student = User::findOrFail((int) $request->student_id);
        abort_if($student->country_id !== Auth::user()->country_id, 403);
        abort_if($student->role !== 'student', 422);

        SupervisorStudent::firstOrCreate([
            'supervisor_id' => $supervisor->id,
            'student_id'    => $student->id,
        ]);

        return response()->json(['message' => 'تم تعيين الطالب للمشرف']);
    }

    public function unassign(User $supervisor, int $studentId): JsonResponse
    {
        abort_if($supervisor->country_id !== Auth::user()->country_id, 403);

        SupervisorStudent::where('supervisor_id', $supervisor->id)
            ->where('student_id', $studentId)
            ->delete();

        return response()->json(['message' => 'تم إزالة الطالب من المشرف']);
    }

    public function unassignedStudents(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $assignedIds = SupervisorStudent::pluck('student_id');

        $students = User::where('country_id', $countryId)
            ->where('role', 'student')
            ->where('is_active', true)
            ->whereNotIn('id', $assignedIds)
            ->select('id', 'name', 'phone', 'grade_id')
            ->with('grade:id,name')
            ->get();

        return response()->json(['students' => $students]);
    }
}
