<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_feedbacks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('user_id');
            $table->enum('category', ['bug', 'idea', 'unhappy']);
            $table->text('message')->nullable();
            $table->smallInteger('happiness_score');
            $table->string('device', 100)->nullable();
            $table->string('app_version', 20)->nullable();
            $table->timestamp('created_at');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('user_id', 'idx_feedbacks_user_id');
            $table->index('category', 'idx_feedbacks_category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_feedbacks');
    }
};
