<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->foreignId('grade_id')->nullable()->constrained('grades')->nullOnDelete();
            $table->enum('type', ['book', 'dedication', 'past_exam', 'summary'])->default('book');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_url', 2048)->nullable();
            $table->string('cover_url', 2048)->nullable();
            $table->string('author', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['country_id', 'is_active', 'type']);
            $table->index(['country_id', 'grade_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_items');
    }
};
