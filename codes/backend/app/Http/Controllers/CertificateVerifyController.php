<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;

class CertificateVerifyController extends Controller
{
    public function __construct(private readonly CertificateService $certificates) {}

    public function show(string $code): JsonResponse
    {
        $certificate = $this->certificates->findByCode($code);

        if (! $certificate) {
            return response()->json([
                'success' => false,
                'message' => 'رمز الشهادة غير صالح',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'valid'        => true,
                'code'         => $certificate->code,
                'student_name' => $certificate->student_name,
                'course_title' => $certificate->course_title,
                'issued_at'    => $certificate->issued_at?->format('Y-m-d'),
            ],
        ]);
    }
}
