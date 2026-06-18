<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Country;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $jordan = Country::where('code', 'JO')->first();

        $users = [
            [
                'name'       => 'مدير الأردن',
                'phone'      => '00962200000000',
                'role'       => 'admin',
                'country_id' => $jordan?->id,
                'is_active'  => true,
            ],
            [
                'name'       => 'معلم تجريبي',
                'phone'      => '00962300000000',
                'role'       => 'teacher',
                'country_id' => $jordan?->id,
                'is_active'  => true,
            ],
            [
                'name'       => 'طالب تجريبي',
                'phone'      => '00962400000000',
                'role'       => 'student',
                'country_id' => $jordan?->id,
                'is_active'  => true,
            ],
            [
                'name'       => 'ولي أمر تجريبي',
                'phone'      => '00962500000000',
                'role'       => 'parent',
                'country_id' => $jordan?->id,
                'is_active'  => true,
            ],
            [
                'name'       => 'مشرف تجريبي',
                'phone'      => '00962600000000',
                'role'       => 'supervisor',
                'country_id' => $jordan?->id,
                'is_active'  => true,
            ],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(['phone' => $data['phone']], $data);
        }
    }
}
