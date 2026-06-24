<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\PersonalItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PersonalItemController extends Controller
{
    public function index(): JsonResponse
    {
        $items = PersonalItem::where('user_id', Auth::id())
            ->where('role', 'parent')
            ->latest()
            ->get();

        return response()->json(['items' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'type'        => 'nullable|string|max:50',
            'priority'    => 'in:low,medium,high',
            'status'      => 'in:pending,in_progress,done',
            'due_date'    => 'nullable|date',
            'extra'       => 'nullable|array',
        ]);

        $item = PersonalItem::create([
            ...$data,
            'user_id' => Auth::id(),
            'role'    => 'parent',
        ]);

        return response()->json(['item' => $item], 201);
    }

    public function update(Request $request, PersonalItem $item): JsonResponse
    {
        abort_unless($item->user_id === Auth::id() && $item->role === 'parent', 403);

        $item->update($request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'type'        => 'nullable|string|max:50',
            'priority'    => 'in:low,medium,high',
            'status'      => 'in:pending,in_progress,done',
            'due_date'    => 'nullable|date',
            'extra'       => 'nullable|array',
        ]));

        return response()->json(['item' => $item]);
    }

    public function destroy(PersonalItem $item): JsonResponse
    {
        abort_unless($item->user_id === Auth::id() && $item->role === 'parent', 403);
        $item->delete();
        return response()->json(['message' => 'تم الحذف بنجاح.']);
    }
}
