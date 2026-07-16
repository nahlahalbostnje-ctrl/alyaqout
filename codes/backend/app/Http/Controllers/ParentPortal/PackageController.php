<?php

declare(strict_types=1);

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackageController extends Controller
{
    /** GET /parent/packages — باقات نشطة لدولة ولي الأمر */
    public function index(): JsonResponse
    {
        $parent = Auth::user();
        $countryId = (int) $parent->country_id;

        $packages = Package::where('country_id', $countryId)
            ->where('is_active', true)
            ->with(['subjects:id,name', 'courses:id,title'])
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get()
            ->map(fn (Package $p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'description'   => $p->description,
                'price'         => $p->price,
                'duration_days' => $p->duration_days,
                'subjects'      => $p->subjects->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values(),
                'courses'       => $p->courses->map(fn ($c) => ['id' => $c->id, 'title' => $c->title])->values(),
            ]);

        return response()->json(['success' => true, 'data' => $packages]);
    }

    /** POST /parent/subscriptions/request — طلب اشتراك لابن (pending حتى يفعّله الأدمن) */
    public function requestSubscription(Request $request): JsonResponse
    {
        $parent = Auth::user();

        $data = $request->validate([
            'student_id' => 'required|integer|exists:users,id',
            'package_id' => 'required|integer|exists:packages,id',
            'notes'      => 'nullable|string|max:500',
        ]);

        $student = User::where('id', $data['student_id'])
            ->where('parent_id', $parent->id)
            ->where('role', 'student')
            ->firstOrFail();

        abort_if((int) $student->country_id !== (int) $parent->country_id, 403);

        $package = Package::where('id', $data['package_id'])
            ->where('country_id', $parent->country_id)
            ->where('is_active', true)
            ->firstOrFail();

        $existsPending = Subscription::where('student_id', $student->id)
            ->where('package_id', $package->id)
            ->where('status', 'pending')
            ->exists();

        if ($existsPending) {
            return response()->json([
                'success' => false,
                'message' => 'يوجد طلب اشتراك معلّق لنفس الباقة لهذا الابن.',
            ], 422);
        }

        $activeSame = Subscription::where('student_id', $student->id)
            ->where('package_id', $package->id)
            ->where('status', 'active')
            ->whereDate('ends_at', '>=', now()->toDateString())
            ->exists();

        if ($activeSame) {
            return response()->json([
                'success' => false,
                'message' => 'الابن لديه اشتراك نشط في هذه الباقة.',
            ], 422);
        }

        $startsAt = Carbon::today();
        $endsAt   = $startsAt->copy()->addDays((int) $package->duration_days);

        $sub = Subscription::create([
            'country_id'     => (int) $parent->country_id,
            'student_id'     => $student->id,
            'package_id'     => $package->id,
            'created_by'     => $parent->id,
            'starts_at'      => $startsAt,
            'ends_at'        => $endsAt,
            'status'         => 'pending',
            'payment_method' => 'manual',
            'payment_status' => 'pending',
            'amount_paid'    => 0,
            'notes'          => $data['notes'] ?? 'طلب من ولي الأمر',
        ]);

        $sub->load(['student:id,name', 'package:id,name,duration_days,price']);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب الاشتراك. سيظهر بعد تفعيل أدمن البلد.',
            'data'    => [
                'id'             => $sub->id,
                'student'        => $sub->student->name,
                'package'        => $sub->package->name,
                'status'         => $sub->status,
                'payment_status' => $sub->payment_status,
                'starts_at'      => $sub->starts_at->format('Y-m-d'),
                'ends_at'        => $sub->ends_at->format('Y-m-d'),
            ],
        ], 201);
    }

    /** GET /parent/subscriptions — اشتراكات أبناء ولي الأمر */
    public function subscriptions(): JsonResponse
    {
        $parent = Auth::user();

        $subs = Subscription::whereHas('student', fn ($q) => $q->where('parent_id', $parent->id))
            ->with(['student:id,name', 'package:id,name,price,duration_days'])
            ->latest()
            ->get()
            ->map(fn (Subscription $s) => [
                'id'             => $s->id,
                'student'        => ['id' => $s->student->id, 'name' => $s->student->name],
                'package'        => [
                    'id' => $s->package->id,
                    'name' => $s->package->name,
                    'price' => $s->package->price,
                ],
                'status'         => $s->status,
                'payment_status' => $s->payment_status,
                'starts_at'      => $s->starts_at->format('Y-m-d'),
                'ends_at'        => $s->ends_at->format('Y-m-d'),
            ]);

        return response()->json(['success' => true, 'data' => $subs]);
    }
}
