<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'nullable|in:teacher,student,parent',
        ]);

        $query = User::where('country_id', $this->countryId())
            ->whereIn('role', ['teacher', 'student', 'parent'])
            ->whereNull('deleted_at')
            ->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->get(['id', 'name', 'phone', 'role', 'address', 'city_id', 'is_active', 'created_at']);

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'phone'     => 'required|string|max:20|unique:users,phone',
            'role'      => 'required|in:teacher,student,parent',
            'parent_id' => 'nullable|exists:users,id',
            'address'   => 'nullable|string|max:500',
            'city_id'   => 'nullable|exists:cities,id',
        ]);

        $parentId = null;
        if ($request->role === 'student' && $request->filled('parent_id')) {
            $parent = User::where('id', $request->parent_id)
                ->where('country_id', $this->countryId())
                ->where('role', 'parent')
                ->first();
            if ($parent) {
                $parentId = $parent->id;
            }
        }

        $user = User::create([
            'name'       => $request->name,
            'phone'      => $request->phone,
            'role'       => $request->role,
            'country_id' => $this->countryId(),
            'parent_id'  => $parentId,
            'address'    => $request->role === 'teacher' ? $request->address : null,
            'city_id'    => $request->role === 'student' ? $request->city_id : null,
            'is_active'  => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الحساب بنجاح.',
            'data'    => $user->only(['id', 'name', 'phone', 'role', 'address', 'city_id', 'parent_id', 'is_active', 'created_at']),
        ], 201);
    }

    public function toggle(User $user): JsonResponse
    {
        $this->authorizeUser($user);

        $user->update(['is_active' => ! $user->is_active]);

        return response()->json(['success' => true, 'data' => $user->only(['id', 'name', 'phone', 'role', 'is_active'])]);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorizeUser($user);

        $user->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الحساب.']);
    }

    private function authorizeUser(User $user): void
    {
        if ($user->country_id !== $this->countryId() || ! in_array($user->role, ['teacher', 'student', 'parent'])) {
            abort(403, 'غير مصرح.');
        }
    }
}
