<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Phone helpers for storage (00…) and WhatsApp API (E.164 +…).
 * Palestine: supports both +970 and +972 prefixes for the same national number.
 */
final class PhoneNormalizer
{
    /** Demo keywords → storage format */
    private const KEYWORD_MAP = [
        'super'         => '00962100000000',
        'admin'         => '00962200000000',
        'teacher'       => '00962300000000',
        'student'       => '00962400000000',
        'parent'        => '00962500000000',
        'supervisor'    => '00962600000000',
        'ps_admin'      => '00970444444444',
        'ps_teacher'    => '00970111111111',
        'ps_student'    => '00970222222221',
        'ps_parent'     => '00970333333331',
        'ps_supervisor' => '00970555555551',
    ];

    /**
     * Normalize to DB storage format: 00XXXXXXXX
     */
    public static function toStorage(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', trim($phone)) ?? '';

        $key = strtolower($phone);
        if (isset(self::KEYWORD_MAP[$key])) {
            return self::KEYWORD_MAP[$key];
        }

        if (str_starts_with($phone, '+')) {
            $phone = '00'.substr($phone, 1);
        } elseif (preg_match('/^[1-9]/', $phone) && ! str_starts_with($phone, '00')) {
            $phone = '00'.$phone;
        }

        return $phone;
    }

    /**
     * Convert to E.164 for WaSender: +XXXXXXXX
     */
    public static function toE164(string $phone): string
    {
        $storage = self::toStorage($phone);

        if (str_starts_with($storage, '00')) {
            return '+'.substr($storage, 2);
        }

        if (str_starts_with($storage, '+')) {
            return $storage;
        }

        return '+'.$storage;
    }

    public static function isPalestine(string $phone): bool
    {
        $digits = ltrim(self::toE164($phone), '+');

        return str_starts_with($digits, '970') || str_starts_with($digits, '972');
    }

    /**
     * National subscriber number without country code (970/972).
     */
    public static function palestineNational(string $phone): ?string
    {
        if (! self::isPalestine($phone)) {
            return null;
        }

        $digits = ltrim(self::toE164($phone), '+');

        if (str_starts_with($digits, '970')) {
            return substr($digits, 3) ?: null;
        }

        if (str_starts_with($digits, '972')) {
            return substr($digits, 3) ?: null;
        }

        return null;
    }

    /**
     * Candidate E.164 numbers to try for Palestine (primary first, then alternate).
     * Order: original prefix first, then the other.
     *
     * @return list<string>
     */
    public static function palestineCandidates(string $phone): array
    {
        $national = self::palestineNational($phone);
        if ($national === null || $national === '') {
            return [self::toE164($phone)];
        }

        $e164 = self::toE164($phone);
        $primary = str_starts_with(ltrim($e164, '+'), '972')
            ? ['+972'.$national, '+970'.$national]
            : ['+970'.$national, '+972'.$national];

        return array_values(array_unique($primary));
    }

    /**
     * All E.164 candidates to check/send for any phone.
     *
     * @return list<string>
     */
    public static function whatsappCandidates(string $phone): array
    {
        if (self::isPalestine($phone)) {
            return self::palestineCandidates($phone);
        }

        return [self::toE164($phone)];
    }
}
