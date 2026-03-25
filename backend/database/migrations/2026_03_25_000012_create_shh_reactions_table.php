<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_reactions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('message_id');
            $table->ulid('user_id');
            $table->string('emoji', 10);
            $table->timestamp('created_at');

            $table->foreign('message_id')->references('id')->on('shh_messages')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['message_id', 'user_id']);
            $table->index('message_id', 'idx_reactions_message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_reactions');
    }
};
