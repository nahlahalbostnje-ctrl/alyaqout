<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CityController extends Controller
{
    /** GET /admin/cities — list cities for the authenticated admin's country */
    public function index(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $cities = City::where('country_id', $countryId)
            ->orderBy('name')
            ->get(['id', 'name', 'is_active', 'created_at']);

        return response()->json(['data' => $cities]);
    }

    /** GET /cities — public list for dropdowns (active only, scoped by country) */
    public function publicList(Request $request): JsonResponse
    {
        $countryId = $request->query('country_id') ?? Auth::user()?->country_id;

        $cities = City::where('country_id', $countryId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json(['data' => $cities]);
    }

    /** POST /admin/cities */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:100']);

        $city = City::create([
            'name'       => $data['name'],
            'country_id' => Auth::user()->country_id,
            'is_active'  => true,
        ]);

        return response()->json(['message' => 'تم إضافة المدينة', 'data' => $city], 201);
    }

    /** PUT /admin/cities/{city} */
    public function update(Request $request, City $city): JsonResponse
    {
        $this->authorizeCity($city);

        $data = $request->validate([
            'name'      => 'sometimes|string|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $city->update($data);

        return response()->json(['message' => 'تم التحديث', 'data' => $city]);
    }

    /** DELETE /admin/cities/{city} */
    public function destroy(City $city): JsonResponse
    {
        $this->authorizeCity($city);
        $city->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    private function authorizeCity(City $city): void
    {
        abort_if($city->country_id !== Auth::user()->country_id, 403, 'غير مصرح');
    }
}
