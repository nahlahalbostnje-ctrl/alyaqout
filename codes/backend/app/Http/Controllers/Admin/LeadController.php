<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $query = Lead::where('country_id', $countryId)
            ->with('grade:id,name')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        $leads = $query->paginate(20);

        $stats = [
            'total'     => Lead::where('country_id', $countryId)->count(),
            'new'       => Lead::where('country_id', $countryId)->where('status', 'new')->count(),
            'contacted' => Lead::where('country_id', $countryId)->where('status', 'contacted')->count(),
            'converted' => Lead::where('country_id', $countryId)->where('status', 'converted')->count(),
        ];

        return response()->json(['leads' => $leads, 'stats' => $stats]);
    }

    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        abort_if($lead->country_id !== Auth::user()->country_id, 403);

        $request->validate(['status' => 'required|in:new,contacted,converted,lost']);

        $lead->update(['status' => $request->status]);

        return response()->json(['message' => 'تم تحديث الحالة']);
    }
}
