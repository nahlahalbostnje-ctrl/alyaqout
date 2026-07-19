<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('talents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->string('display_name');
            $table->string('talent_name');
            $table->string('grade_label', 100)->nullable();
            $table->unsignedTinyInteger('age')->nullable();
            $table->text('goal')->nullable();
            $table->text('dream')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();

            $table->index(['country_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('talents');
    }
};
