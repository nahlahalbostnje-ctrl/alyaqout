<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->foreignId('grade_id')->nullable()->constrained()->nullOnDelete();
            $table->string('student_name', 255);
            $table->string('phone', 20);
            $table->string('school', 255)->nullable();
            $table->string('region', 100)->nullable();
            $table->json('subjects')->nullable();
            $table->enum('source', ['book_now', 'free_class'])->default('book_now');
            $table->enum('status', ['new', 'contacted', 'converted', 'lost'])->default('new');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
