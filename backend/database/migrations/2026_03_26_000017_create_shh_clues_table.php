<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_clues', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('shh_id');
            $table->smallInteger('day_number');
            $table->text('question_text');
            $table->text('sender_answer')->nullable();
            $table->text('clue_text')->nullable();
            $table->string('clue_source')->nullable();
            $table->timestamp('question_sent_at')->nullable();
            $table->timestamp('answer_received_at')->nullable();
            $table->timestamp('clue_delivered_at')->nullable();
            $table->timestamp('created_at');

            $table->index('shh_id', 'idx_shh_clues_shh_id');
            $table->foreign('shh_id')->references('id')->on('shh')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_clues');
    }
};
