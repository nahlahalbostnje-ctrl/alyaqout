<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    private const ROLES = ['super_admin', 'admin', 'teacher', 'student', 'parent', 'supervisor'];

    /**
     * Return saved overrides only — the frontend already ships sensible per-role
     * defaults, so an empty result here just means "no custom overrides yet".
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['role' => 'nullable|in:' . implode(',', self::ROLES)]);

        $query = RolePermission::query();
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $rows = $query->get(['role', 'screen', 'permission', 'allowed']);

        return response()->json(['success' => true, 'data' => $rows]);
    }

    /**
     * Bulk-save the full permission matrix for one role.
     * Body: { role, permissions: [{ screen, permission, allowed }] }
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'role'                        => 'required|in:' . implode(',', self::ROLES),
            'permissions'                 => 'required|array|min:1',
            'permissions.*.screen'        => 'required|string|max:100',
            'permissions.*.permission'    => 'required|string|max:20',
            'permissions.*.allowed'       => 'required|boolean',
        ]);

        foreach ($data['permissions'] as $row) {
            RolePermission::updateOrCreate(
                ['role' => $data['role'], 'screen' => $row['screen'], 'permission' => $row['permission']],
                ['allowed' => $row['allowed']],
            );
        }

        return response()->json(['success' => true, 'message' => 'تم حفظ الصلاحيات بنجاح.']);
    }
}
