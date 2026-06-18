<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('chatbot_provider', 50)->default('claude');
            $table->text('chatbot_api_key')->nullable();
            $table->longText('chatbot_system_prompt')->nullable();
            $table->boolean('chatbot_enabled')->default(false);
            $table->string('whatsapp_number', 20)->nullable();
            $table->text('whatsapp_default_message')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
