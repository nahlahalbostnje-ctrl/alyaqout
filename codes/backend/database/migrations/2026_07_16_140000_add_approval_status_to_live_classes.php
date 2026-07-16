<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->after('status');
        });

        // Existing classes were already published — keep them visible
        DB::table('live_classes')->update(['approval_status' => 'approved']);
    }

    public function down(): void
    {
        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropColumn('approval_status');
        });
    }
};
