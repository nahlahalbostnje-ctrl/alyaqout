<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /** Arabic UI filter → SQL action patterns */
    private const ACTION_GROUPS = [
        'إضافة'        => ['create', 'store', 'add', 'create_user', 'create_country', 'create_branch'],
        'تعديل'        => ['update', 'toggle', 'edit', 'update_city', 'update_country', 'update_branch', 'toggle_user', 'toggle_country'],
        'حذف'          => ['delete', 'destroy', 'delete_user', 'delete_city', 'delete_country', 'delete_branch'],
        'تسجيل دخول'   => ['login', 'impersonate'],
        'تصدير'        => ['export'],
        'اعتماد'       => ['approve'],
        'رفض'          => ['reject'],
    ];

    public function index(Request $request): JsonResponse
    {
        $user         = auth()->user();
        $isSuperAdmin = $user && $user->role === 'super_admin';

        $query = AdminActionLog::with('admin:id,name,role')
            ->orderByDesc('created_at');

        // Super admin sees all logs; country admin sees only their own
        if (! $isSuperAdmin) {
            $query->where('admin_id', $user->id);
        }

        if ($request->filled('action')) {
            $action = (string) $request->action;
            if (isset(self::ACTION_GROUPS[$action])) {
                $patterns = self::ACTION_GROUPS[$action];
                $query->where(function ($q) use ($patterns) {
                    foreach ($patterns as $i => $p) {
                        $method = $i === 0 ? 'where' : 'orWhere';
                        $q->{$method}('action', 'like', '%'.$p.'%');
                    }
                });
            } else {
                $query->where('action', $action);
            }
        }

        if ($request->filled('admin_id') && $isSuperAdmin) {
            $query->where('admin_id', (int) $request->admin_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('q')) {
            $q = trim((string) $request->q);
            $query->where(function ($builder) use ($q) {
                $builder->where('target_label', 'like', "%{$q}%")
                    ->orWhere('action', 'like', "%{$q}%")
                    ->orWhere('ip_address', 'like', "%{$q}%")
                    ->orWhere('target_type', 'like', "%{$q}%")
                    ->orWhereHas('admin', fn ($aq) => $aq->where('name', 'like', "%{$q}%"));
            });
        }

        $logs = $query->paginate((int) $request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }
}
