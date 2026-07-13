<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

        $users = $query->get(['id', 'name', 'phone', 'email', 'role', 'address', 'city_id', 'is_active', 'created_at']);

        $users->transform(function (User $u) {
            if ($u->role === 'parent') {
                $u->phone = $this->maskPhone($u->phone);
            }
            return $u;
        });

        return response()->json(['success' => true, 'data' => $users]);
    }

    /**
     * Admin only sees a masked phone for parents — full number is Super Admin-only.
     */
    private function maskPhone(string $phone): string
    {
        $len = strlen($phone);
        if ($len <= 4) {
            return str_repeat('*', $len);
        }
        return str_repeat('*', $len - 4) . substr($phone, -4);
    }

    public function store(Request $request): JsonResponse
    {
        $learner = in_array($request->role, ['student', 'parent'], true);

        $request->validate([
            'name'      => 'required|string|max:255',
            'phone'     => 'required|string|max:20|unique:users,phone',
            'role'      => 'required|in:teacher,student,parent',
            'parent_id' => 'nullable|exists:users,id',
            'address'   => 'nullable|string|max:500',
            'city_id'   => 'nullable|exists:cities,id',
            'email'     => [
                Rule::requiredIf(fn () => $learner),
                'nullable', 'email', 'max:255', 'unique:users,email',
            ],
            'password'  => [
                Rule::requiredIf(fn () => $learner),
                'nullable', 'string', 'min:6', 'max:100',
            ],
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
            'email'      => $request->filled('email') ? strtolower(trim($request->email)) : null,
            'password'   => $request->filled('password') ? $request->password : null,
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
            'data'    => $user->only(['id', 'name', 'phone', 'email', 'role', 'address', 'city_id', 'parent_id', 'is_active', 'created_at']),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorizeUser($user);

        $learner = in_array($user->role, ['student', 'parent'], true);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'phone'    => 'sometimes|string|max:20|unique:users,phone,'.$user->id,
            'address'  => 'nullable|string|max:500',
            'city_id'  => 'nullable|exists:cities,id',
            'email'    => [
                Rule::requiredIf(fn () => $learner && $request->has('email')),
                'nullable', 'email', 'max:255', 'unique:users,email,'.$user->id,
            ],
            'password' => 'nullable|string|min:6|max:100',
        ]);

        $data = $request->only(['name', 'phone', 'address', 'city_id']);
        if ($request->has('email')) {
            $data['email'] = $request->filled('email')
                ? strtolower(trim((string) $request->email))
                : null;
        }
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الحساب.',
            'data'    => $user->only(['id', 'name', 'phone', 'email', 'role', 'address', 'city_id', 'is_active']),
        ]);
    }

    public function changeRole(Request $request, User $user): JsonResponse
    {
        $this->authorizeUser($user);

        $request->validate([
            'role' => 'required|in:teacher,student,parent',
        ]);

        $user->update([
            'role'      => $request->role,
            'parent_id' => $request->role === 'student' ? $user->parent_id : null,
            'city_id'   => $request->role === 'student' ? $user->city_id : null,
            'address'   => $request->role === 'teacher' ? $user->address : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحويل الحساب بنجاح.',
            'data'    => $user->only(['id', 'name', 'phone', 'role', 'is_active']),
        ]);
    }

    public function unlinkParent(User $user): JsonResponse
    {
        $this->authorizeUser($user);

        if ($user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'فك الربط متاح للطلاب فقط.'], 422);
        }

        $user->update(['parent_id' => null]);

        return response()->json(['success' => true, 'message' => 'تم فك الربط بنجاح.']);
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
