<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $coupons = Coupon::where('country_id', $countryId)
            ->with('course:id,title')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['coupons' => $coupons]);
    }

    public function store(Request $request): JsonResponse
    {
        $countryId = Auth::user()->country_id;

        $validated = $request->validate([
            'code'           => 'required|string|max:50|unique:coupons,code',
            'discount_type'  => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.01|max:100',
            'max_uses'       => 'nullable|integer|min:1',
            'expires_at'     => 'nullable|date|after:today',
            'scope'          => 'required|in:all,specific_course',
            'course_id'      => 'nullable|exists:courses,id',
        ]);

        $coupon = Coupon::create([...$validated, 'country_id' => $countryId]);

        return response()->json(['message' => 'تم إنشاء الكوبون', 'coupon' => $coupon], 201);
    }

    public function toggle(Coupon $coupon): JsonResponse
    {
        abort_if($coupon->country_id !== Auth::user()->country_id, 403);

        $coupon->update(['is_active' => ! $coupon->is_active]);

        return response()->json(['message' => $coupon->is_active ? 'تم التفعيل' : 'تم التعطيل']);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        abort_if($coupon->country_id !== Auth::user()->country_id, 403);

        $coupon->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $countryId = Auth::user()->country_id;

        $coupon = Coupon::where('code', strtoupper($request->code))
            ->where('country_id', $countryId)
            ->first();

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json(['valid' => false, 'message' => 'الكوبون غير صالح أو منتهي الصلاحية'], 422);
        }

        return response()->json([
            'valid'          => true,
            'discount_type'  => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
            'scope'          => $coupon->scope,
            'course_id'      => $coupon->course_id,
        ]);
    }
}
