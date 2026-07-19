<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LibraryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user      = Auth::user();
        $countryId = (int) $user->country_id;
        $gradeId   = $user->grade_id ? (int) $user->grade_id : null;

        $request->validate([
            'type' => 'nullable|in:book,dedication,past_exam,summary',
        ]);

        $query = LibraryItem::where('country_id', $countryId)
            ->where('is_active', true)
            ->with('grade:id,name')
            ->orderBy('sort_order')
            ->orderByDesc('created_at');

        // عناصر بدون صف = لكل الصفوف؛ أو مطابقة صف الطالب
        $query->where(function ($q) use ($gradeId) {
            $q->whereNull('grade_id');
            if ($gradeId) {
                $q->orWhere('grade_id', $gradeId);
            }
        });

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $items = $query->get()->map(fn (LibraryItem $i) => [
            'id'          => $i->id,
            'type'        => $i->type,
            'title'       => $i->title,
            'description' => $i->description,
            'file_url'    => $i->file_url,
            'cover_url'   => $i->cover_url,
            'author'      => $i->author,
            'grade'       => $i->grade ? ['id' => $i->grade->id, 'name' => $i->grade->name] : null,
        ]);

        return response()->json(['items' => $items]);
    }
}
