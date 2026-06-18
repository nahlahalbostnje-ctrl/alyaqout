<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title', 255);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['course_id', 'sort_order']);
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->string('title', 255);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['unit_id', 'sort_order']);
        });

        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('video_url');
            $table->integer('duration')->default(0)->comment('seconds');
            $table->enum('type', ['video', 'pdf', 'attachment'])->default('video');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['lesson_id', 'sort_order']);
        });

        Schema::create('video_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('video_id')->constrained('videos')->cascadeOnDelete();
            $table->boolean('completed')->default(false);
            $table->integer('watch_duration')->default(0)->comment('seconds watched');
            $table->timestamp('watched_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'video_id']);
            $table->index(['student_id', 'completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_progress');
        Schema::dropIfExists('videos');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('units');
    }
};
