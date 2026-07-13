<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /** GET /super-admin/users?role=&country_id=&q= */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role'       => 'nullable|in:teacher,supervisor,student,parent,admin',
            'country_id' => 'nullable|exists:countries,id',
            'q'          => 'nullable|string|max:100',
        ]);

        $query = User::query()
            ->with(['country:id,name,code'])
            ->whereNull('deleted_at')
            ->whereIn('role', ['teacher', 'supervisor', 'student', 'parent', 'admin'])
            ->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('country_id')) {
            $query->where('country_id', (int) $request->country_id);
        }

        if ($request->filled('q')) {
            $q = '%'.$request->q.'%';
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', $q)
                    ->orWhere('phone', 'like', $q)
                    ->orWhere('email', 'like', $q);
            });
        }

        $users = $query->get([
            'id', 'name', 'phone', 'email', 'role', 'country_id',
            'is_active', 'parent_id', 'created_at',
        ])->map(fn (User $u) => $this->format($u));

        return response()->json([
            'success' => true,
            'data'    => $users,
            'meta'    => [
                'total'       => $users->count(),
                'teachers'    => User::where('role', 'teacher')->whereNull('deleted_at')->count(),
                'supervisors' => User::where('role', 'supervisor')->whereNull('deleted_at')->count(),
                'students'    => User::where('role', 'student')->whereNull('deleted_at')->count(),
                'parents'     => User::where('role', 'parent')->whereNull('deleted_at')->count(),
                'active_teachers' => User::where('role', 'teacher')->where('is_active', true)->whereNull('deleted_at')->count(),
                'active_students' => User::where('role', 'student')->where('is_active', true)->whereNull('deleted_at')->count(),
            ],
        ]);
    }

    /** POST /super-admin/users */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'phone'      => 'required|string|max:20|unique:users,phone',
            'role'       => 'required|in:teacher,supervisor,student,parent',
            'country_id' => 'required|exists:countries,id',
            'email'      => [
                'nullable', 'email', 'max:255',
                Rule::unique('users', 'email'),
                Rule::requiredIf(fn () => in_array($request->role, ['teacher', 'supervisor'], true) && $request->filled('password')),
            ],
            'password'   => 'nullable|string|min:6|max:100',
            'parent_id'  => 'nullable|exists:users,id',
        ]);

        $phone = PhoneNormalizer::toStorage($request->phone);

        if (User::where('phone', $phone)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'رقم الجوال مسجّل مسبقاً.',
            ], 422);
        }

        $parentId = null;
        if ($request->role === 'student' && $request->filled('parent_id')) {
            $parent = User::where('id', $request->parent_id)
                ->where('role', 'parent')
                ->where('country_id', $request->country_id)
                ->first();
            $parentId = $parent?->id;
        }

        $email = $request->filled('email') ? strtolower(trim($request->email)) : null;

        $user = User::create([
            'name'       => $request->name,
            'phone'      => $phone,
            'email'      => $email,
            'password'   => $request->filled('password') ? $request->password : null,
            'role'       => $request->role,
            'country_id' => (int) $request->country_id,
            'parent_id'  => $parentId,
            'is_active'  => true,
        ]);

        $user->load('country:id,name,code');

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الحساب بنجاح.',
            'data'    => $this->format($user),
        ], 201);
    }

    /** PATCH /super-admin/users/{user}/toggle */
    public function toggle(User $user): JsonResponse
    {
        $this->authorizeManaged($user);

        $user->update(['is_active' => ! $user->is_active]);
        $user->load('country:id,name,code');

        return response()->json([
            'success' => true,
            'data'    => $this->format($user),
        ]);
    }

    /** DELETE /super-admin/users/{user} */
    public function destroy(User $user): JsonResponse
    {
        $this->authorizeManaged($user);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الحساب.',
        ]);
    }

    private function authorizeManaged(User $user): void
    {
        if ($user->role === 'super_admin') {
            abort(403, 'لا يمكن تعديل حساب السوبر أدمن من هنا.');
        }
        if (! in_array($user->role, ['teacher', 'supervisor', 'student', 'parent', 'admin'], true)) {
            abort(403, 'غير مصرح.');
        }
    }

    private function format(User $u): array
    {
        return [
            'id'           => $u->id,
            'name'         => $u->name,
            'phone'        => $u->phone,
            'email'        => $u->email,
            'role'         => $u->role,
            'country_id'   => $u->country_id,
            'country'      => $u->country?->name,
            'country_code' => $u->country?->code,
            'is_active'    => $u->is_active,
            'parent_id'    => $u->parent_id,
            'created_at'   => $u->created_at?->toIso8601String(),
        ];
    }
}
