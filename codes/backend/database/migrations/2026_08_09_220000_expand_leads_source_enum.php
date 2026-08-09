<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Expand lead sources for register / try_free without Payment Gateway flows.
        DB::statement("ALTER TABLE leads MODIFY COLUMN source ENUM('book_now','free_class','register','try_free') NOT NULL DEFAULT 'book_now'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE leads MODIFY COLUMN source ENUM('book_now','free_class') NOT NULL DEFAULT 'book_now'");
    }
};
