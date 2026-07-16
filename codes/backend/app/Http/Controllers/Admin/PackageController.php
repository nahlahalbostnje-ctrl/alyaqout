<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Package;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function assertOwns(Package $package): void
    {
        if ((int) $package->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    private function format(Package $package): array
    {
        $package->loadMissing([
            'subjects:id,name,type',
            'courses:id,title,subject_id,grade_id',
        ]);

        return [
            'id'            => $package->id,
            'name'          => $package->name,
            'description'   => $package->description,
            'price'         => $package->price,
            'duration_days' => $package->duration_days,
            'is_active'     => $package->is_active,
            'sort_order'    => $package->sort_order,
            'subject_ids'   => $package->subjects->pluck('id')->values(),
            'course_ids'    => $package->courses->pluck('id')->values(),
            'subjects'      => $package->subjects->map(fn (Subject $s) => [
                'id' => $s->id, 'name' => $s->name, 'type' => $s->type,
            ])->values(),
            'courses'       => $package->courses->map(fn (Course $c) => [
                'id' => $c->id, 'title' => $c->title,
            ])->values(),
        ];
    }

    public function index(): JsonResponse
    {
        $packages = Package::where('country_id', $this->countryId())
            ->with(['subjects:id,name,type', 'courses:id,title'])
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $packages->map(fn (Package $p) => $this->format($p))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $package = Package::create([
            'country_id'    => $this->countryId(),
            'name'          => $data['name'],
            'description'   => $data['description'] ?? null,
            'price'         => $data['price'],
            'duration_days' => $data['duration_days'],
            'is_active'     => true,
            'sort_order'    => $data['sort_order'] ?? 0,
        ]);

        $this->syncScope($package, $data);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الباقة بنجاح.',
            'data'    => $this->format($package->fresh()),
        ], 201);
    }

    public function update(Request $request, Package $package): JsonResponse
    {
        $this->assertOwns($package);

        $data = $this->validated($request, partial: true);

        $package->fill(collect($data)->only([
            'name', 'description', 'price', 'duration_days', 'sort_order',
        ])->all());
        $package->save();

        if (array_key_exists('subject_ids', $data) || array_key_exists('course_ids', $data)) {
            $this->syncScope($package, [
                'subject_ids' => $data['subject_ids'] ?? $package->subjects()->pluck('subjects.id')->all(),
                'course_ids'  => $data['course_ids'] ?? $package->courses()->pluck('courses.id')->all(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم التعديل.',
            'data'    => $this->format($package->fresh()),
        ]);
    }

    public function toggle(Package $package): JsonResponse
    {
        $this->assertOwns($package);
        $package->update(['is_active' => ! $package->is_active]);

        return response()->json(['success' => true, 'data' => $this->format($package->fresh())]);
    }

    public function destroy(Package $package): JsonResponse
    {
        $this->assertOwns($package);
        $package->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الباقة.']);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, bool $partial = false): array
    {
        $nameRule = $partial ? 'sometimes|string|max:150' : 'required|string|max:150';
        $priceRule = $partial ? 'sometimes|numeric|min:0' : 'required|numeric|min:0';
        $daysRule = $partial ? 'sometimes|integer|min:1' : 'required|integer|min:1';

        return $request->validate([
            'name'          => $nameRule,
            'description'   => 'nullable|string',
            'price'         => $priceRule,
            'duration_days' => $daysRule,
            'sort_order'    => 'nullable|integer|min:0',
            'subject_ids'   => 'nullable|array',
            'subject_ids.*' => 'integer|exists:subjects,id',
            'course_ids'    => 'nullable|array',
            'course_ids.*'  => 'integer|exists:courses,id',
        ]);
    }

    /** @param array<string, mixed> $data */
    private function syncScope(Package $package, array $data): void
    {
        $countryId = $this->countryId();

        $subjectIds = collect($data['subject_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $validSubjects = Subject::where('country_id', $countryId)
            ->whereIn('id', $subjectIds)
            ->pluck('id');

        $courseIds = collect($data['course_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $validCourses = Course::where('country_id', $countryId)
            ->whereIn('id', $courseIds)
            ->pluck('id');

        $package->subjects()->sync($validSubjects);
        $package->courses()->sync($validCourses);
    }
}
