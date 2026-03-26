<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_audio', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('shh_id');
            $table->string('original_path', 500);
            $table->string('filtered_path', 500)->nullable();
            $table->smallInteger('duration_seconds');
            $table->string('sender_role');
            $table->string('moderation_status')->default('pending');
            $table->boolean('validated_by_sender')->default(false);
            $table->timestamp('created_at');

            $table->index('shh_id', 'idx_shh_audio_shh_id');
            $table->foreign('shh_id')->references('id')->on('shh')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_audio');
    }
};
