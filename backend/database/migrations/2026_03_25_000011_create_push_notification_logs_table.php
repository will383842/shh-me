<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_notification_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('user_id');
            $table->string('type', 50);
            $table->boolean('is_system')->default(false);
            $table->timestamp('sent_at');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['user_id', 'sent_at'], 'idx_push_logs_user_sent');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_notification_logs');
    }
};
