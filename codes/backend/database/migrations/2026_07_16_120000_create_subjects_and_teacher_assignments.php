<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['curriculum', 'extracurricular'])->default('curriculum');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['country_id', 'name']);
        });

        Schema::create('subject_grade', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('grade_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['subject_id', 'grade_id']);
        });

        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['teacher_id', 'subject_id']);
        });

        Schema::create('teacher_subject_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_subject_id')->constrained('teacher_subjects')->cascadeOnDelete();
            $table->foreignId('grade_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['teacher_subject_id', 'grade_id']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('category_id')->constrained('subjects')->nullOnDelete();
            $table->foreignId('grade_id')->nullable()->after('subject_id')->constrained('grades')->nullOnDelete();
        });

        // Allow courses without legacy category during subject migration
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });
        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->change();
        });
        Schema::table('courses', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
        });

        $this->migrateFromCategories();
    }

    private function migrateFromCategories(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $categories = DB::table('categories')->orderBy('id')->get();
        // country_id + name => subject_id
        $subjectMap = [];

        foreach ($categories as $cat) {
            $key = $cat->country_id.'|'.mb_strtolower(trim($cat->name));

            if (! isset($subjectMap[$key])) {
                $subjectId = DB::table('subjects')->insertGetId([
                    'country_id' => $cat->country_id,
                    'name'       => $cat->name,
                    'type'       => 'curriculum',
                    'sort_order' => (int) $cat->sort_order,
                    'is_active'  => (bool) $cat->is_active,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $subjectMap[$key] = $subjectId;
            }

            $subjectId = $subjectMap[$key];

            $exists = DB::table('subject_grade')
                ->where('subject_id', $subjectId)
                ->where('grade_id', $cat->grade_id)
                ->exists();

            if (! $exists) {
                DB::table('subject_grade')->insert([
                    'subject_id' => $subjectId,
                    'grade_id'   => $cat->grade_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Map category -> subject for courses
            DB::table('courses')
                ->where('category_id', $cat->id)
                ->update([
                    'subject_id' => $subjectId,
                    'grade_id'   => $cat->grade_id,
                ]);
        }

        // Teacher assignments from courses
        $courseTeachers = DB::table('courses')
            ->whereNotNull('teacher_id')
            ->whereNotNull('subject_id')
            ->select('teacher_id', 'subject_id', 'grade_id')
            ->distinct()
            ->get();

        foreach ($courseTeachers as $row) {
            $tsId = DB::table('teacher_subjects')
                ->where('teacher_id', $row->teacher_id)
                ->where('subject_id', $row->subject_id)
                ->value('id');

            if (! $tsId) {
                $tsId = DB::table('teacher_subjects')->insertGetId([
                    'teacher_id' => $row->teacher_id,
                    'subject_id' => $row->subject_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($row->grade_id) {
                $gExists = DB::table('teacher_subject_grades')
                    ->where('teacher_subject_id', $tsId)
                    ->where('grade_id', $row->grade_id)
                    ->exists();

                if (! $gExists) {
                    DB::table('teacher_subject_grades')->insert([
                        'teacher_subject_id' => $tsId,
                        'grade_id'           => $row->grade_id,
                        'created_at'         => now(),
                        'updated_at'         => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('grade_id');
            $table->dropConstrainedForeignId('subject_id');
        });

        Schema::dropIfExists('teacher_subject_grades');
        Schema::dropIfExists('teacher_subjects');
        Schema::dropIfExists('subject_grade');
        Schema::dropIfExists('subjects');
    }
};
