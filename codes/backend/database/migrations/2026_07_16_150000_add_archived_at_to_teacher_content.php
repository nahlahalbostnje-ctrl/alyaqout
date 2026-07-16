<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homeworks', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('due_date');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('starts_at');
        });

        Schema::table('live_classes', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('homeworks', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });

        Schema::table('live_classes', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
