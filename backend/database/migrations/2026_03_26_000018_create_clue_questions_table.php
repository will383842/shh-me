<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clue_questions', function (Blueprint $table) {
            $table->id();
            $table->string('level');
            $table->string('day_range');
            $table->text('question_text');
            $table->string('locale', 5)->default('en');
            $table->boolean('is_active')->default(true);

            $table->index(['level', 'day_range', 'locale'], 'idx_clue_questions_level_range_locale');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clue_questions');
    }
};
