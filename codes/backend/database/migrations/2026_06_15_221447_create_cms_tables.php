<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->string('slug', 100);
            $table->string('title', 255);
            $table->longText('content');
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->unique(['slug', 'country_id']);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->text('answer');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->string('platform', 50);
            $table->string('url', 500);
            $table->string('icon', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unique(['country_id', 'platform']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('pages');
    }
};
