<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Phone helpers for storage (00…) and WhatsApp API (E.164 +…).
 * Palestine: local mobiles (05…) → 00970; lookup/send also tries 972.
 * Default country today: PS (config services.phone.default_country).
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
            // Bare international digits (97059… / 97259…) or local without leading 0
            if (! self::looksInternational($phone)) {
                $local = self::applyDefaultCountryLocal($phone);
                if ($local !== null) {
                    $phone = $local;
                } else {
                    $phone = '00'.$phone;
                }
            } else {
                $phone = '00'.$phone;
            }
        } elseif (str_starts_with($phone, '0') && ! str_starts_with($phone, '00')) {
            // Local national: 0591234567
            $local = self::applyDefaultCountryLocal($phone);
            if ($local !== null) {
                $phone = $local;
            }
        }

        // Canonical Palestine storage: prefer 00970 over 00972 for the same national number
        if (self::isPalestine($phone)) {
            $national = self::palestineNational($phone);
            if ($national !== null && $national !== '') {
                return '00970'.$national;
            }
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
        $digits = ltrim(self::toE164Raw($phone), '+');

        return str_starts_with($digits, '970') || str_starts_with($digits, '972');
    }

    /**
     * National subscriber number without country code (970/972).
     */
    public static function palestineNational(string $phone): ?string
    {
        $digits = ltrim(self::toE164Raw($phone), '+');

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
     * Order: +970 first (canonical), then +972.
     *
     * @return list<string>
     */
    public static function palestineCandidates(string $phone): array
    {
        $national = self::palestineNational($phone);
        if ($national === null || $national === '') {
            return [self::toE164($phone)];
        }

        return array_values(array_unique(['+970'.$national, '+972'.$national]));
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

    /**
     * E.164 without Palestine 972→970 rewrite (avoids recursion in isPalestine).
     */
    private static function toE164Raw(string $phone): string
    {
        $phone = preg_replace('/[\s\-()]/', '', trim($phone)) ?? '';

        $key = strtolower($phone);
        if (isset(self::KEYWORD_MAP[$key])) {
            $phone = self::KEYWORD_MAP[$key];
        }

        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        if (str_starts_with($phone, '00')) {
            return '+'.substr($phone, 2);
        }

        if (str_starts_with($phone, '0') && ! str_starts_with($phone, '00')) {
            $local = self::applyDefaultCountryLocal($phone);
            if ($local !== null) {
                return '+'.substr($local, 2);
            }
        }

        if (preg_match('/^[1-9]/', $phone)) {
            if (! self::looksInternational($phone)) {
                $local = self::applyDefaultCountryLocal($phone);
                if ($local !== null) {
                    return '+'.substr($local, 2);
                }
            }

            return '+'.$phone;
        }

        return '+'.$phone;
    }

    /**
     * Numbers that already include a known country calling code.
     */
    private static function looksInternational(string $digits): bool
    {
        foreach (['970', '972', '966', '971', '962', '963', '961', '20'] as $cc) {
            if (str_starts_with($digits, $cc) && strlen($digits) >= strlen($cc) + 7) {
                return true;
            }
        }

        return strlen($digits) >= 12;
    }

    /**
     * Map local national number using default country (PS today).
     * Palestine mobile: 05XXXXXXXX or 5XXXXXXXX → 009705XXXXXXXX
     */
    private static function applyDefaultCountryLocal(string $local): ?string
    {
        $country = strtoupper((string) config('services.phone.default_country', 'PS'));
        $digits  = preg_replace('/\D/', '', $local) ?? '';

        if ($country === 'PS') {
            // 0591234567 or 591234567
            if (preg_match('/^0?5\d{8}$/', $digits)) {
                $national = ltrim($digits, '0');

                return '00970'.$national;
            }
        }

        // Future: SA, AE, JO, etc. — add branches when multi-country goes live.

        return null;
    }
}
