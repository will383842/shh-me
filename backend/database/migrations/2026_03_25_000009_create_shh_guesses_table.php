<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_guesses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('shh_id');
            $table->string('guessed_identifier', 255);
            $table->smallInteger('attempt_number');
            $table->timestamp('created_at');

            $table->foreign('shh_id')->references('id')->on('shh')->cascadeOnDelete();
            $table->index('shh_id', 'idx_shh_guesses_shh_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_guesses');
    }
};
