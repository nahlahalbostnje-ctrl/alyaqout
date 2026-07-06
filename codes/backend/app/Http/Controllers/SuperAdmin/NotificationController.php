<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Country;
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
            'country_id'   => 'required|integer|exists:countries,id',
            'title'        => 'required|string|max:200',
            'body'         => 'required|string|max:2000',
            'target_type'  => 'required|in:all,role,grade',
            'target_value' => 'nullable|string|max:60',
        ]);

        $broadcast = $this->service->broadcast(
            countryId:   (int) $data['country_id'],
            sentBy:      (int) Auth::id(),
            title:       $data['title'],
            body:        $data['body'],
            targetType:  $data['target_type'],
            targetValue: $data['target_value'] ?? null,
        );

        return response()->json([
            'success'   => true,
            'message'   => 'تم إرسال الإشعار بنجاح',
            'broadcast' => $this->formatBroadcast($broadcast),
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $request->validate(['country_id' => 'nullable|integer|exists:countries,id']);

        $query = NotificationBroadcast::with(['sender:id,name', 'country:id,name'])->latest();

        if ($request->filled('country_id')) {
            $query->where('country_id', $request->country_id);
        }

        $broadcasts = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $broadcasts->through(fn ($b) => $this->formatBroadcast($b)),
        ]);
    }

    private function formatBroadcast(NotificationBroadcast $b): array
    {
        return [
            'id'               => $b->id,
            'country'          => $b->country?->name,
            'title'            => $b->title,
            'body'             => $b->body,
            'target_type'      => $b->target_type,
            'target_value'     => $b->target_value,
            'recipients_count'  => $b->recipients_count,
            'sent_by'          => $b->sender ? ['id' => $b->sender->id, 'name' => $b->sender->name] : null,
            'sent_at'          => $b->created_at?->toISOString(),
        ];
    }
}
