<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_buddy_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->unsignedInteger('break_seconds')->default(0);
            $table->text('notes')->nullable();
            $table->boolean('smart_mode')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            $table->index(['student_id', 'created_at']);
        });

        Schema::create('time_capsules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->text('message');
            $table->date('remind_at');
            $table->timestamp('opened_at')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'year', 'month']);
        });

        Schema::create('counseling_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->enum('role', ['student', 'parent']);
            $table->foreignId('student_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'answered', 'closed'])->default('pending');
            $table->text('response')->nullable();
            $table->foreignId('responded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            $table->index(['country_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('parent_academy_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category', 50)->default('general');
            $table->string('file_url', 2048)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['country_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_academy_items');
        Schema::dropIfExists('counseling_requests');
        Schema::dropIfExists('time_capsules');
        Schema::dropIfExists('study_buddy_sessions');
    }
};
