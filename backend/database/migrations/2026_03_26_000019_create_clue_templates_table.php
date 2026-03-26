<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clue_templates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('question_id');
            $table->text('template_text');
            $table->string('locale', 5)->default('en');

            $table->foreign('question_id')->references('id')->on('clue_questions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clue_templates');
    }
};
