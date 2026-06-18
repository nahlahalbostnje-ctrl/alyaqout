<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    private function countryId(): int
    {
        return (int) auth()->user()->country_id;
    }

    private function authorizeCourse(Course $course): void
    {
        if ($course->country_id !== $this->countryId()) {
            abort(403, 'غير مصرح.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Course::where('country_id', $this->countryId())
            ->with([
                'category:id,name,grade_id',
                'category.grade:id,name',
                'teacher:id,name',
            ])
            ->orderBy('sort_order')
            ->orderBy('title');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $countryId = $this->countryId();

        $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'is_free'     => 'nullable|boolean',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $category = Category::findOrFail($request->category_id);
        if ($category->country_id !== $countryId) abort(403);

        $course = Course::create([
            'country_id'  => $countryId,
            'category_id' => $request->category_id,
            'title'       => $request->title,
            'description' => $request->description,
            'price'       => $request->is_free ? 0 : ($request->price ?? 0),
            'is_free'     => $request->boolean('is_free'),
            'is_active'   => true,
            'sort_order'  => $request->sort_order ?? 0,
        ]);

        $course->load(['category:id,name,grade_id', 'category.grade:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الدورة بنجاح.',
            'data'    => $course,
        ], 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $this->authorizeCourse($course);

        $countryId = $this->countryId();

        $request->validate([
            'title'       => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'is_free'     => 'nullable|boolean',
            'sort_order'  => 'nullable|integer|min:0',
            'teacher_id'  => 'nullable|integer|exists:users,id',
        ]);

        if ($request->filled('teacher_id')) {
            $teacher = \App\Models\User::findOrFail($request->teacher_id);
            if ($teacher->country_id !== $countryId || $teacher->role !== 'teacher') {
                abort(403, 'المعلم غير موجود في دولتك.');
            }
        }

        $data = $request->only('title', 'description', 'sort_order');

        if ($request->has('teacher_id')) {
            $data['teacher_id'] = $request->teacher_id;
        }

        if ($request->has('is_free')) {
            $data['is_free'] = $request->boolean('is_free');
            $data['price']   = $data['is_free'] ? 0 : ($request->price ?? $course->price);
        } elseif ($request->has('price')) {
            $data['price'] = $request->price;
        }

        $course->update($data);

        return response()->json(['success' => true, 'message' => 'تم التعديل.', 'data' => $course]);
    }

    public function toggle(Course $course): JsonResponse
    {
        $this->authorizeCourse($course);
        $course->update(['is_active' => ! $course->is_active]);
        return response()->json(['success' => true, 'data' => $course]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $this->authorizeCourse($course);
        $course->delete();
        return response()->json(['success' => true, 'message' => 'تم حذف الدورة.']);
    }
}
