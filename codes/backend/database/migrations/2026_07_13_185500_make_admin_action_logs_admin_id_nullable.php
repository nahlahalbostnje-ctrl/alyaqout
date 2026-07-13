<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Avoid doctrine/dbal: alter FK to allow null actor (system/edge cases).
        Schema::table('admin_action_logs', function ($table) {
            $table->dropForeign(['admin_id']);
        });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE admin_action_logs MODIFY admin_id BIGINT UNSIGNED NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE admin_action_logs ALTER COLUMN admin_id DROP NOT NULL');
        } else {
            // sqlite / others: recreate is overkill; leave NOT NULL if unsupported
        }

        Schema::table('admin_action_logs', function ($table) {
            $table->foreign('admin_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('admin_action_logs', function ($table) {
            $table->dropForeign(['admin_id']);
        });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE admin_action_logs MODIFY admin_id BIGINT UNSIGNED NOT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE admin_action_logs ALTER COLUMN admin_id SET NOT NULL');
        }

        Schema::table('admin_action_logs', function ($table) {
            $table->foreign('admin_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
