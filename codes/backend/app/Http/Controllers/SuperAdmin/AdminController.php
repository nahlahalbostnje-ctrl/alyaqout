<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function store(Request $request, Country $country): JsonResponse
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
        ]);

        $admin = User::create([
            'name'       => $request->name,
            'phone'      => $request->phone,
            'role'       => 'admin',
            'country_id' => $country->id,
            'is_active'  => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب المدير بنجاح.',
            'data'    => $this->formatAdmin($admin),
        ], 201);
    }

    public function index(Country $country): JsonResponse
    {
        $admins = User::where('country_id', $country->id)
            ->where('role', 'admin')
            ->whereNull('deleted_at')
            ->orderBy('created_at')
            ->get()
            ->map(fn (User $u) => $this->formatAdmin($u));

        return response()->json(['success' => true, 'data' => $admins]);
    }

    public function update(Request $request, Country $country, User $admin): JsonResponse
    {
        if ($admin->country_id !== $country->id || $admin->role !== 'admin') {
            abort(403);
        }

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $admin->id,
        ]);

        $admin->update($request->only('name', 'phone'));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المدير.',
            'data'    => $this->formatAdmin($admin),
        ]);
    }

    public function toggle(Country $country, User $admin): JsonResponse
    {
        if ($admin->country_id !== $country->id || $admin->role !== 'admin') {
            abort(403);
        }

        $admin->update(['is_active' => ! $admin->is_active]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatAdmin($admin),
        ]);
    }

    public function destroy(Country $country, User $admin): JsonResponse
    {
        if ($admin->country_id !== $country->id || $admin->role !== 'admin') {
            abort(403);
        }

        $admin->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف المدير.']);
    }

    private function formatAdmin(User $admin): array
    {
        return [
            'id'        => $admin->id,
            'name'      => $admin->name,
            'phone'     => $admin->phone,
            'is_active' => $admin->is_active,
        ];
    }
}
