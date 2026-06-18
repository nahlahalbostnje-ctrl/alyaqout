<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationBroadcast;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $service) {}

    public function broadcast(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:200',
            'body'         => 'required|string|max:2000',
            'target_type'  => 'required|in:all,role,grade',
            'target_value' => 'nullable|string|max:60',
        ]);

        $admin     = Auth::user();
        $countryId = (int) $admin->country_id;

        $broadcast = $this->service->broadcast(
            countryId:   $countryId,
            sentBy:      (int) $admin->id,
            title:       $data['title'],
            body:        $data['body'],
            targetType:  $data['target_type'],
            targetValue: $data['target_value'] ?? null,
        );

        return response()->json([
            'message'   => 'تم إرسال الإشعار بنجاح',
            'broadcast' => $this->formatBroadcast($broadcast),
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $countryId = (int) Auth::user()->country_id;

        $broadcasts = NotificationBroadcast::where('country_id', $countryId)
            ->with('sender:id,name')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $broadcasts->map(fn ($b) => $this->formatBroadcast($b)),
            'meta' => [
                'total'        => $broadcasts->total(),
                'current_page' => $broadcasts->currentPage(),
                'last_page'    => $broadcasts->lastPage(),
            ],
        ]);
    }

    private function formatBroadcast(NotificationBroadcast $b): array
    {
        return [
            'id'               => $b->id,
            'title'            => $b->title,
            'body'             => $b->body,
            'target_type'      => $b->target_type,
            'target_value'     => $b->target_value,
            'recipients_count' => $b->recipients_count,
            'sent_by'          => $b->sender ? ['id' => $b->sender->id, 'name' => $b->sender->name] : null,
            'sent_at'          => $b->created_at?->toISOString(),
        ];
    }
}
