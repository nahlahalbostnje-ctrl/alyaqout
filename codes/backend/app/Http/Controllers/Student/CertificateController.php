<?php

declare(strict_types=1);

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CertificateController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Certificate::query()
            ->where('user_id', Auth::id())
            ->with(['course:id,title,thumbnail'])
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (Certificate $c) => $this->payload($c));

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function show(Certificate $certificate): JsonResponse
    {
        abort_unless((int) $certificate->user_id === (int) Auth::id(), 403);

        $certificate->loadMissing(['course:id,title,thumbnail']);

        return response()->json(['success' => true, 'data' => $this->payload($certificate)]);
    }

    /** @return array<string, mixed> */
    private function payload(Certificate $c): array
    {
        return [
            'id'           => $c->id,
            'code'         => $c->code,
            'student_name' => $c->student_name,
            'course_title' => $c->course_title,
            'course_id'    => $c->course_id,
            'thumbnail'    => $c->course?->thumbnail,
            'issued_at'    => $c->issued_at?->toIso8601String(),
            'verify_path'  => '/verify/'.$c->code,
            'meta'         => $c->meta,
        ];
    }
}
