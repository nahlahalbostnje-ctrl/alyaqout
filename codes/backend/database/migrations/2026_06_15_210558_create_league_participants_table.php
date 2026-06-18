<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('league_participants', function (Blueprint $table) {
            $table->foreignId('league_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            $table->primary(['league_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('league_participants');
    }
};
