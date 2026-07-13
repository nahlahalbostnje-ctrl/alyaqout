<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Country;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CountryController extends Controller
{
    public function index(): JsonResponse
    {
        $countries = Country::orderBy('sort_order')
            ->get()
            ->map(fn (Country $c) => $this->formatCountry($c));

        return response()->json(['success' => true, 'data' => $countries]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'code'       => 'required|string|max:5|unique:countries,code',
            'currency'   => 'required|string|max:10',
            'phone_code' => 'nullable|string|max:5',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $country = Country::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Country created successfully.',
            'data'    => $this->formatCountry($country),
        ], 201);
    }

    public function show(Country $country): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->formatCountry($country),
        ]);
    }

    public function update(Request $request, Country $country): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'sometimes|string|max:100',
            'code'       => ['sometimes', 'string', 'max:5', Rule::unique('countries', 'code')->ignore($country->id)],
            'currency'   => 'sometimes|string|max:10',
            'phone_code' => 'nullable|string|max:5',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $country->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Country updated successfully.',
            'data'    => $this->formatCountry($country),
        ]);
    }

    public function destroy(Country $country): JsonResponse
    {
        if ($country->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف الدولة لوجود مستخدمين مرتبطين بها.',
            ], 422);
        }

        if (Branch::where('country_id', $country->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف الدولة لوجود فرع مرتبط بها. احذف الفرع أولاً.',
            ], 422);
        }

        $country->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الدولة.']);
    }

    public function toggle(Country $country): JsonResponse
    {
        $country->update(['is_active' => ! $country->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Country status updated.',
            'data'    => $this->formatCountry($country),
        ]);
    }

    private function formatCountry(Country $country): array
    {
        $admins = User::where('country_id', $country->id)
            ->where('role', 'admin')
            ->whereNull('deleted_at')
            ->orderBy('created_at')
            ->get(['id', 'name', 'phone', 'email', 'is_active'])
            ->map(fn (User $u) => [
                'id'        => $u->id,
                'name'      => $u->name,
                'phone'     => $u->phone,
                'email'     => $u->email,
                'is_active' => (bool) $u->is_active,
            ])->values()->all();

        return [
            'id'         => $country->id,
            'name'       => $country->name,
            'code'       => $country->code,
            'currency'   => $country->currency,
            'phone_code' => $country->phone_code,
            'is_active'  => $country->is_active,
            'sort_order' => $country->sort_order,
            'admins'     => $admins,
        ];
    }
}
