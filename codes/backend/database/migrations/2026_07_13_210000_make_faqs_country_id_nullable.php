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
        Schema::table('faqs', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
        });

        // Platform-wide FAQs (Super Admin) use NULL country_id
        DB::statement('ALTER TABLE faqs MODIFY country_id BIGINT UNSIGNED NULL');

        Schema::table('faqs', function (Blueprint $table) {
            $table->foreign('country_id')->references('id')->on('countries')->nullOnDelete();
        });

        // Promote existing country FAQs to platform-wide so landing keeps content
        DB::table('faqs')->whereNotNull('country_id')->update(['country_id' => null]);
    }

    public function down(): void
    {
        // Re-assign orphan FAQs to first country if any
        $firstCountryId = DB::table('countries')->orderBy('id')->value('id');
        if ($firstCountryId) {
            DB::table('faqs')->whereNull('country_id')->update(['country_id' => $firstCountryId]);
        }

        Schema::table('faqs', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
        });

        DB::statement('ALTER TABLE faqs MODIFY country_id BIGINT UNSIGNED NOT NULL');

        Schema::table('faqs', function (Blueprint $table) {
            $table->foreign('country_id')->references('id')->on('countries')->cascadeOnDelete();
        });
    }
};
