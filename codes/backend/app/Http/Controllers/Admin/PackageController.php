<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorize(Package $package): void
    {
        if ($package->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    public function index(): JsonResponse
    {
        $packages = Package::where('country_id', $this->countryId())
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        return response()->json(['success' => true, 'data' => $packages]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => 'required|string|max:150',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'sort_order'    => 'nullable|integer|min:0',
        ]);

        $package = Package::create([
            'country_id'    => $this->countryId(),
            'name'          => $request->name,
            'description'   => $request->description,
            'price'         => $request->price,
            'duration_days' => $request->duration_days,
            'is_active'     => true,
            'sort_order'    => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الباقة بنجاح.',
            'data'    => $package,
        ], 201);
    }

    public function update(Request $request, Package $package): JsonResponse
    {
        $this->authorize($package);

        $request->validate([
            'name'          => 'sometimes|string|max:150',
            'description'   => 'nullable|string',
            'price'         => 'sometimes|numeric|min:0',
            'duration_days' => 'sometimes|integer|min:1',
            'sort_order'    => 'nullable|integer|min:0',
        ]);

        $package->update($request->only('name', 'description', 'price', 'duration_days', 'sort_order'));

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $package]);
    }

    public function toggle(Package $package): JsonResponse
    {
        $this->authorize($package);
        $package->update(['is_active' => ! $package->is_active]);
        return response()->json(['success' => true, 'data' => $package]);
    }

    public function destroy(Package $package): JsonResponse
    {
        $this->authorize($package);
        $package->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الباقة.']);
    }
}
