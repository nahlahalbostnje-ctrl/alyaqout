<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['phone' => '00962100000000'],
            [
                'name'       => 'Super Admin',
                'role'       => 'super_admin',
                'country_id' => null,
                'is_active'  => true,
            ]
        );
    }
}
