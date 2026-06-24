<?php

declare(strict_types=1);

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /** GET /super-admin/branches */
    public function index(): JsonResponse
    {
        $branches = Branch::with('country')
            ->get()
            ->map(fn(Branch $b) => $this->format($b));

        // Countries without branches yet
        $existingCountryIds = Branch::pluck('country_id');
        $unbranched = Country::whereNotIn('id', $existingCountryIds)
            ->get()
            ->map(fn(Country $c) => [
                'id'          => null,
                'country_id'  => $c->id,
                'country'     => $c->name,
                'admin_name'  => null,
                'admin_email' => null,
                'admin_phone' => null,
                'is_active'   => $c->is_active,
                'notes'       => null,
                'students'    => 0,
                'teachers'    => 0,
                'courses'     => 0,
            ]);

        return response()->json([
            'branches' => $branches->concat($unbranched)->values(),
        ]);
    }

    /** POST /super-admin/branches */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'country_id'  => 'required|exists:countries,id|unique:branches,country_id',
            'admin_name'  => 'nullable|string|max:100',
            'admin_email' => 'nullable|email|max:100',
            'admin_phone' => 'nullable|string|max:30',
            'notes'       => 'nullable|string|max:1000',
            'is_active'   => 'boolean',
        ]);

        $branch = Branch::create($data);

        return response()->json(['branch' => $this->format($branch->load('country'))], 201);
    }

    /** PUT /super-admin/branches/{branch} */
    public function update(Request $request, Branch $branch): JsonResponse
    {
        $data = $request->validate([
            'admin_name'  => 'nullable|string|max:100',
            'admin_email' => 'nullable|email|max:100',
            'admin_phone' => 'nullable|string|max:30',
            'notes'       => 'nullable|string|max:1000',
            'is_active'   => 'boolean',
        ]);

        $branch->update($data);

        return response()->json(['branch' => $this->format($branch->load('country'))]);
    }

    /** PATCH /super-admin/branches/{branch}/toggle */
    public function toggle(Branch $branch): JsonResponse
    {
        $branch->update(['is_active' => !$branch->is_active]);
        return response()->json(['is_active' => $branch->is_active]);
    }

    /** DELETE /super-admin/branches/{branch} */
    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();
        return response()->json(['message' => 'تم حذف الفرع بنجاح.']);
    }

    private function format(Branch $b): array
    {
        $countryId = $b->country_id;
        $students  = \App\Models\User::where('country_id', $countryId)->where('role', 'student')->count();
        $teachers  = \App\Models\User::where('country_id', $countryId)->where('role', 'teacher')->count();

        return [
            'id'          => $b->id,
            'country_id'  => $countryId,
            'country'     => $b->country?->name ?? '',
            'admin_name'  => $b->admin_name,
            'admin_email' => $b->admin_email,
            'admin_phone' => $b->admin_phone,
            'is_active'   => $b->is_active,
            'notes'       => $b->notes,
            'students'    => $students,
            'teachers'    => $teachers,
            'courses'     => 0,
        ];
    }
}
