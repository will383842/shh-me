<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('vault_ref', 64);
            $table->enum('status', ['pending', 'active', 'expired', 'connected'])->default('pending');
            $table->smallInteger('bpm_symbolic')->default(88);
            $table->smallInteger('bpm_hour')->nullable();
            $table->smallInteger('exchange_count')->default(0);
            $table->boolean('audio_unlocked')->default(false);
            $table->boolean('has_photo')->default(false);
            $table->string('sender_first_word', 50)->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('status', 'idx_shh_status');
            $table->index('expires_at', 'idx_shh_expires_at');
            $table->index('vault_ref', 'idx_shh_vault_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh');
    }
};
