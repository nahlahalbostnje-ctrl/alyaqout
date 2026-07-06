<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user        = auth()->user();
        $isSuperAdmin = $user->role === 'super_admin';

        $query = AdminActionLog::with('admin:id,name,role')
            ->orderByDesc('created_at');

        // Super admin sees all logs across all countries; others see only their own
        if (!$isSuperAdmin) {
            $query->where('admin_id', $user->id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('admin_id') && $isSuperAdmin) {
            $query->where('admin_id', (int) $request->admin_id);
        }

        $logs = $query->paginate(50);

        return response()->json(['data' => $logs]);
    }
}
