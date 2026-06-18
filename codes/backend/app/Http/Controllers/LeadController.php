<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_id'   => 'required|exists:countries,id',
            'student_name' => 'required|string|max:255',
            'phone'        => 'required|string|max:20',
            'grade_id'     => 'nullable|exists:grades,id',
            'school'       => 'nullable|string|max:255',
            'region'       => 'nullable|string|max:100',
            'subjects'     => 'nullable|array',
            'source'       => 'required|in:book_now,free_class',
        ]);

        Lead::create($validated);

        return response()->json(['message' => 'شكراً! سنتواصل معك قريباً 🎉'], 201);
    }
}
