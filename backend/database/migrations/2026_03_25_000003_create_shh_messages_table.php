<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_messages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('shh_id');
            $table->text('content_encrypted');
            $table->enum('sender_role', ['sender', 'receiver']);
            $table->enum('moderation_status', ['pending', 'passed', 'blocked', 'review'])->default('pending');
            $table->timestamp('created_at');

            $table->foreign('shh_id')->references('id')->on('shh')->cascadeOnDelete();
            $table->index(['shh_id', 'created_at'], 'idx_shh_messages_shh_id_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_messages');
    }
};
