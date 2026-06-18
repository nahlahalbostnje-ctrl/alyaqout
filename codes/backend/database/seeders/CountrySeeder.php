<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['name' => 'الأردن',   'code' => 'JO', 'currency' => 'JOD', 'phone_code' => '+962', 'sort_order' => 1],
            ['name' => 'السعودية', 'code' => 'SA', 'currency' => 'SAR', 'phone_code' => '+966', 'sort_order' => 2],
            ['name' => 'الإمارات', 'code' => 'AE', 'currency' => 'AED', 'phone_code' => '+971', 'sort_order' => 3],
        ];

        foreach ($countries as $country) {
            Country::firstOrCreate(['code' => $country['code']], $country);
        }
    }
}
