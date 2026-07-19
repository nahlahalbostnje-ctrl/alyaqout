<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->enum('type', ['individual', 'family']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category', 50)->default('custom');
            $table->unsignedInteger('target_value');
            $table->unsignedInteger('current_value')->default(0);
            $table->string('unit', 50)->default('مرة');
            $table->enum('status', ['pending', 'active', 'completed', 'cancelled'])->default('active');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('ends_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['parent_id', 'status']);
            $table->index(['country_id', 'type']);
        });

        Schema::create('challenge_progress_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('amount')->default(1);
            $table->string('note', 500)->nullable();
            $table->timestamps();

            $table->index(['challenge_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_progress_logs');
        Schema::dropIfExists('challenges');
    }
};
