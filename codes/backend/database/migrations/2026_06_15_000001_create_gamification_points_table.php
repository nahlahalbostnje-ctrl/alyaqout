<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gamification_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 50); // attend_class, submit_homework, submit_exam, complete_video
            $table->unsignedInteger('points');
            $table->string('description')->nullable(); // اسم الامتحان أو الفيديو
            $table->timestamp('earned_at')->useCurrent();

            $table->index(['student_id', 'earned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gamification_points');
    }
};
